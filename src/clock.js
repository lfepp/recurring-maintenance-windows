var CronJob = require('cron').CronJob;
var worker = require('./compiled_core.js');

new CronJob({
  cronTime: "00 00 6,12,18 * * *", // everyday at 6:00:00, 12:00:00, and 18:00:00
  onTick: worker.default(),
  start: true,
  timeZone: "America/Los_Angeles"
});
