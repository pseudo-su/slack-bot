'use strict';

const { EMPTY_EMOJI_CONTENT } = require('../config');

const EMOJI_NUMBERS = [
  ':zero:',
  ':one:',
  ':two:',
  ':three:',
  ':four:',
  ':five:',
  ':six:',
  ':seven:',
  ':eight:',
  ':nine:',
  ':keycap_ten:',
];

function forLargeNumeric(maxNumber) {
  // We need this to figure out how many emoji's are in total
  const emojiCount = String(maxNumber).length;
  return new Proxy(
    {},
    {
      get: (target, name) => {
        const padded = name.padStart(emojiCount, 0);
        let result = '';
        let empty = true;
        for (let i = 0; i < padded.length; i++) {
          const char = padded.charAt(i);
          if (empty && char === '0') {
            result += EMPTY_EMOJI_CONTENT;
            continue;
          }
          empty = false;
          result += EMOJI_NUMBERS[char];
        }
        target.name = result;
        return result;
      },
    },
  );
}

function forNumbersUpToTen() {
  return EMOJI_NUMBERS.reduce(
    (acc, item, idx) => Object.assign(acc, { [idx]: item }),
    {},
  );
}

function getNumberToEmojiMapping(maxNumber) {
  if (maxNumber <= 10) return forNumbersUpToTen();
  return forLargeNumeric(maxNumber);
}

module.exports = {
  getNumberToEmojiMapping,
};
