'use strict';

// Listener pour l'installation de l'extension
chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

console.log('Event Page for Action Button');

// Un seul listener pour tous les comportements au clic sur l'icône de l'extension
chrome.action.onClicked.addListener((tab) => {
  if (!tab || !tab.id) {
    console.error("Aucun onglet actif détecté.");
    return;
  }

  // 1. Ouvre la page "option.html"
  chrome.tabs.create({ url: chrome.runtime.getURL("option.html") });

  // 2. Injecte content.js dans l'onglet actif
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });

  // 3. Capture l'audio et la vidéo de l'onglet
  chrome.tabCapture.capture({ audio: true, video: true }, (stream) => {
    if (chrome.runtime.lastError) {
      console.error("Erreur de capture :", chrome.runtime.lastError.message);
      return;
    }

    console.log("Flux capturé :", stream);

    // Envoie un message au content script pour notifier que le flux est capturé
    chrome.tabs.sendMessage(tab.id, { type: 'STREAM_CAPTURED' });
  });
});
