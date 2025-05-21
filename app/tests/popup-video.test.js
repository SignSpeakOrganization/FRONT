/**
 * @jest-environment jsdom
 */

import {
  saveInitialWindowSize,
  restoreWindowSize,
  stopCapture,
  startCapture,
  initPopupVideo
} from '../scripts/popup-video';

let mockWindow = { id: 1, width: 800, height: 600 };

beforeEach(() => {
  document.body.innerHTML = `
    <button id="startCapture">Démarrer Capture</button>
    <video id="videoElement" autoplay playsinline></video>
  `;

  global.chrome = {
    windows: {
      getCurrent: jest.fn((_, cb) => cb(mockWindow)),
      update: jest.fn()
    }
  };

  global.alert = jest.fn();
  global.console.error = jest.fn();
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

    const mockTrack = { stop: jest.fn() };
    const mockStream = { getTracks: () => [mockTrack] };

    //simulation d'un stream déjà actif
    video.srcObject = mockStream;

    global.navigator.mediaDevices = {
      getUserMedia: jest.fn(() => Promise.resolve(mockStream))
    };

    return startCapture(video, button).then(() => {
      stopCapture(video, button);

      expect(mockTrack.stop).toHaveBeenCalled();
      expect(video.srcObject).toBe(null);
      expect(button.textContent).toBe("Démarrer Capture");
      expect(button.classList.contains('gradient')).toBe(false);
    });
  });
});

describe('startCapture', () => {
  beforeEach(() => {
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn(() =>
        Promise.resolve({
          getTracks: () => [],
        })
      )
    };
  });

  it('should start video/audio capture and update the interface', async () => {
    const video = document.getElementById('videoElement');
    const button = document.getElementById('startCapture');

    // Mock du flux média
    const mockStream = {
      getTracks: () => []
    };
    navigator.mediaDevices.getUserMedia.mockResolvedValueOnce(mockStream);

    // Mock des dimensions vidéo via defineProperty
    Object.defineProperty(video, 'videoWidth', { configurable: true, value: 640 });
    Object.defineProperty(video, 'videoHeight', { configurable: true, value: 480 });

    await startCapture(video, button);

    // Déclenche manuellement l’événement onloadedmetadata
    video.onloadedmetadata();

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      video: true,
      audio: true
    });

    expect(button.textContent).toBe("Fermer la capture");
    expect(button.classList.contains('gradient')).toBe(true);
    expect(chrome.windows.update).toHaveBeenCalledWith(expect.any(Number), {
      width: 640,
      height: 580 // 480 + 100 extraHeight
    });
  });


  it('should display an alert in case of an error', async () => {
    navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(new Error("Refus de permission"));

    const video = document.getElementById('videoElement');
    const button = document.getElementById('startCapture');

    await startCapture(video, button);

    expect(alert).toHaveBeenCalledWith("Erreur : Refus de permission");
    expect(console.error).toHaveBeenCalled();
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

    expect(() => initPopupVideo()).not.toThrow();
  });
});
