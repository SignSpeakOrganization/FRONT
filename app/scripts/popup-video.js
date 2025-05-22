'use strict';

let stream = null;
let signInterval = null;
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
 * @param {HTMLElement} signDisplay - popup pour afficher le signe
 * @returns {void}
 */
function stopCapture(videoElement, button, signDisplay) {
  if (stream) {
    videoElement.src = null;
    stream = null;

    // Stopper récupération du signe
    clearInterval(signInterval);
    signInterval = null;
    signDisplay.textContent = "Déplacez-moi !";

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
 * @param {HTMLElement} signDisplay - popup pour afficher le signe
 * @returns {Promise<void>}
 */
async function startCapture(videoElement, button, signDisplay) {
  const url = 'http://localhost:5000/video_feed';
  videoElement.src = url;
  button.textContent = "Fermer la capture";
  stream = true;

  videoElement.onload = () => {
    chrome.windows.getCurrent({}, (win) => {
      chrome.windows.update(win.id, {
        width: videoElement.naturalWidth + 35,
        height: videoElement.naturalHeight + 65
      });
    });
  }

  button.classList.add("gradient");

  signInterval = setInterval(() => {
    fetch('http://localhost:5000/sign')
      .then((res) => res.json())
      .then((data) => {
        if (data.hand_sign) {
          signDisplay.textContent = data.hand_sign;
        } else {
          signDisplay.textContent = "Déplacez-moi !";
        }
      })
      .catch((err) => {
        signDisplay.textContent = "Erreur de récupération";
        console.error("Erreur fetch /sign :", err);
      });
  }, 100);
}

async function requestCameraPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    console.log("Autorisation caméra obtenue.");
  } catch (err) {
    console.error("Autorisation caméra refusée :", err);
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
  const signDisplay = document.getElementById("displaySign");
  if (!startCaptureButton || !videoElement || !signDisplay) return;

  saveInitialWindowSize();

  startCaptureButton.addEventListener("click", async () => {
    if (stream) {
      stopCapture(videoElement, startCaptureButton, signDisplay);
    } else {
      await requestCameraPermission();
      await startCapture(videoElement, startCaptureButton, signDisplay);
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
