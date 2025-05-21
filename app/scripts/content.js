'use strict';

/**
 * Récupère les périphériques vidéo disponibles (caméras).
 */
async function getVideoInputDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === "videoinput");
  } catch (error) {
    throw new Error("Impossible de récupérer les périphériques : " + error.message);
  }
}

/**
 * Vérifie la disponibilité des caméras et affiche une alerte
 * listant les caméras ou un message d'erreur.
 */
async function checkAndAlertAvailableCameras() {
  try {
    const videoDevices = await getVideoInputDevices();

    if (videoDevices.length > 0) {
      console.log("Caméras détectées :", videoDevices);
    } else {
      alert("Aucune caméra détectée !");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des caméras :", error);
    alert("Impossible d'accéder à la caméra !");
  }
}

// Démarre la vérification des caméras automatiquement
(async () => {
  await checkAndAlertAvailableCameras();
})();

// Écouteur pour les messages reçus depuis background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STREAM_CAPTURED') {
    alert("Flux capturé !");
  }
});
