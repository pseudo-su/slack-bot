'use strict';

const express = require('express');

const { voteHandler } = require('./vote');
const { authHandler } = require('./auth');

const app = express();

app.all('/vote/*', voteHandler);
app.all('/auth/*', authHandler);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  /* eslint-disable-next-line no-console */
  console.log('Started listening on port', port);
});
