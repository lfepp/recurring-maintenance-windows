'use strict';

import {expect} from 'chai';

import {createWindows,getFutureWindows} from '../src/worker';

// Test variables from pdt-lucas
const apiKey = 'dzvCnBwGZA3_BsB-BALU';
const servicesStr = 'P1FYDYU,PK2X17C';
const services = ['P1FYDYU','PK2X17C'];

describe('worker logic', () => {

  describe('getFutureWindows', () => {

    it('makes a successful request to PagerDuty\'s REST API for future maintenance windows', () => {
      return expect(getFutureWindows(services, apiKey)).to.eventually.like({
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
      return expect(getFutureWindows(servicesStr, apiKey)).to.be.rejectedWith(Error);
    });
  });

  describe('createWindows', () => {

  });
});
