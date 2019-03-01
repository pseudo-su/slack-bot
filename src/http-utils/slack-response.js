'use strict';

const Boom = require('boom');
const fetch = require('node-fetch');

const { SLACK_VERIFY_TOKEN } = require('../config');

const { logger } = require('../global/logger');
const { ApiResponse } = require('./api-response');

module.exports = {
  withSlackResponse,
};

function checkVerifyToken({ verifyToken }) {
  if (SLACK_VERIFY_TOKEN && SLACK_VERIFY_TOKEN !== verifyToken) {
    throw Boom.forbidden('Invalid Verify Token');
  }
  return null;
}

function parseJson(p) {
  try {
    return JSON.parse(p);
  } catch (err) {
    return null;
  }
}

function slackRequestValues(req) {
  if (req.body.response_url && req.body.token) {
    return {
      responseUrl: req.body.response_url,
      verifyToken: req.body.token,
    };
  }
  const payload = parseJson(req.body.payload);
  return {
    responseUrl: req.body.response_url || (payload && payload.response_url),
    verifyToken: req.body.token || (payload && payload.token),
  };
}

function withSlackResponseToUrl(invoke) {
  return async (req, { prefetchData, apiResponse }) => {
    try {
      const { responseUrl, verifyToken } = slackRequestValues(req);
      logger.info(responseUrl, verifyToken, req.body);
      await checkVerifyToken({ verifyToken });
      if (req.is('json')) {
        req.payload = parseJson(req.body.payload);
      }
      logger.info(req.jsonBody);
      const postApiResponse = await invoke(req, { prefetchData, apiResponse });
      const isValidResponse = postApiResponse instanceof ApiResponse;
      if (!isValidResponse) {
        throw new Error('action function must return ApiResponse');
      }
      const { body } = postApiResponse.build();

      logger.info(body);

      const fetchResponse = await fetch(responseUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      logger.info(fetchResponse);
    } catch (err) {
      logger.error(err);
    }
  };
}

function withSlackResponse(arg = {}) {
  // Allow passing just the "invoke" function OR an object that contains invoke, invokeBefore and invokeAfter
  const invoke = typeof arg === 'function' ? arg : arg.invoke;
  const { invokeAfter = null, invokeBefore = () => ({}) } = arg;

  // IF invoke after is provided this is the "Responder" created
  const postRequestHandler =
    typeof invokeAfter === 'function'
      ? withSlackResponseToUrl(invokeAfter)
      : null;

  return async (req, res) => {
    try {
      const { verifyToken } = slackRequestValues(req);
      logger.info(verifyToken, req.body);
      await checkVerifyToken({ verifyToken });
      const prefetchData = await invokeBefore(req);
      const apiResponse = await invoke(req, { prefetchData });
      const isValidResponse = apiResponse instanceof ApiResponse;
      if (!isValidResponse) {
        throw new Error('action function must return ApiResponse');
      }
      const { statusCode, headers, body } = apiResponse.build();
      for (const headerKey of Object.keys(headers)) {
        res.set(headerKey, headers[headerKey]);
      }

      res.status(statusCode).send(body);

      if (postRequestHandler) {
        await postRequestHandler(req, { prefetchData, apiResponse });
      }
    } catch (err) {
      logger.error(err);
      if (Boom.isBoom(err)) {
        const { output } = err;
        res.status(output.statusCode);
        const headers = output.headers;

        for (const headerKey of Object.keys(headers)) {
          res.set(headerKey, headers[headerKey]);
        }

        return res.send(output.payload);
      }
      return res.status(500).send({ message: 'Internal Service Error' });
    }
  };
}
