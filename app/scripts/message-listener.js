'use strict';


// content-message-listener.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STREAM_CAPTURED') {
    alert("Flux capturé !");
  }
});