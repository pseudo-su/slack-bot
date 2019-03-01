'use strict';

const { cleanEnv, bool, str } = require('envalid');

const config = cleanEnv(
  process.env,
  {
    GCP_PROJECT_ID: str(),
    SLACK_CLIENT_ID: str(),
    SLACK_CLIENT_SECRET: str(),
    SLACK_VERIFY_TOKEN: str(),
    SLACK_ENTERPRISE: bool({ default: false }),
    LOG_LEVEL: str({ default: 'info' }),
    EMPTY_EMOJI_CONTENT: str({ default: ':white_square:' }),
    CUSTOM_VOTE_COMMAND: str({ default: null }),
  },
  { strict: true },
);

module.exports = config;
