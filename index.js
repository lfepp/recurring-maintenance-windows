'use strict';

import express from 'express';
const app = express();

app.use(express.static(__dirname + '/dist'));

app.listen(process.env.PORT || 5000);
console.log('Server listening on port ' + process.env.PORT || '5000');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});

export default app;
