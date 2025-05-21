/**
 * @jest-environment jsdom
 */

// 💡 On prépare le mock chrome avant de charger le module
global.chrome = {
  runtime: {
    onInstalled: {
      addListener: jest.fn()
    },
    reload: jest.fn(),
    id: 'mock-extension-id'
  },
  developerPrivate: {
    reload: jest.fn()
  }
};

describe('chromereload.js', () => {
  let initOnInstalled;
  let createLiveReloadConnection;
  let handleReloadMessage;
  let originalDateNow;

  beforeAll(async () => {
    const module = await import('../scripts/chromereload.js');
    initOnInstalled = module.initOnInstalled;
    createLiveReloadConnection = module.createLiveReloadConnection;
    handleReloadMessage = module.handleReloadMessage;
  });

  beforeEach(() => {
    originalDateNow = Date.now;
    global.Date.now = jest.fn(() => 1000000);
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.Date.now = originalDateNow;
  });

  describe('initOnInstalled', () => {
    it('should register onInstalled listener and set lastReload on trigger', () => {
      initOnInstalled();

      expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalledWith(expect.any(Function));

      const listener = chrome.runtime.onInstalled.addListener.mock.calls[0][0];
      listener();

      expect(Date.now).toHaveBeenCalled();
    });
  });

  describe('createLiveReloadConnection', () => {
    it('should create a WebSocket and set listeners', () => {
      const mockWS = {};
      global.WebSocket = jest.fn(() => mockWS);

      const connection = createLiveReloadConnection();

      expect(WebSocket).toHaveBeenCalledWith('ws://localhost:35729/livereload');
      expect(connection).toBe(mockWS);
    });

    it('should log errors from websocket', () => {
      const mockWS = {};
      global.WebSocket = jest.fn(() => mockWS);

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      createLiveReloadConnection();

      const fakeError = new Error('socket error');
      mockWS.onerror(fakeError);

      expect(logSpy).toHaveBeenCalledWith('reload connection got error:', fakeError);
      logSpy.mockRestore();
    });
  });

  describe('handleReloadMessage', () => {
    beforeEach(() => {
      global.Date.now = jest.fn(() => 2000000);
    });

    it('should call reload if "reload" command received and enough time passed', () => {
      handleReloadMessage(JSON.stringify({ command: 'reload' }));

      expect(chrome.runtime.reload).toHaveBeenCalled();
      expect(chrome.developerPrivate.reload).toHaveBeenCalledWith('mock-extension-id', { failQuietly: true });
    });

    it('should not reload if command is not "reload"', () => {
      handleReloadMessage(JSON.stringify({ command: 'ping' }));

      expect(chrome.runtime.reload).not.toHaveBeenCalled();
    });

    it('should not crash on empty data', () => {
      expect(() => handleReloadMessage(null)).not.toThrow();
    });

    it('should catch JSON parse error', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      handleReloadMessage('{ bad json }');
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });
});
