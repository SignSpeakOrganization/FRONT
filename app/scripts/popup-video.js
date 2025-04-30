'use strict';

document.addEventListener("DOMContentLoaded", () => {
  const startCaptureButton = document.getElementById("startCapture");
  const videoElement = document.getElementById("videoElement");

  let stream = null;
  let initialWidth = null;
  let initialHeight = null;

  // Sauvegarde la taille de la fenêtre à l'ouverture
  chrome.windows.getCurrent({}, (win) => {
    initialWidth = win.width;
    initialHeight = win.height;
  });

  if (startCaptureButton) {
    startCaptureButton.addEventListener("click", async () => {
      // Si une capture est active, on la stoppe
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
        stream = null;

        // Restauration de la taille d'origine
        if (initialWidth && initialHeight) {
          chrome.windows.getCurrent({}, (win) => {
            chrome.windows.update(win.id, {
              width: initialWidth,
              height: initialHeight
            });
          });
        }

        // Réinitialise le bouton
        startCaptureButton.textContent = "Démarrer Capture";
        startCaptureButton.classList.remove("gradient");
        return;
      }

      // Démarrer la capture
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoElement.srcObject = stream;

        // 6. Mise à jour du bouton
        startCaptureButton.textContent = "Fermer la capture";
        startCaptureButton.classList.add("gradient");

        // Redimensionner la popup à la taille de la vidéo
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
    });
  }
});
