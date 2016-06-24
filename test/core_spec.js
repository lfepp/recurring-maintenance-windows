'use strict';

import {expect} from 'chai';

import {createWindows, getFutureWindows, queueWindows} from '../src/core';

describe('core application logic =>', () => {

  describe('getFutureWindows =>', () => {

    it('makes a successful request to PagerDuty\'s REST API for future maintenance windows', () => {
      const state = {
        apiKey: 'dzvCnBwGZA3_BsB-BALU',
        servicesStr: 'P1FYDYU,PK2X17C',
        services: ['P1FYDYU','PK2X17C']
      }
      const nextState = getFutureWindows(state.services, state.apiKey);
      return expect(nextState).to.eventually.like({
        "maintenance_windows": [
          {
            "id": "PVLDYCJ",
            "type": "maintenance_window",
            "summary": "",
            "self": "https://api.pagerduty.com/maintenance_windows/PVLDYCJ",
            "html_url": "https://pdt-lucas.pagerduty.com/maintenance_windows#/show/PVLDYCJ",
            "sequence_number": 43,
            "start_time": "2020-07-01T13:51:00-07:00",
            "end_time": "2020-07-01T14:51:00-07:00",
            "description": "",
            "services": [
              {
                "id": "PK2X17C",
                "type": "service_reference",
                "summary": "Recurring Test 2",
                "self": "https://api.pagerduty.com/services/PK2X17C",
                "html_url": "https://pdt-lucas.pagerduty.com/services/PK2X17C"
              }
            ],
            "created_by": {
              "id": "P9GJP78",
              "type": "user_reference",
              "summary": "Luke Epp",
              "self": "https://api.pagerduty.com/users/P9GJP78",
              "html_url": "https://pdt-lucas.pagerduty.com/users/P9GJP78"
            },
            "teams": []
          },
          {
            "id": "P560BLV",
            "type": "maintenance_window",
            "summary": "",
            "self": "https://api.pagerduty.com/maintenance_windows/P560BLV",
            "html_url": "https://pdt-lucas.pagerduty.com/maintenance_windows#/show/P560BLV",
            "sequence_number": 42,
            "start_time": "2020-09-01T13:50:00-07:00",
            "end_time": "2020-09-01T14:50:00-07:00",
            "description": "",
            "services": [
              {
                "id": "P1FYDYU",
                "type": "service_reference",
                "summary": "Recurring test 1",
                "self": "https://api.pagerduty.com/services/P1FYDYU",
                "html_url": "https://pdt-lucas.pagerduty.com/services/P1FYDYU"
              }
            ],
            "created_by": {
              "id": "P9GJP78",
              "type": "user_reference",
              "summary": "Luke Epp",
              "self": "https://api.pagerduty.com/users/P9GJP78",
              "html_url": "https://pdt-lucas.pagerduty.com/users/P9GJP78"
            },
            "teams": [
              {
                "id": "P9XAZQQ",
                "type": "team_reference",
                "summary": "The first team",
                "self": "https://api.pagerduty.com/teams/P9XAZQQ",
                "html_url": "https://pdt-lucas.pagerduty.com/teams/P9XAZQQ"
              }
            ]
          }
        ],
        "limit": 25,
        "offset": 0,
        "total": null,
        "more": false
      });
    });

    it('makes a request with invalid parameters to PagerDuty\'s REST API for future maintenance windows', () => {
      const state = {
        apiKey: 'dzvCnBwGZA3_BsB-BALU',
        servicesStr: 'P1FYDYU,PK2X17C',
        services: ['P1FYDYU','PK2X17C']
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
});
