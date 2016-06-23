'use strict';

import request from 'request';

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

  request(options, (response) => {
    if(response.statusCode == 200) {
      return response.body;
    }
    else if(response.statusCode == 429 || response.statusCode == 408 || response.statusCode == 500) {
      setTimeout(getFutureWindows(services, apiKey), 60000); // Retry in one minute
    }
    else {
      throw new Error(response.body);
    }
  });
}

function dedupeWindows() {

}
