/**
 * @jest-environment jsdom
 */

import {
  getVideoInputDevices,
  checkAndAlertAvailableCameras
} from '../scripts/content'; 

describe('getVideoInputDevices', () => {
  beforeEach(() => {
    global.navigator.mediaDevices = {
      enumerateDevices: jest.fn()
    };
  });

  it('should return only devices of kind "videoinput"', async () => {
    const mockDevices = [
      { kind: 'audioinput', label: 'Microphone' },
      { kind: 'videoinput', label: 'Webcam HD' },
      { kind: 'videoinput', label: 'USB Camera' },
      { kind: 'audiooutput', label: 'Haut-parleur' }
    ];

    navigator.mediaDevices.enumerateDevices.mockResolvedValue(mockDevices);

    const result = await getVideoInputDevices();

    expect(result).toHaveLength(2);
    expect(result.every(d => d.kind === 'videoinput')).toBe(true);
  });

  it('should throw an error if enumerateDevices fails', async () => {
    navigator.mediaDevices.enumerateDevices.mockRejectedValue(
      new Error('Accès refusé')
    );

    await expect(getVideoInputDevices()).rejects.toThrow(
      'Impossible de récupérer les périphériques : Accès refusé'
    );
  });
});

describe('checkAndAlertAvailableCameras', () => {
  beforeEach(() => {
    global.console.log = jest.fn();
    global.console.error = jest.fn();
    global.alert = jest.fn();
    global.navigator.mediaDevices = {
      enumerateDevices: jest.fn()
    };
  });

  it('should log camera list when at least one is found', async () => {
    navigator.mediaDevices.enumerateDevices.mockResolvedValue([
      { kind: 'videoinput', label: 'Webcam HD' }
    ]);

    await checkAndAlertAvailableCameras();

    expect(console.log).toHaveBeenCalledWith(
      'Caméras détectées :',
      expect.arrayContaining([{ kind: 'videoinput', label: 'Webcam HD' }])
    );
    expect(alert).not.toHaveBeenCalled();
  });

  it('should alert when no camera is found', async () => {
    navigator.mediaDevices.enumerateDevices.mockResolvedValue([]);

    await checkAndAlertAvailableCameras();

    expect(alert).toHaveBeenCalledWith('Aucune caméra détectée !');
  });

  it('should alert and log an error if device access fails', async () => {
    navigator.mediaDevices.enumerateDevices.mockRejectedValue(
      new Error('Erreur d’accès')
    );

    await checkAndAlertAvailableCameras();

    expect(console.error).toHaveBeenCalledWith(
      'Erreur lors de la récupération des caméras :',
      expect.any(Error)
    );
    expect(alert).toHaveBeenCalledWith('Impossible d\'accéder à la caméra !');
  });
});
