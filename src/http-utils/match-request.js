'use strict';

function findMatchingMethod(req, actionMappings) {
  for (const action of actionMappings) {
    const method = action.methods[req.method];
    const exactMatch = req.path === action.path && typeof method === 'function';
    if (exactMatch) {
      return method;
    }
  }
  return null;
}

function createHandler(actionMappings) {
  return async (req, res) => {
    const matchingFunction = findMatchingMethod(req, actionMappings);
    if (!matchingFunction) {
      return res.status(404).send({ message: 'Not Found' });
    }

    await matchingFunction(req, res);
  };
}

module.exports = {
  createHandler,
};
