'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(tabId => {
  chrome.pageAction.show(tabId);
});

console.log('Event Page for Page Action');

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
  });
});


chrome.action.onClicked.addListener((tab) => {
  chrome.tabCapture.capture({ audio: true, video: true }, (stream) => {
      if (chrome.runtime.lastError) {
          console.error("Erreur de capture :", chrome.runtime.lastError.message);
          return;
      }

      console.log("Flux capturé :", stream);
      alert("Flux capturé !");

      // Tu peux maintenant afficher la vidéo dans une fenêtre ou l'utiliser pour du traitement
  });
});
