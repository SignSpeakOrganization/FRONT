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

  document.addEventListener("DOMContentLoaded", () => {
    fetch("menu/menu.html")
      .then(res => {
        console.log("Status de la requête :", res.status);
        return res.text();
      })
      .then(html => {
        document.getElementById("menu-container").innerHTML = html;
        console.log("Menu chargé !");
      })
      .catch(err => console.error("Erreur de chargement du menu :", err));
  });

  document.addEventListener("DOMContentLoaded", () => {
    fetch("general/general.html")
      .then(res => {
        console.log("Status de la requête :", res.status);
        return res.text();
      })
      .then(html => {
        document.getElementById("content-container").innerHTML = html;
        console.log("Menu chargé !");
      })
      .catch(err => console.error("Erreur de chargement du menu :", err));
  });
