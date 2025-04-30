'use strict';

document.addEventListener("DOMContentLoaded", () => {
    const startCaptureButton = document.getElementById("startCapture");
    const videoElement = document.getElementById("videoElement");

    if (startCaptureButton) {
        startCaptureButton.addEventListener("click", async () => {
            try {
                console.log("Demande d'accès à la caméra et au micro...");
                
                // Demander l'accès au micro et à la caméra
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                // Afficher la vidéo dans l'élément <video>
                videoElement.srcObject = stream;
                console.log("Accès accordé : Flux vidéo et audio récupéré !");
            } catch (error) {
                console.error("Erreur lors de l'accès à la caméra/micro :", error);

                // Vérifie si l'utilisateur a refusé l'accès
                if (error.name === "NotAllowedError") {
                    alert("⚠️ Accès refusé ! Veuillez autoriser l'accès à la caméra et au micro dans les paramètres de Chrome.");
                } else if (error.name === "NotFoundError") {
                    alert("⚠️ Aucune caméra ou micro détecté !");
                } else {
                    alert("❌ Une erreur inconnue s'est produite !");
                }
            }
        });
    }
});
// // Remplace l'affichage du div#popup par l'ouverture de la popup externe
// toggleButton.addEventListener('click', (event) => {
//     if (event.target === activate) {
//       // Activer devient "gradient", Désactiver devient "gris avec ombre intérieure"
//       activate.classList.add('gradient');
//       activate.classList.remove('inactive', 'active');
  
//       desactivate.classList.add('active');
//       desactivate.classList.remove('gradient', 'inactive');
  
//       // 🪟 Ouvre une nouvelle fenêtre popup externe
//       chrome.windows.create({
//         url: chrome.runtime.getURL("popup.html"),
//         type: "popup",
//         width: 250,
//         height: 200,
//         top: 100,
//         left: 100,
//         focused: true
//       });
//     } else if (event.target === desactivate) {
//       // Désactiver redevient actif, Activer retourne à l'état inactif
//       desactivate.classList.add('inactive');
//       desactivate.classList.remove('gradient', 'active');
  
//       activate.classList.add('active');
//       activate.classList.remove('gradient', 'inactive');
//     }
    
//   });
 