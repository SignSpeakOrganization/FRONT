/**
 * @jest-environment jsdom
 */

import {
  saveInitialWindowSize,
  restoreWindowSize,
  stopCapture,
  startCapture,
  initPopupVideo,
  requestCameraPermission
} from '../scripts/popup-video';

let mockWindow = { id: 1, width: 800, height: 600 };

beforeEach(() => {
  document.body.innerHTML = `
    <button id="startCapture">Démarrer Capture</button>
    <video id="videoElement" autoplay playsinline></video>
    <div id="displaySign">Déplacez-moi !</div>
  `;

  global.chrome = {
    windows: {
      getCurrent: jest.fn((_, cb) => cb(mockWindow)),
      update: jest.fn()
    }
  };

  global.alert = jest.fn();
  global.console.error = jest.fn();
  jest.useFakeTimers(); // Pour setInterval
});

afterEach(() => {
  jest.clearAllTimers();
});

describe('saveInitialWindowSize', () => {
  it('should save the initial window size', async () => {
    await saveInitialWindowSize();
    expect(chrome.windows.getCurrent).toHaveBeenCalled();
  });
});

describe('restoreWindowSize', () => {
  it('should restore the saved window size', async () => {
    await saveInitialWindowSize();
    restoreWindowSize();

    expect(chrome.windows.update).toHaveBeenCalledWith(mockWindow.id, {
      width: mockWindow.width,
      height: mockWindow.height
    });
  });
});

describe('stopCapture', () => {
  it('should stop the stream and reset the interface', () => {
    const video = document.getElementById('videoElement');
    const button = document.getElementById('startCapture');
    const signDisplay = document.getElementById('displaySign');

    // Simule une capture en cours
    video.src = 'http://localhost:5000/video_feed';
    window.stream = true;

    stopCapture(video, button, signDisplay);

    expect(button.textContent).toBe("Démarrer Capture");
    expect(button.classList.contains('gradient')).toBe(false);
    expect(signDisplay.textContent).toBe("Déplacez-moi !");
  });
});

describe('startCapture', () => {
  it('should start capture and update UI', async () => {
    const video = document.getElementById('videoElement');
    const button = document.getElementById('startCapture');
    const signDisplay = document.getElementById('displaySign');

    Object.defineProperty(video, 'naturalWidth', { configurable: true, value: 640 });
    Object.defineProperty(video, 'naturalHeight', { configurable: true, value: 480 });

    await startCapture(video, button, signDisplay);

    // Simule le chargement
    if (typeof video.onload === 'function') video.onload();

    expect(video.src).toBe('http://localhost:5000/video_feed');
    expect(button.textContent).toBe("Fermer la capture");
    expect(button.classList.contains('gradient')).toBe(true);
    expect(chrome.windows.update).toHaveBeenCalledWith(expect.any(Number), {
      width: 675,
      height: 545
    });
  });
});

describe('requestCameraPermission', () => {
  it('should alert on camera permission error', async () => {
    global.console.error = jest.fn();
    navigator.mediaDevices = {
      getUserMedia: jest.fn().mockRejectedValueOnce(new Error("Refus de permission"))
    };

    await requestCameraPermission();

    expect(console.error).toHaveBeenCalledWith(
      "Autorisation caméra refusée :",
      expect.any(Error)
    );
  });
});

describe('initPopupVideo', () => {
  it('should initialize events on the startCapture button', () => {
    const button = document.getElementById('startCapture');
    const spy = jest.spyOn(button, 'addEventListener');

    initPopupVideo();

    expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
    spy.mockRestore();
  });

  it('does not crash if the elements are missing', () => {
    document.getElementById('startCapture').remove();
    document.getElementById('videoElement').remove();
    document.getElementById('displaySign').remove();

    expect(() => initPopupVideo()).not.toThrow();
  });
});
