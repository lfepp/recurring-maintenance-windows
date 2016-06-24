'use strict';

// import request from 'request';
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

function dedupeWindows() {

}
