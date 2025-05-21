'use strict';

let popupWindowId = null;
let opening = false;

/**
 * Applique les styles CSS d'activation sur les boutons.
 * @function
 * @returns {void}
 */
function updateButtonStylesOnActivate() {
  activate.classList.add('gradient');
  activate.classList.remove('inactive', 'active');
  desactivate.classList.add('active');
  desactivate.classList.remove('gradient', 'inactive');
}

/**
 * Applique les styles CSS de désactivation sur les boutons.
 * @function
 * @returns {void}
 */
function updateButtonStylesOnDeactivate() {
  desactivate.classList.add('inactive');
  desactivate.classList.remove('gradient', 'active');
  activate.classList.add('active');
  activate.classList.remove('gradient', 'inactive');
}

/**
 * Ouvre une nouvelle fenêtre popup de l’extension.
 * @function
 * @param {Function} [callback] - Fonction appelée après l’ouverture.
 * @returns {void}
 */
function openPopupWindow(callback) {
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
    if (callback) callback();
  });
}

/**
 * Ferme la fenêtre popup ouverte, si elle existe.
 * @function
 * @param {Function} [callback] - Fonction appelée après la fermeture.
 * @returns {void}
 */
function closePopupWindow(callback) {
  if (popupWindowId !== null) {
    chrome.windows.remove(popupWindowId, () => {
      popupWindowId = null;
      opening = false;
      if (callback) callback();
    });
  }
}

/**
 * Effectue un appel HTTP pour démarrer le backend (serveur Python).
 * @function
 * @returns {Promise<void>}
 */
function callBackendStart() {
  return fetch('http://localhost:5000/start', { method: 'GET' })
    .then(res => res.json())
    .then(data => console.log('Réponse du backend:', data.message))
    .catch(err => console.error('Erreur :', err));
}

/**
 * Effectue un appel HTTP pour arrêter le backend.
 * @function
 * @returns {Promise<void>}
 */
function callBackendEnd() {
  return fetch('http://localhost:5000/end', { method: 'GET' })
    .then(res => res.json())
    .then(data => console.log('Réponse du backend:', data.message))
    .catch(err => console.error('Erreur :', err));
}

/**
 * Gère le clic sur les boutons "Activer" et "Désactiver".
 * @function
 * @param {MouseEvent} event - L'événement du clic.
 * @returns {void}
 */
function handleToggleClick(event) {
  if (event.target === activate) {
    if (opening) return;
    updateButtonStylesOnActivate();
    callBackendStart();
    openPopupWindow();
  } else if (event.target === desactivate) {
    updateButtonStylesOnDeactivate();
    closePopupWindow();
    callBackendEnd();
  }
}

/**
 * Initialise les événements du DOM pour la popup (clics, boutons...).
 * @function
 * @returns {void}
 */
function initPopupEvents() {
  const toggleButton = document.getElementById('toggle');
  window.activate = document.getElementById('activate');
  window.desactivate = document.getElementById('desactivate');
  if (toggleButton) {
    toggleButton.addEventListener('click', handleToggleClick);
  }
}

// Lancement automatique à la fin du chargement de la page
document.addEventListener('DOMContentLoaded', initPopupEvents);

export {
  updateButtonStylesOnActivate,
  updateButtonStylesOnDeactivate,
  handleToggleClick,
  callBackendStart,
  callBackendEnd,
  openPopupWindow,
  closePopupWindow,
  initPopupEvents
};
