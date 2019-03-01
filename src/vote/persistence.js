'use strict';

const { datastore } = require('../global/datastore');
const { logger } = require('../global/logger');
const kind = 'Polls';

async function saveNewPoll(poll) {
  const key = datastore.key([kind, poll.id]);
  const newPoll = Object.assign({ _closed: false, _deleted: false }, poll);
  await datastore.save({
    key,
    data: newPoll,
  });
  return newPoll;
}

// async function updatePoll(id, updateFn) {
//   const key = datastore.key([kind, id]);
//   try {
//     const [poll] = await datastore.get(key);
//     const updatedPoll = poll && (await updateFn(poll));

//     await datastore.save({
//       key,
//       data: updatedPoll,
//     });
//     return updatedPoll;
//   } catch (err) {
//     logger.error(err);
//   }
// }

// async function closePoll(id) {
//   return updatePoll(id, poll => {
//     poll._closed = true;
//     return poll;
//   });
// }

async function updatePollTransaction(id, updateFn) {
  logger.info('updatePoll', id);

  const transaction = datastore.transaction();
  const key = datastore.key([kind, id]);

  try {
    await transaction.run();
    const [poll] = await transaction.get(key);
    const updatedPoll = poll && (await updateFn(poll));
    logger.info('updatedPoll', updatedPoll);
    if (updatedPoll) {
      await transaction.save({
        key,
        data: updatedPoll,
      });
      logger.info('commit transaction', id);
      await transaction.commit();
      return updatedPoll;
    } else {
      await transaction.commit();
    }
  } catch (err) {
    logger.info('Rolling Back transaction');
    transaction.rollback();
    return null;
  }
}

async function closePollTransction(id, userId) {
  return updatePollTransaction(id, poll => {
    if (poll.user_id === userId) {
      poll._closed = true;
    }
    return poll;
  });
}

async function deletePollTransaction(id, userId) {
  return updatePollTransaction(id, poll => {
    if (poll.user_id === userId) {
      poll._deleted = true;
    }
    return poll;
  });
}

async function getPoll(id = null) {
  if (!id) throw new Error('Must provide poll ID');
  const key = datastore.key([kind, id]);
  const [poll] = await datastore.get(key);
  if (poll._closed || poll._deleted) {
    return null;
  }
  logger.info(poll);
  return poll;
}

module.exports = {
  saveNewPoll,
  getPoll,
  // updatePoll,
  // closePoll,
  updatePoll: updatePollTransaction,
  closePoll: closePollTransction,
  deletePoll: deletePollTransaction,
};
