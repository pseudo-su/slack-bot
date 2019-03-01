'use strict';

const { voteHandler } = require('./vote');
const { authHandler } = require('./auth');

module.exports = {
  vote: voteHandler,
  auth: authHandler,
};
