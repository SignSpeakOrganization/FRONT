const chrome = {
  runtime: {
    onInstalled: {
      addListener: jest.fn(),
    },
    getURL: jest.fn((path) => `chrome-extension://fakeid/${path}`),
    lastError: null,
  },
  tabs: {
    onUpdated: {
      addListener: jest.fn(),
    },
    create: jest.fn(),
    sendMessage: jest.fn()
  },
  pageAction: {
    show: jest.fn(),
  },
  action: {
    onClicked: {
      addListener: jest.fn(),
    },
  },
  scripting: {
    executeScript: jest.fn(),
  },
  tabCapture: {
    capture: jest.fn(),
  },
};

global.chrome = chrome;

module.exports = chrome;
