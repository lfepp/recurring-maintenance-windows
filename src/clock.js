'use strict';

import {CronJob} from 'cron';

new CronJob({
  cronTime: process.env.INTERVAL,
  onTick: () => {
    console.log('Running cron job');
  },
  start: true,
  timeZone: process.env.TIME_ZONE // NOTE: Time zone format - http://momentjs.com/timezone/
})
