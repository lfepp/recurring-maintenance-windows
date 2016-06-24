'use strict';

import rp from 'request-promise';

export default function createWindows() {
  const email = process.env.REQUESTER_EMAIL;
  const interval = process.env.INTERVAL;
  const duration = process.env.DURATION;
  const startTime = process.env.START_TIME;
  const description = process.env.DESCRIPTION;
  const apiKey = process.env.ACCESS_TOKEN;
  const servicesStr = process.env.SERVICES;
  const services = servicesStr.replace(/\s/g, '').split(',');

  currentWindows = getFutureWindows(services, apiKey);
}

// Function to get future maintenance windows
// TODO handle pagination
export function getFutureWindows(services, apiKey) {
  const options = {
    url: 'https://api.pagerduty.com/maintenance_windows',
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'Authorization': 'Token token=' + apiKey
    },
    body: {
      'service_ids': services,
      'filter': 'future'
    },
    json: true
  };

  return rp(options)
    .then((response) => {
      return response;
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

function dedupeWindows() {

}