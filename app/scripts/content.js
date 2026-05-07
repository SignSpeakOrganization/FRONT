'use strict';

async function getVideoInputDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === 'videoinput');
  } catch (error) {
    console.warn('enumerateDevices indisponible :', error.message);
    return [];
  }
}

async function checkAvailableCameras() {
  const videoDevices = await getVideoInputDevices();
  if (videoDevices.length > 0) {
    console.log('Caméras détectées :', videoDevices.length);
  } else {
    console.warn('Aucune caméra détectée.');
  }
}

if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
  checkAvailableCameras();
}

export { getVideoInputDevices, checkAvailableCameras };
