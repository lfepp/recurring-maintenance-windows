var CronJob = require('cron').CronJob;
var worker = require('./compiled_core.js');

new CronJob({
  cronTime: "00 00 12 * * *", // everyday at 12:00:00
  onTick: worker.default(),
  start: true,
  timeZone: "America/Los_Angeles"
});
