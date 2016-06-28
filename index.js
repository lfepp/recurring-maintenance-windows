'use strict';

var express = require('express');
var app = express();

app.use(express.static(__dirname + '/dist'));

var port = process.env.PORT || 5000;
app.listen(port);
console.log('Server listening on port ' + port);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/dist/index.html');
});

module.exports = app;
