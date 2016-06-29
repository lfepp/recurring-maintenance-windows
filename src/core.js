'use strict';

import rp from 'request-promise';

// TODO add an auditState function to audit whether there are already enough maintenance windows to not run this

// Function to get future maintenance windows
// TODO handle pagination
export function getFutureWindows(services, apiKey) {
  console.log('Getting future maintenance windows...');
  const options = {
    url: 'https://api.pagerduty.com/maintenance_windows?filter=future&service_ids%5B%5D=' + encodeURIComponent(services.toString()),
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'Authorization': 'Token token=' + apiKey
    }
  };

  return rp(options)
    .then((response) => {
      console.log(JSON.stringify(JSON.parse(response).maintenance_windows));
      return JSON.parse(response).maintenance_windows;
    })
    .catch((error) => {
      console.log('Error getting future windows: ' + error);
      throw new Error(error);
    });
}

// Function to queue 20 maintenance windows
// TODO make this a configurable number of queues or base it on the interval/duration
export function queueWindows(services, startTime, interval, duration, description) {
  console.log('Queueing windows...');
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
  console.log(JSON.stringify(queue));
  return queue;
}

// Function to de-dupe between the current windows in PagerDuty and the 20 queued windows
// TODO improve efficiency by dropping the older maintenance windows from currentWindows after each loop of queuedWindows
// TODO add error handling for partially-overlapping windows
export function dedupeWindows(currentWindows, queuedWindows) {
  console.log('Deduping windows...');
  for(let qw of queuedWindows) {
    for(let cw of currentWindows) {
      if(qw.maintenance_window.start_time == cw.start_time && qw.maintenance_window.end_time == cw.end_time) {
        queuedWindows.splice(queuedWindows.indexOf(qw), 1);
      }
    }
  }
  console.log(JSON.stringify(queuedWindows));
  return queuedWindows;
}

// Function to create maintenance windows
export function createWindows(windows, apiKey, email) {
  console.log('Creating windows...');
  for(let mw of windows) {
    const options = {
      url: 'https://api.pagerduty.com/maintenance_windows',
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.pagerduty+json;version=2',
        'Authorization': 'Token token=' + apiKey,
        'From': email
      },
      body: mw,
      json: true
    };

    return rp(options)
      .then((response) => {
        console.log(JSON.stringify(response['maintenance_windows']));
        return response['maintenance_windows'];
      })
      .catch((error) => {
        console.log('Error creating windows: ' + error);
        throw new Error(error);
      });
  }
}

// Function to delete one maintenance window
function deleteWindow(windowId, apiKey) {
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
      return response;
    })
    .catch((error) => {
      throw new Error(error);
    });
}

// Function to remove all maintenance windows in the future from given services
// TODO handle pagination
// TODO add better error handling
export function removeAllFutureWindows(services, apiKey) {
  let counter = 0;
  return getFutureWindows(services, apiKey)
    .then((result) => {
      function loop(services, apiKey, counter) {
        if(counter >= services.length) {
          return 204;
        }
        else {
        return deleteWindow(services[counter].id, apiKey)
          .then((response) => {
            counter++;
            return loop(services, apiKey, counter);
          })
          .catch((error) => {
            throw new Error(error);
          })
        }
      }
      return loop(result, apiKey, counter);
    })
    .catch((error) => {
      throw new Error(error);
    });
}

// Default function to run everything and create the proper windows
export default function initialize() {
  console.log('Initializing application...');
  let services = process.env.SERVICES.split(",");
  return getFutureWindows(services, process.env.ACCESS_TOKEN)
    .then((result) => {
      for(let i=0; i<services.length; i++) {
        services[i] = {
          "id": services[i],
          "type": "service_reference"
        }
      }
      const queuedWindows = queueWindows(services, process.env.START_TIME, process.env.INTERVAL, process.env.DURATION, process.env.DESCRIPTION);
      const windows = dedupeWindows(result, queuedWindows);
      return createWindows(windows, process.env.ACCESS_TOKEN, process.env.EMAIL)
        .then((result) => {
          process.env.START_TIME = windows[windows.length-1].maintenance_window.start_time;
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
