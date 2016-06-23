'use strict';

import {CronJob} from 'cron';

new CronJob({
  cronTime: "0 * * * * *", // Run once per hour
  onTick: () => {
    console.log('Running cron job');
  },
  start: true,
  timeZone: "America/Los_Angeles"
})
