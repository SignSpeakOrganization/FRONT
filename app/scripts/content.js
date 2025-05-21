'use strict';

/**
 * Récupère les périphériques vidéo disponibles (caméras).
 * @async
 * @function
 * @returns {Promise<MediaDeviceInfo[]>} Une promesse contenant la liste des périphériques de type "videoinput".
 * @throws {Error} Si la récupération échoue.
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
 * @async
 * @function
 * @returns {Promise<void>}
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

/**
 * Lance automatiquement la vérification des caméras
 * dès l'exécution du script.
 * @async
 * @function
 * @returns {Promise<void>}
 */
(async () => {
  await checkAndAlertAvailableCameras();
})();

export { getVideoInputDevices, checkAndAlertAvailableCameras };
