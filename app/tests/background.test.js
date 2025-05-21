import '../mocks/chrome.js';
import '../scripts/background.js';

describe('Chrome extension background script', () => {
  it('should register runtime.onInstalled listener', () => {
    expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalled();
  });

  it('should register action.onClicked listener once', () => {
    expect(chrome.action.onClicked.addListener).toHaveBeenCalledTimes(1);
  });

  it('should trigger all expected chrome APIs when action is clicked', () => {
    const listener = chrome.action.onClicked.addListener.mock.calls[0][0];

    const fakeTab = { id: 42 };
    const mockStream = {};

    chrome.runtime.lastError = null;
    chrome.tabCapture.capture.mockImplementation((options, cb) => cb(mockStream));

    listener(fakeTab);

    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'chrome-extension://fakeid/option.html',
    });

    expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: 42 },
      files: ['content.js'],
    });

    expect(chrome.tabCapture.capture).toHaveBeenCalledWith(
      { audio: true, video: true },
      expect.any(Function)
    );

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(42, { type: 'STREAM_CAPTURED' });
  });

  it('should log error if tab is undefined', () => {
    const listener = chrome.action.onClicked.addListener.mock.calls[0][0];
    console.error = jest.fn();

    listener(undefined);

    expect(console.error).toHaveBeenCalledWith('Aucun onglet actif détecté.');
  });

  it('should log error if tabCapture fails', () => {
    const listener = chrome.action.onClicked.addListener.mock.calls[0][0];
    console.error = jest.fn();
    chrome.runtime.lastError = { message: 'Capture error' };

    chrome.tabCapture.capture.mockImplementation((options, cb) => cb(null));

    listener({ id: 99 });

    expect(console.error).toHaveBeenCalledWith('Erreur de capture :', 'Capture error');
  });
});
