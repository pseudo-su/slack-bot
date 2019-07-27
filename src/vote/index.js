'use strict';

const {
  createHandler,
  withSlackResponse,
  // ApiResponse,
} = require('../http-utils');
const { commandHandler } = require('./command');
const { actionHandler } = require('./action');

const actionMappings = [
  {
    path: '/vote/command',
    methods: {
      POST: withSlackResponse(commandHandler),
    },
  },
  {
    path: '/vote/action',
    methods: {
      POST: withSlackResponse(actionHandler),
    },
  },
];

module.exports = {
  voteHandler: createHandler(actionMappings),
};
