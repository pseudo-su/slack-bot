'use strict';
const { LOG_LEVEL } = require('../config');

/* eslint-disable no-console */
const logger = {
  error(...args) {
    if (
      LOG_LEVEL === 'info' ||
      LOG_LEVEL === 'debug' ||
      LOG_LEVEL === 'warn' ||
      LOG_LEVEL === 'error'
    ) {
      console.log(...args);
    }
  },
  warn(...args) {
    if (LOG_LEVEL === 'info' || LOG_LEVEL === 'debug' || LOG_LEVEL === 'warn') {
      console.log(...args);
    }
  },
  info(...args) {
    if (LOG_LEVEL === 'info' || LOG_LEVEL === 'debug') {
      console.log(...args);
    }
  },
  debug(...args) {
    if (LOG_LEVEL === 'debug') {
      console.log(...args);
    }
  },
};
/* eslint-enable no-console */
module.exports = { logger };
