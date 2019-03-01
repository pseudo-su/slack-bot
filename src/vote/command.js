'use strict';

const Boom = require('boom');

const { CUSTOM_VOTE_COMMAND } = require('../config');
const { createPoll } = require('./create-poll');
const { printHelp } = require('./print-help');

module.exports = {
  commandHandler,
};

const VoteCommandActions = Object.freeze({
  PRINT_HELP: 'PRINT_HELP',
  CREATE: 'CREATE',
});

async function commandHandler({ query, method, path, body }) {
  const {
    command,
    user_id: userId,
    // team_id: teamId,
    // channel_id: channelId,
  } = body;

  // Fix Mac smart quotes.
  const text = body.text ? body.text.replace(/(\u201C|\u201D)/g, '"') : '';

  const matchedArgs = parseVoteArguments({ text });

  const { action } = await determineAction({
    matchedArgs,
    command,
  });

  if (action === VoteCommandActions.PRINT_HELP) {
    return printHelp({ matchedArgs });
  }
  if (action === VoteCommandActions.CREATE) {
    return createPoll({ matchedArgs, userId });
  }
}

const VOTE_COMMAND_REGEX = /[^"\s]+|(?:"[^"]+")/g;

function parseVoteArguments({ text }) {
  const matched = text.match(VOTE_COMMAND_REGEX) || [];
  const match = matched.map(arg => arg.replace(/^"(.*)"$/, '$1'));
  // if (typeof match === 'string') {
  //   match = match.replace(/(\u201C|\u201D)/g, '"');
  //   match = match.match(/[^"\s]+|(?:"[^"]+")/g);
  // }
  return match;
}

const VALID_COMMANDS = [CUSTOM_VOTE_COMMAND, '/poll', '/vote', '/ask'].filter(
  Boolean,
);

async function determineAction({ matchedArgs, command }) {
  const shouldCreatePoll =
    matchedArgs && matchedArgs.length >= 2 && matchedArgs.length <= 101;
  if (VALID_COMMANDS.includes(command) && shouldCreatePoll) {
    return { action: VoteCommandActions.CREATE };
  }
  if (VALID_COMMANDS.includes(command)) {
    return { action: VoteCommandActions.PRINT_HELP };
  }
  throw Boom.badImplementation();
}
