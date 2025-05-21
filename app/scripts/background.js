'use strict';

/**
 * Listener déclenché lors de l'installation ou de la mise à jour de l'extension.
 * Permet d'effectuer des actions d'initialisation si besoin.
 *
 * @event onInstalled
 * @param {chrome.runtime.InstalledDetails} details - Informations sur l'installation ou la mise à jour.
 */
chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

console.log('Event Page for Action Button');

/**
 * Listener principal exécuté lorsque l'utilisateur clique sur l'icône de l'extension.
 *
 * Ce listener :
 * 1. Ouvre la page des options de l’extension.
 * 2. Injecte un script (`content.js`) dans l’onglet actif.
 * 3. Capture l'audio et la vidéo de l’onglet actif.
 *
 * @event onClicked
 * @param {chrome.tabs.Tab} tab - L'onglet actif au moment du clic sur l'icône.
 */
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

     /**
     * Envoie un message au script de contenu pour indiquer que le flux est prêt.
     * @message STREAM_CAPTURED
     */
    chrome.tabs.sendMessage(tab.id, { type: 'STREAM_CAPTURED' });
  });
});
