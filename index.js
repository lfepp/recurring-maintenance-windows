'use strict';

import express from 'express';
const app = express();

app.use(express.static(__dirname + '/dist'));

const port = process.env.PORT || 5000;
app.listen(port);
console.log('Server listening on port ' + port);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});

export default app;
