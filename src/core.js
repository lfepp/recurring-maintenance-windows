'use strict';

import rp from 'request-promise';

// Function to get future maintenance windows
// TODO handle pagination
export function getFutureWindows(services, apiKey) {
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
      return JSON.parse(response).maintenance_windows;
    })
    .catch((error) => {
      throw new Error(error);
    });
}

// Function to queue 20 maintenance windows
export function queueWindows(services, startTime, interval, duration, description) {
  let queue = [];
  for(let i=0; i<20; i++) {
    let endTime = Date.parse(startTime);
    if(isNaN(endTime)) {
      throw new Error('Invalid START_TIME date format. Please use ISO 8601 format.');
    }
    endTime = endTime + duration * 1000;
    endTime = new Date(endTime).toISOString();
    queue[i] = {
      maintenance_window: {
        start_time: startTime,
        end_time: endTime,
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
export function dedupeWindows(currentWindows, queuedWindows) {
  for(let qw of queuedWindows) {
    for(let cw of currentWindows) {
      if(qw.maintenance_window.start_time == cw.maintenance_window.start_time && qw.maintenance_window.end_time == cw.maintenance_window.end_time) {
        queuedWindows.splice(queuedWindows.indexOf(qw), 1);
      }
    }
  }
  return queuedWindows;
}

export function createWindows(windows, apiKey, email) {
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
        console.dir(response['maintenance_windows']);
        return response['maintenance_windows'];
      })
      .catch((error) => {
        throw new Error(error);
      });
  }
}

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
