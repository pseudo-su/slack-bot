'use strict';
const request = require('request');
const { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } = require('../config');
const { logger } = require('../global/logger');
const { createHandler } = require('../http-utils');

const { ApiResponse, withSlackResponse } = require('../http-utils');
const actionMappings = [
  {
    path: '/auth/redirect',
    methods: {
      GET: withSlackResponse(getAuthRedirect),
    },
  },
];

module.exports = {
  authHandler: createHandler(actionMappings),
};

function getAuthRedirect({ query }) {
  if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
    const errorMessage =
      'ERROR: misisng env vars CLIENT_ID and CLIENT_SECRET for slack-oauth authentication';
    logger.error(errorMessage);
    return new ApiResponse().statusCode(500).data(errorMessage);
  }
  const options = {
    uri:
      'https://slack.com/api/oauth.access?code=' +
      query.code +
      '&client_id=' +
      SLACK_CLIENT_ID +
      '&client_secret=' +
      SLACK_CLIENT_SECRET,
    method: 'GET',
  };
  request(options, (err, response, body) => {
    if (err) {
      logger.error('slack oauth request error:', err);
      return new ApiResponse().statusCode(403).data(err);
    }
    const jsonResp = JSON.parse(body);
    if (!jsonResp.ok) {
      logger.error(jsonResp);
      return new ApiResponse()
        .statusCode(200)
        .data('Error encountered: \n' + jsonResp);
    } else {
      logger.debug(jsonResp);
      return new ApiResponse().data('Success!');
    }
  });
}
