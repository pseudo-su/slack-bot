'use strict';

// const sinon = require('sinon');
const proxyquire = require('proxyquire');

// const { StubSandbox } = require('../test/stubs');

function loadModuleUnderTest(mocked = {}) {
  const injector = proxyquire.noPreserveCache().noCallThru();
  return injector('./match-request', mocked);
}

// process.env.CLIENT_ID = 'temp';
// process.env.CLIENT_SECRET = 'temp';
// process.env.VERIFY_TOKEN = 'temp';

test('should match', async () => {
  // const sandbox = sinon.createSandbox();
  // const stubs = StubSandbox(sandbox);
  const actions = [
    {
      path: '/path',
      methods: {
        GET: () => true,
      },
    },
  ];
  const mod = loadModuleUnderTest();
  const request = {
    path: '/path',
    method: 'GET',
  };

  const handlerFn = mod._findMatchingMethod(request, actions);
  expect(await handlerFn(request)).toEqual(true);
});
