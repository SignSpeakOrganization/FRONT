'use strict';

const toggleButton = document.getElementById('toggle');
const activate = document.getElementById('activate');
const desactivate = document.getElementById('desactivate');

let popupWindowId = null;
let opening = false; // Empêche plusieurs ouvertures

toggleButton.addEventListener('click', (event) => {
  if (event.target === activate) {
    // Empêche l'ouverture multiple
    if (opening) return;

    // Style bouton
    activate.classList.add('gradient');
    activate.classList.remove('inactive', 'active');
    desactivate.classList.add('active');
    desactivate.classList.remove('gradient', 'inactive');

    // Ouvre la popup
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      width: 300,
      height: 250,
      top: 100,
      left: 100,
      focused: true
    }, (newWindow) => {
      popupWindowId = newWindow.id;
      opening = true;
    });

  } else if (event.target === desactivate) {
    // Style bouton
    desactivate.classList.add('inactive');
    desactivate.classList.remove('gradient', 'active');
    activate.classList.add('active');
    activate.classList.remove('gradient', 'inactive');

    // Ferme la popup si elle est ouverte
    if (popupWindowId !== null) {
      chrome.windows.remove(popupWindowId, () => {
        popupWindowId = null;
        opening = false; // autorise une nouvelle ouverture
      });
    }
  }
});
