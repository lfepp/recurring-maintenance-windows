'use strict';

import {CronJob} from 'cron';

import {createWindows} from 'worker';

new CronJob({
  cronTime: "0 * * * * *", // Run once per hour
  onTick: () => {
    createWindows();
  },
  start: true,
  timeZone: "America/Los_Angeles"
});
