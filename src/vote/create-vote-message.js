'use strict';

const { SLACK_ENTERPRISE } = require('../config');
const { getNumberToEmojiMapping } = require('./numbers-to-emoji');

function arrayIntoGroups(array, count = 5) {
  return array.reduce(
    (acc, item) => {
      let currentGroup = acc[acc.length - 1];
      if (currentGroup.length >= count) {
        currentGroup = [];
        acc.push(currentGroup);
      }
      currentGroup.push(item);
      return acc;
    },
    [[]],
  );
}

function spreadAttachmentActions(attachment) {
  const actionGroups = arrayIntoGroups(attachment.actions, 5);
  return actionGroups.map((actions, idx) => {
    const callback_id = attachment.callback_id;
    // Only add the normal attachment fields to the first attachment
    if (idx === 0) {
      return {
        text: attachment.text,
        fallback: attachment.fallback,
        callback_id,
        actions,
      };
    }
    // These groups are purely overflow to display because of
    // the limit slack has with actions in an attachment
    return {
      callback_id,
      fallback: '',
      actions,
    };
  });
}

function createPollAttachments(poll) {
  if (poll._closed) {
    return [
      {
        text: ':closed_lock_with_key: Poll has been closed',
      },
    ];
  }
  if (poll._deleted) {
    return [];
  }

  const iconMappings = getNumberToEmojiMapping(poll.opts.length);

  const voteActions = poll.opts.map((opt, idx) => ({
    name: 'vote-option',
    text: iconMappings[idx + 1],
    type: 'button',
    style: 'default',
    value: idx,
  }));

  const manageActions = [
    {
      name: 'poll-action',
      type: 'button',
      text: 'Close',
      style: 'danger',
      value: 'close',
      confirm: SLACK_ENTERPRISE
        ? null
        : {
            title: 'Close Poll?',
            text: 'Vote buttons will be removed, are you sure?',
            ok_text: 'Yes',
            dismiss_text: 'No',
          },
    },
    {
      name: 'poll-action',
      type: 'button',
      text: 'Delete',
      style: 'danger',
      value: 'delete',
      confirm: SLACK_ENTERPRISE
        ? null
        : {
            title: 'Delete Poll?',
            text: 'This poll will be completely removed, are you sure?',
            ok_text: 'Yes',
            dismiss_text: 'No',
          },
    },
  ].filter(Boolean);

  return [
    ...spreadAttachmentActions({
      callback_id: poll.id,
      fallback: 'Your slack client does not support voting',
      actions: voteActions,
    }),
    {
      callback_id: poll.id,
      fallback: '',
      actions: manageActions,
    },
  ];
}

function createPollText(poll) {
  if (poll._deleted) return ':white_check_mark: Poll has been deleted';
  const iconMappings = getNumberToEmojiMapping(poll.opts.length);

  const lineItems = poll.opts.map((optionName, idx) => {
    const icon = iconMappings[idx + 1];
    const votesForOption = poll.votes[idx];
    const votes = Object.keys(votesForOption)
      // we only care about displaying votes that are truthy EG: true or ISO date strings
      .filter(userId => votesForOption[userId])
      // first sort by UserID so at least the order is deterministic even if we don't store ISO strings
      .sort()
      // Sort by the "value" (date/ISO string)
      .sort(
        (aKey, bKey) =>
          new Date(votesForOption[aKey]) - new Date(votesForOption[bKey]),
      );
    const voteCount = votes.length > 0 ? `\`${votes.length}\`` : '';
    const votesList = votes.map(userId => `<@${userId}>`).join(' ');
    return [`${icon} ${optionName} ${voteCount}`, votesList].join('\n');
  });

  return [`*${poll.title}*`, '', ...lineItems].join('\n');
}

// function createPollMessage(poll, originalMessage = null) {
//   // IF poll is closed
//   if (poll._deleted) {
//     return {
//       resposne_type: 'in_channel',
//       replace_original: false,
//       text: 'Poll has been deleted',
//       attachments: [],
//     };
//   }
//   if (poll._closed) {
//     return {
//       resposne_type: 'in_channel',
//       replace_original: false,
//       text: createPollText(poll),
//       attachments: [
//         {
//           text:
//             '<!date^' +
//             'ts' +
//             '^Poll closed at {date_num} {time_secs}|sometime> by <@' +
//             'payload.user.id' +
//             '|' +
//             'payload.user.name' +
//             '>.',
//         },
//       ],
//     };
//   }
//   // IF poll is deleted
//   return {
//     response_type: 'in_channel',
//     replace_original: false,
//     text: createPollText(poll),
//     attachments: createPollAttachments(poll),
//   };
// }

module.exports = {
  // createPollMessage,
  createPollText,
  createPollAttachments,
};
