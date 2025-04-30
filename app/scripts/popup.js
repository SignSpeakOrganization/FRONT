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
