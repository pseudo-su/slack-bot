'use strict';

module.exports = {
  StubSandbox,
};

function StubSandbox(sandbox) {
  // Self overwriting Lazy getters
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters
  return {
    get logger() {
      delete this.logger;
      this.logger = logger(sandbox);
      return this.logger;
    },
    get environment() {
      delete this.environment;
      this.environment = environment(sandbox);
      return this.environment;
    },
  };
}

function logger(sandbox) {
  return {
    debug: sandbox.stub().returns(null),
    info: sandbox.stub().returns(null),
    warn: sandbox.stub().returns(null),
    error: sandbox.stub().returns(null),
  };
}

function environment(sandbox) {
  return {};
}
