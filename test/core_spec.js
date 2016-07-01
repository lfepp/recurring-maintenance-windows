'use strict';

import {expect} from 'chai';
import {accessToken} from './test_config';

import initialize, {getFutureWindows, queueWindows, dedupeWindows, createWindow, createWindows, removeAllFutureWindows} from '../src/core';

describe('core application logic =>', () => {

  describe('createWindow =>', () => {

    // TODO make this test eventually.like instead of fulfilled
    it('creates a maintenance window with valid parameters', () => {
      const state = {
        apiKey: accessToken,
        email: 'lucas@pagerduty.com',
        maintenanceWindow: {
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
        }
      };
      const nextState = createWindow(state.maintenanceWindow, state.apiKey, state.email);
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
      const nextState = createWindow(state.maintenanceWindows, state.apiKey, state.email);
      return expect(nextState).to.be.rejectedWith(Error);
    });
  });

  // TODO write failure test
  describe('createWindows =>', () => {

    it('sends an array of valid windows', () => {
      const state = {
        apiKey: accessToken,
        email: 'lucas@pagerduty.com',
        maintenanceWindow: [
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
      }
      const nextState = createWindows(state.maintenanceWindow, state.apiKey, state.email);
      expect(nextState).to.eventually.equal(200);
    });
  });

  describe('getFutureWindows =>', function() {
    this.timeout(5000);

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
        services: 'P1FY4YU,PT2X17C'
      }
      const nextState = getFutureWindows(state.services, state.apiKey);
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
            "start_time": "2020-01-01T07:00:00.000Z",
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
            "start_time": "2020-01-08T07:00:00.000Z",
            "end_time": "2020-01-08T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17C"
            ],
            "type": "maintenance_window"
          },
          {
            "start_time": "2030-06-14T07:00:00.000Z",
            "end_time": "2030-01-12T09:00:00.000Z",
            "description": "This is a recurring maintenance window",
            "services": [
              "P1FYDYU",
              "PK2X17D"
            ],
            "type": "maintenance_window"
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

  // TODO improve tests for this logic
  describe('removeAllFutureWindows =>', function() {
    this.timeout(10000);

    it('removes all future maintenance windows', () => {
      const state = {
        services: ['P1FYDYU','PK2X17C'],
        apiKey: accessToken
      };
      const nextState = removeAllFutureWindows(state.services, state.apiKey);
      return expect(nextState).to.eventually.equal(204);
    });
  });

  describe('initialize =>', function() {
    this.timeout(10000);

    it('initializes the application logic in an environment with no current windows', () => {
      process.env.SERVICES = "P1FYDYU,PK2X17C";
      process.env.START_TIME = "2020-01-01";
      process.env.INTERVAL = 604800; // one week
      process.env.DURATION = 3600; // one hour
      process.env.DESCRIPTION = "This is a maintenance window created during unit testing";
      process.env.ACCESS_TOKEN = accessToken;
      process.env.EMAIL = "lucas@pagerduty.com";
      return expect(initialize()).to.eventually.equal(200);
    });
  });
});
