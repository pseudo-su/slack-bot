'use strict';

const { cleanEnv, str, bool } = require('envalid');

function toNormalObject(config) {
  // Strict mode of envalid adds a error if you try to access unset variables
  // this causes serverless to fail because it tried to access `.constructor`
  return Object.keys(config).reduce(
    (acc, item) =>
      Object.assign(acc, {
        [item]: config[item],
      }),
    {},
  );
}

function buildEnvironment() {
  const config = cleanEnv(
    process.env,
    {
      GCP_PROJECT_ID: str(),
      SLACK_CLIENT_ID: str(),
      SLACK_CLIENT_SECRET: str(),
      SLACK_VERIFY_TOKEN: str(),
      PROJECT_BUILD_DIR: str({ default: __dirname }),
      SLACK_ENTERPRISE: bool({ default: false }),
      LOG_LEVEL: str({ default: 'info' }),
      REGION: str({ default: 'asia-northeast1' }),
      EMPTY_EMOJI_CONTENT: str({ default: '' }),
      CUSTOM_VOTE_COMMAND: str({ default: '' }),
    },
    { strict: true },
  );
  return toNormalObject(config);
}

const runtimeEnvironmentWhitelist = [
  'GCP_PROJECT_ID',
  'SLACK_CLIENT_ID',
  'SLACK_CLIENT_SECRET',
  'SLACK_VERIFY_TOKEN',
  'SLACK_ENTERPRISE',
  'LOG_LEVEL',
  'EMPTY_EMOJI_CONTENT',
  'CUSTOM_VOTE_COMMAND',
];

function runtimeEnvironment() {
  const config = buildEnvironment();
  const whitelistedConfig = {};

  runtimeEnvironmentWhitelist.forEach(key => {
    whitelistedConfig[key] = String(config[key]);
  });

  return whitelistedConfig;
}

module.exports = {
  buildEnvironment,
  runtimeEnvironment,
};
