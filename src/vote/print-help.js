'use strict';

const { ApiResponse } = require('../http-utils');

async function printHelp({ matchedArgs }) {
  const length = matchedArgs.length;
  // prettier-ignore
  const data = [
    length < 2 ? `You must provide some options to vote!` : null,
    length > 100 ? `You entered ${length - 1} options. I only allow 100 options at most.` : null,
  ].find(Boolean);
  return new ApiResponse().statusCode(200).data(data);
}
module.exports = {
  printHelp,
};
