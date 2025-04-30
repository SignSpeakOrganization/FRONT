(async () => {
  // Vérifier si le navigateur a accès à la caméra
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === "videoinput");

    if (videoDevices.length > 0) {
      console.log("Caméras détectées :", videoDevices);
      alert(`Caméras disponibles :\n${videoDevices.map(d => d.label).join("\n")}`);
    } else {
      alert("Aucune caméra détectée !");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des caméras :", error);
    alert("Impossible d'accéder à la caméra !");
  }
})();
