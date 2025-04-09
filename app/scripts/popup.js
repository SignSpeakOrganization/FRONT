'use strict';

const toggleButton = document.getElementById('toggle');
const activate = document.getElementById('activate');
const desactivate = document.getElementById('desactivate');

// Remplace l'affichage du div#popup par l'ouverture de la popup externe
toggleButton.addEventListener('click', (event) => {
  if (event.target === activate) {
    // Activer devient "gradient", Désactiver devient "gris avec ombre intérieure"
    activate.classList.add('gradient');
    activate.classList.remove('inactive', 'active');

    desactivate.classList.add('active');
    desactivate.classList.remove('gradient', 'inactive');

    // 🪟 Ouvre une nouvelle fenêtre popup externe
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"), // nom de ton fichier popup
      type: "popup",
      width: 300,
      height: 200
    });

  } else if (event.target === desactivate) {
    // Désactiver redevient actif, Activer retourne à l'état inactif
    desactivate.classList.add('inactive');
    desactivate.classList.remove('gradient', 'active');

    activate.classList.add('active');
    activate.classList.remove('gradient', 'inactive');

    // Rien à faire ici pour fermer la fenêtre externe automatiquement
    // (ça nécessiterait stocker une référence à la fenêtre)
  }
});
