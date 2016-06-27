'use strict';

import {expect} from 'chai';
import {accessToken} from './test_config';

import {getFutureWindows, queueWindows, dedupeWindows, createWindows} from '../src/core';

describe('core application logic =>', () => {

  describe('createWindows =>', () => {

    it('creates a maintenance window with valid parameters', () => {
      const state = {
        apiKey: accessToken,
        email: 'lucas@pagerduty.com',
        maintenanceWindows: [
          {
            "maintenance_window": {
              "start_time": "2020-01-01T00:00:00-0700",
              "end_time": "2020-01-01T09:00:00.000Z",
              "description": "This is a recurring maintenance window",
              "services": [
                {
                  "id": "P1FYDYU",
                  "type": "service_reference"
                },
                {
                  "id": "PK2X17C",
                  "type": "service_reference"
                }
              ],
              "type": "maintenance_window"
            }
          },
          {
            "maintenance_window": {
              "start_time": "2020-01-15T07:00:00.000Z",
              "end_time": "2020-01-15T09:00:00.000Z",
              "description": "This is a recurring maintenance window",
              "services": [
                {
                  "id": "P1FYDYU",
                  "type": "service_reference"
                },
                {
                  "id": "PK2X17C",
                  "type": "service_reference"
                }
              ],
              "type": "maintenance_window"
            }
          }
        ]
      };
      const nextState = createWindows(state.maintenanceWindows, state.apiKey, state.email);
      return expect(nextState).to.be.fulfilled;
    });

    it('attempts to create a window with invalid parameters', () => {
      const state = {
        apiKey: accessToken,
        email: 'lucas@pagerduty.com',
        maintenanceWindows: [
          {
            "maintenance_window": {
              "start_time": "2020-01-15T07:00:00.000Z",
              "end_time": "2020-01-15T09:00:00.000Z",
              "description": "This is a recurring maintenance window",
              "services": [
                "P1FYDYU",
                "PK2X17C"
              ],
              "type": "maintenance_window"
            }
          }
        ]
      };
      const nextState = createWindows(state.maintenanceWindows, state.apiKey, state.email);
      return expect(nextState).to.be.rejectedWith(Error);
    });
  });

  describe('getFutureWindows =>', () => {

    it('makes a successful request to PagerDuty\'s REST API for future maintenance windows', () => {
      const state = {
        apiKey: accessToken,
        services: ['P1FYDYU','PK2X17C']
      }
      const nextState = getFutureWindows(state.services, state.apiKey);
      return expect(nextState).to.be.fulfilled;
    });

    it('makes a request with invalid parameters to PagerDuty\'s REST API for future maintenance windows', () => {
      const state = {
        apiKey: accessToken,
        servicesStr: 'P1FYDYU,PK2X17C'
      }
      const nextState = getFutureWindows(state.servicesStr, state.apiKey);
      return expect(nextState).to.be.rejectedWith(Error);
    });
  });

  describe('queueWindows =>', () => {

    it('queues 20 maintenance windows with valid parameters', () => {
      const state = {
        services: ['P1FYDYU','PK2X17C'],
        startTime: '2020-01-01T00:00:00-0700',
        interval: '604800', // one week
        duration: '7200', // two hours
        description: 'This is a recurring maintenance window'
      }
      const nextState = queueWindows(state.services, state.startTime, state.interval, state.duration, state.description);
      expect(nextState).to.like([
        {
          "maintenance_window": {
            "start_time": "2020-01-01T00:00:00-0700",
            "end_time": "2020-01-01T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-01-08T07:00:00.000Z",
            "end_time": "2020-01-08T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-01-15T07:00:00.000Z",
            "end_time": "2020-01-15T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-01-22T07:00:00.000Z",
            "end_time": "2020-01-22T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-01-29T07:00:00.000Z",
            "end_time": "2020-01-29T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-02-05T07:00:00.000Z",
            "end_time": "2020-02-05T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-02-12T07:00:00.000Z",
            "end_time": "2020-02-12T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-02-19T07:00:00.000Z",
            "end_time": "2020-02-19T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-02-26T07:00:00.000Z",
            "end_time": "2020-02-26T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-03-04T07:00:00.000Z",
            "end_time": "2020-03-04T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-03-11T07:00:00.000Z",
            "end_time": "2020-03-11T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-03-18T07:00:00.000Z",
            "end_time": "2020-03-18T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-03-25T07:00:00.000Z",
            "end_time": "2020-03-25T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-04-01T07:00:00.000Z",
            "end_time": "2020-04-01T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-04-08T07:00:00.000Z",
            "end_time": "2020-04-08T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-04-15T07:00:00.000Z",
            "end_time": "2020-04-15T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-04-22T07:00:00.000Z",
            "end_time": "2020-04-22T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-04-29T07:00:00.000Z",
            "end_time": "2020-04-29T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-05-06T07:00:00.000Z",
            "end_time": "2020-05-06T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-05-13T07:00:00.000Z",
            "end_time": "2020-05-13T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        }
      ]);
    });

    it('attempts to queue windows with an invalid date format', () => {
      const state = {
        services: ['P1FYDYU','PK2X17C'],
        startTime: '1/1/20 PDT at midnight',
        interval: '604800', // one week
        duration: '7200', // two hours
        description: 'This is a recurring maintenance window'
      }
      const nextState = () => {
        queueWindows(state.services, state.startTime, state.interval, state.duration, state.description);
      }
      return expect(nextState).to.throw(Error);
    });
  });

  describe('dedupeWindows =>', () => {

    it('de-duplicates two arrays with maintenance windows', () => {
      const state = {
        arr1: [
          {
            "maintenance_window": {
              "start_time": "2020-01-01T00:00:00-0700",
              "end_time": "2020-01-01T09:00:00.000Z",
              "description": "This is a recurring maintenance window",
              "services": [
                "P1FYDYU",
                "PK2X17C"
              ],
              "type": "maintenance_window"
            }
          },
          {
            "maintenance_window": {
              "start_time": "2020-01-08T07:00:00.000Z",
              "end_time": "2020-01-08T09:00:00.000Z",
              "description": "This is a recurring maintenance window",
              "services": [
                "P1FYDYU",
                "PK2X17C"
              ],
              "type": "maintenance_window"
            }
          },
          {
            "maintenance_window": {
              "start_time": "2020-01-15T07:00:00.000Z",
              "end_time": "2020-01-15T09:00:00.000Z",
              "description": "This is a recurring maintenance window",
              "services": [
                "P1FYDYU",
                "PK2X17C"
              ],
              "type": "maintenance_window"
            }
          }
        ],
        arr2: [
          {
            "maintenance_window": {
              "start_time": "2020-01-08T07:00:00.000Z",
              "end_time": "2020-01-08T09:00:00.000Z",
              "description": "This is a recurring maintenance window",
              "services": [
                "P1FYDYU",
                "PK2X17C"
              ],
              "type": "maintenance_window"
            }
          },
          {
            "maintenance_window": {
              "start_time": "2030-06-14T07:00:00.000Z",
              "end_time": "2030-01-12T09:00:00.000Z",
              "description": "This is a recurring maintenance window",
              "services": [
                "P1FYDYU",
                "PK2X17D"
              ],
              "type": "maintenance_window"
            }
          }
        ]
      }
      const nextState = dedupeWindows(state.arr2, state.arr1);
      expect(nextState).to.deep.equal([
        {
          "maintenance_window": {
            "start_time": "2020-01-01T00:00:00-0700",
            "end_time": "2020-01-01T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        },
        {
          "maintenance_window": {
            "start_time": "2020-01-15T07:00:00.000Z",
            "end_time": "2020-01-15T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          }
        }
      ]);
    });
  });
});
