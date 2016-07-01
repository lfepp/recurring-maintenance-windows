'use strict';

import rp from 'request-promise';
import fs from 'fs';

// TODO add an auditState function to audit whether there are already enough maintenance windows to not run this

// Function to get future maintenance windows
export function getFutureWindows(services, apiKey, output=[], offset=0) {
  const options = {
    url: 'https://api.pagerduty.com/maintenance_windows?filter=future&service_ids%5B%5D=' + encodeURIComponent(services.toString()) + '&limit=100&offset=' + offset,
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'Authorization': 'Token token=' + apiKey
    }
  };

  return rp(options)
    .then((response) => {
      const res = JSON.parse(response);
      output = output.concat(res.maintenance_windows);
      if(res.more) {
        return getFutureWindows(services, apiKey, output, offset + 100);
      }
      else {
        return output;
      }
    })
    .catch((error) => {
      console.log('Error getting future windows: ' + error);
      throw new Error(error);
    });
}

// Function to queue 20 maintenance windows
// TODO make this a configurable number of queues or base it on the interval/duration
export function queueWindows(services, startTime, interval, duration, description) {
  let queue = [];
  for(let i=0; i<20; i++) {
    startTime = new Date(Date.parse(startTime));
    if(isNaN(startTime)) {
      throw new Error('Invalid START_TIME date format. Please use ISO 8601 format.');
    }
    let endTime = new Date(startTime.getTime() + duration * 1000);
    queue[i] = {
      maintenance_window: {
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        description: description,
        services: services,
        type: 'maintenance_window'
      }
    }
    startTime = new Date(Date.parse(startTime) + interval * 1000).toISOString();
  }
  return queue;
}

// Function to de-dupe between the current windows in PagerDuty and the 20 queued windows
// TODO improve efficiency by dropping the older maintenance windows from currentWindows after each loop of queuedWindows
// TODO add error handling for partially-overlapping windows
// FIXME not sure it's deduping properly
export function dedupeWindows(currentWindows, queuedWindows) {
  for(let qw of queuedWindows) {
    for(let cw of currentWindows) {
      if(Date.parse(qw.maintenance_window.start_time) == Date.parse(cw.start_time) && Date.parse(qw.maintenance_window.end_time) == Date.parse(cw.end_time)) {
        queuedWindows.splice(queuedWindows.indexOf(qw), 1);
      }
    }
  }
  return queuedWindows;
}

// Function to create a maintenance window
export function createWindow(maintenanceWindow, apiKey, email) {
  const options = {
    url: 'https://api.pagerduty.com/maintenance_windows',
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'Authorization': 'Token token=' + apiKey,
      'From': email
    },
    body: maintenanceWindow,
    json: true
  };

  return rp(options)
    .then((response) => {
      console.log('Successfully created a maintenance window');
    })
    .catch((error) => {
      console.log('Error creating windows: ' + error);
      throw new Error(error);
    });
}

// Function to loop through createWindow for an array of maintenance windows
export function createWindows(windows, apiKey, email, counter=0) {
  if(counter >= windows.length) {
    return 200;
  }
  else {
    return createWindow(windows[counter], apiKey, email)
      .then((response) => {
        counter++;
        return createWindows(windows, apiKey, email, counter);
      })
      .catch((error) => {
        throw new Error(error);
      })
  }
}

// Function to delete one maintenance window
function deleteWindow(windowId, apiKey) {
  console.log('Deleting: ' + windowId);
  const options = {
    url: 'https://api.pagerduty.com/maintenance_windows/' + windowId,
    method: 'DELETE',
    headers: {
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'Authorization': 'Token token=' + apiKey
    }
  };

  return rp(options)
    .then((response) => {
      console.log('Deleted window successfully');
    })
    .catch((error) => {
      throw new Error(error);
    });
}

// Function to remove all maintenance windows in the future from given services
// TODO use recursion
// TODO handle pagination
// TODO add better error handling
export function removeAllFutureWindows(services, apiKey, counter=0) {
  return getFutureWindows(services, apiKey)
    .then((response) => {
      function loop(windows, apiKey, counter) {
        if(counter >= windows.length) {
          return 204;
        }
        else {
          return deleteWindow(windows[counter].id, apiKey)
            .then((response) => {
              counter++;
              return loop(windows, apiKey, counter);
            })
            .catch((error) => {
              throw new Error(error);
            })
        }
      }
      return loop(response, apiKey, counter);
    })
    .catch((error) => {
      throw new Error(error);
    });
}

// Default function to run everything and create the proper windows
// FIXME the final window is coming in 1 hour behind
export default function initialize() {
  console.log('Initializing application logic...');
  // Determine whether or not start_time.txt exists
  try {
    fs.accessSync('src/start_time.txt');
  }
  catch(error) {
    fs.writeFileSync('src/start_time.txt', process.env.START_TIME, { "flags": "w" });
  }
  const startTime = new Date(Date.parse(fs.readFileSync('src/start_time.txt')));
  console.log(startTime.toISOString());
  let services = process.env.SERVICES.split(",");
  return getFutureWindows(services, process.env.ACCESS_TOKEN)
    .then((result) => {
      for(let i=0; i<services.length; i++) {
        services[i] = {
          "id": services[i],
          "type": "service_reference"
        }
      }
      const queuedWindows = queueWindows(services, startTime, process.env.INTERVAL, process.env.DURATION, process.env.DESCRIPTION);
      const windows = dedupeWindows(result, queuedWindows);
      return createWindows(windows, process.env.ACCESS_TOKEN, process.env.EMAIL)
        .then((result) => {
          fs.writeFileSync('src/start_time.txt', windows[windows.length-1].maintenance_window.start_time, { "flags": "w" });
          return 200;
        })
        .catch((error) => {
          throw new Error(error);
        });
    })
    .catch((error) => {
      throw new Error(error);
    });
}
