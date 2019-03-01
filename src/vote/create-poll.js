'use strict';

const uuidv4 = require('uuid/v4');
const { logger } = require('../global/logger');
const { ApiResponse } = require('../http-utils');

const { saveNewPoll } = require('./persistence');
const {
  createPollAttachments,
  createPollText,
} = require('./create-vote-message');

module.exports = {
  createPoll,
};

async function createPoll({ matchedArgs, userId }) {
  const newPoll = {
    id: uuidv4(),
    user_id: userId,
    title: matchedArgs[0],
    opts: [],
    votes: [],
  };

  for (let i = 1; i < matchedArgs.length; i++) {
    newPoll.opts[i - 1] = matchedArgs[i];
    newPoll.votes[i - 1] = {};
  }
  const poll = await saveNewPoll(newPoll);

  logger.info(poll);

  // Display in channel.
  const output = {
    response_type: 'in_channel',
    replace_original: false,
    text: createPollText(poll),
    attachments: createPollAttachments(poll),
  };

  logger.debug('create-poll', JSON.stringify(poll));

  return new ApiResponse().data(output);
}
