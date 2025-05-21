const { jest } = require('@jest/globals');
const { background } = require('../../scripts/background.js');

// background.test.js

describe( background, () => {
    beforeEach(() => {
        global.chrome = {
            runtime: {
                onInstalled: {
                    addListener: jest.fn(),
                },
                getURL: jest.fn((path) => `chrome-extension://extension-id/${path}`),
                lastError: null,
            },
            tabs: {
                onUpdated: {
                    addListener: jest.fn(),
                },
                create: jest.fn(),
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
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should log previous version on installation', () => {
        const onInstalledCallback = global.chrome.runtime.onInstalled.addListener.mock.calls[0][0];
        const details = { previousVersion: '1.0' };
        console.log = jest.fn();

        onInstalledCallback(details);

        expect(console.log).toHaveBeenCalledWith('previousVersion', '1.0');
    });

    test('should show page action on tab update', () => {
        const onUpdatedCallback = global.chrome.tabs.onUpdated.addListener.mock.calls[0][0];
        const tabId = 123;

        onUpdatedCallback(tabId);

        expect(global.chrome.pageAction.show).toHaveBeenCalledWith(tabId);
    });

    test('should open option.html on action click', () => {
        const onClickedCallback = global.chrome.action.onClicked.addListener.mock.calls[0][0];

        onClickedCallback();

        expect(global.chrome.tabs.create).toHaveBeenCalledWith({ url: 'chrome-extension://extension-id/option.html' });
    });

    test('should execute content.js on action click', () => {
        const onClickedCallback = global.chrome.action.onClicked.addListener.mock.calls[1][0];
        const tab = { id: 456 };

        onClickedCallback(tab);

        expect(global.chrome.scripting.executeScript).toHaveBeenCalledWith({
            target: { tabId: tab.id },
            files: ['content.js'],
        });
    });

    test('should capture tab stream on action click', () => {
        const onClickedCallback = global.chrome.action.onClicked.addListener.mock.calls[2][0];
        const tab = { id: 789 };
        const mockStream = {};

        global.chrome.tabCapture.capture.mockImplementation((options, callback) => {
            callback(mockStream);
        });

        console.error = jest.fn();
        console.log = jest.fn();
        global.alert = jest.fn();

        onClickedCallback(tab);

        expect(global.chrome.tabCapture.capture).toHaveBeenCalledWith({ audio: true, video: true }, expect.any(Function));
        expect(console.log).toHaveBeenCalledWith('Flux capturé :', mockStream);
        expect(global.alert).toHaveBeenCalledWith('Flux capturé !');
    });

    test('should handle tab capture error', () => {
        const onClickedCallback = global.chrome.action.onClicked.addListener.mock.calls[2][0];
        const tab = { id: 789 };

        global.chrome.runtime.lastError = { message: 'Capture error' };
        global.chrome.tabCapture.capture.mockImplementation((options, callback) => {
            callback(null);
        });

        console.error = jest.fn();

        onClickedCallback(tab);

        expect(console.error).toHaveBeenCalledWith('Erreur de capture :', 'Capture error');
    });
});