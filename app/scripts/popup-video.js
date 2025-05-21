'use strict';

let stream = null;
let initialWidth = null;
let initialHeight = null;

/**
 * Sauvegarde la taille actuelle de la fenêtre Chrome.
 * @function
 * @returns {Promise<void>}
 */
function saveInitialWindowSize() {
  return new Promise((resolve) => {
    chrome.windows.getCurrent({}, (win) => {
      initialWidth = win.width;
      initialHeight = win.height;
      resolve();
    });
  });
}

/**
 * Restaure la fenêtre Chrome à sa taille initialement enregistrée.
 * @function
 * @returns {void}
 */
function restoreWindowSize() {
  if (initialWidth && initialHeight) {
    chrome.windows.getCurrent({}, (win) => {
      chrome.windows.update(win.id, {
        width: initialWidth,
        height: initialHeight
      });
    });
  }
}

/**
 * Arrête la capture vidéo et audio en cours.
 * @function
 * @param {HTMLVideoElement} videoElement - L'élément vidéo à libérer.
 * @param {HTMLElement} button - Le bouton de capture à réinitialiser.
 * @returns {void}
 */
function stopCapture(videoElement, button) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
    stream = null;

    restoreWindowSize();

    button.textContent = "Démarrer Capture";
    button.classList.remove("gradient");
  }
}

/**
 * Démarre la capture vidéo et audio depuis la webcam et le micro.
 * @async
 * @function
 * @param {HTMLVideoElement} videoElement - L'élément HTML où afficher la vidéo.
 * @param {HTMLElement} button - Le bouton à mettre à jour après lancement.
 * @returns {Promise<void>}
 */
async function startCapture(videoElement, button) {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoElement.srcObject = stream;

    button.textContent = "Fermer la capture";
    button.classList.add("gradient");

    videoElement.onloadedmetadata = () => {
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;
      const extraHeight = 100;

      chrome.windows.getCurrent({}, (win) => {
        chrome.windows.update(win.id, {
          width: videoWidth,
          height: videoHeight + extraHeight
        });
      });
    };
  } catch (error) {
    console.error("Erreur d'accès caméra/micro :", error);
    alert("Erreur : " + error.message);
    stream = null;
  }
}

/**
 * Initialise le bouton de capture et l'élément vidéo au chargement de la popup.
 * @function
 * @returns {void}
 */
function initPopupVideo() {
  const startCaptureButton = document.getElementById("startCapture");
  const videoElement = document.getElementById("videoElement");
  if (!startCaptureButton || !videoElement) return;

  saveInitialWindowSize();

  startCaptureButton.addEventListener("click", async () => {
    if (stream) {
      stopCapture(videoElement, startCaptureButton);
    } else {
      await startCapture(videoElement, startCaptureButton);
    }
  });
}

/**
 * Lance l'initialisation une fois le DOM chargé.
 */
document.addEventListener("DOMContentLoaded", initPopupVideo);

export {
  saveInitialWindowSize,
  restoreWindowSize,
  stopCapture,
  startCapture,
  initPopupVideo
};
