'use strict';

var express = require('express');
var app = express();
var core = require(__dirname + '/src/compiled_core.js');

app.use(express.static(__dirname + '/dist'));

var port = process.env.PORT || 5000;
app.listen(port);
console.log('Server listening on port ' + port);

app.get('/', function(req, res) {
  core.initialize();
  res.sendFile(__dirname + '/dist/index.html');
});

module.exports = app;
