'use strict';

const Boom = require('boom');
const { logger } = require('../global/logger');
const { ApiResponse } = require('../http-utils');
const { closePoll, updatePoll, deletePoll } = require('./persistence');
const {
  createPollText,
  createPollAttachments,
} = require('./create-vote-message');

const VoteActions = Object.freeze({
  VOTE: 'VOTE',
  CLOSE: 'CLOSE',
  DELETE: 'DELETE',
});

async function determineAction({ actions = [] }) {
  const [action = null] = actions;
  if (!action) {
    throw Boom.badRequest('ERROR: Missing action field in received payload.');
  }
  if (action.name === 'poll-action' && action.value === 'close') {
    return { actionType: VoteActions.CLOSE, data: action };
  }
  if (action.name === 'poll-action' && action.value === 'delete') {
    return { actionType: VoteActions.DELETE, data: action };
  }
  if (action.name === 'vote-option') {
    return { actionType: VoteActions.VOTE, data: action };
  }
  throw Boom.badRequest(`ERROR: unknown action "${action.name}"`);
}

function parseJson(p) {
  try {
    return JSON.parse(p);
  } catch (err) {
    throw Boom.badData();
  }
}

async function actionHandler({ query, method, path, body }) {
  const payload = parseJson(body.payload);
  const user = payload.user;
  // const existingPoll = await getPoll(payload.callback_id);
  // if (!poll) {
  //   throw Boom.badRequest('This poll has already been closed');
  // }

  const { actionType, data: action } = await determineAction({
    actions: payload.actions,
  });

  logger.info(actionType, action);

  if (actionType === VoteActions.CLOSE) {
    const updatedPoll = await closePoll(payload.callback_id, user.id);
    const output = {
      response_type: 'in_channel',
      replace_original: true,
      text: createPollText(updatedPoll),
      attachments: createPollAttachments(updatedPoll),
    };
    return new ApiResponse().statusCode(200).data(output);
  }

  if (actionType === VoteActions.DELETE) {
    const updatedPoll = await deletePoll(payload.callback_id, user.id);
    const output = {
      response_type: 'in_channel',
      replace_original: true,
      text: createPollText(updatedPoll),
      attachments: createPollAttachments(updatedPoll),
    };
    return new ApiResponse().statusCode(200).data(output);
  }

  if (actionType === VoteActions.VOTE) {
    const updatedPoll = await updatePoll(payload.callback_id, poll =>
      voteOnPoll({
        poll,
        action,
        user,
      }),
    );

    const output = {
      response_type: 'in_channel',
      replace_original: true,
      text: createPollText(updatedPoll),
      attachments: createPollAttachments(updatedPoll),
    };
    return new ApiResponse().statusCode(200).data(output);
  }

  // poll.votes[action.value][payload.user.id] = true;
  // payload.original_message.text = createVoteMessage(poll);
  // return new ApiResponse().statusCode(200).data(payload.original_message);
  throw Boom.notAcceptable('Not a valid action');
}

async function voteOnPoll({ poll, action, user }) {
  // TODO: different types of poll might have different state changes when voting
  const clicked = Number(action.value);

  logger.info(action.value, poll.votes, poll.opts);

  poll.votes[clicked][user.id] = !poll.votes[clicked][user.id];

  return poll;
}

module.exports = {
  actionHandler,
};
