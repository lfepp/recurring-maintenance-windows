'use strict';

import rp from 'request-promise';

export default function createWindows() {
  const email = process.env.REQUESTER_EMAIL;
  const interval = process.env.INTERVAL;
  const duration = process.env.DURATION;
  const start_time = process.env.START_TIME;
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
export function queueWindows(services, start_time, interval, duration, description) {
  let queue = [];
  let end_time = Date.parse(start_time);
  if(isNaN(end_time)) {
    throw new Error("Invalid START_TIME date format. Please use ISO 8601 format.");
  }
  end_time = end_time + (duration * 1000);
  for(let i=0; i<20; i++) {
    queue[i] = {
      "maintenance_window": {
        "start_time": start_time,
        "end_time": end_time.toISOString(),
        "description": description,
        "services": services,
        "type": "maintenance_window"
      }
    }
  }
  return queue;
}

function dedupeWindows() {

}
