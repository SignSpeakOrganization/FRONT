document.addEventListener("DOMContentLoaded", () => {
    const signDetection = document.getElementById("enable-sign-detection");
    const audioFeedback = document.getElementById("enable-audio-feedback");
    const languageSelect = document.getElementById("language-select");
    const saveButton = document.getElementById("save-options");
  
    // Charger les paramètres stockés
    chrome.storage.sync.get(["signDetection", "audioFeedback", "language"], (data) => {
      signDetection.checked = data.signDetection || false;
      audioFeedback.checked = data.audioFeedback || false;
      languageSelect.value = data.language || "fr";
    });
  
    // Sauvegarder les paramètres
    saveButton.addEventListener("click", () => {
      chrome.storage.sync.set({
        signDetection: signDetection.checked,
        audioFeedback: audioFeedback.checked,
        language: languageSelect.value
      }, () => {
        alert("Options sauvegardées !");
      });
    });

    handleclick = (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: chrome.runtime.getURL("option/option.html") });
      }
    document.getElementById("open-options").addEventListener("click", handleclick);
  });