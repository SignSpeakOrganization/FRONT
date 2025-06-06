'use strict';

const LIVERELOAD_HOST = 'localhost:';
const LIVERELOAD_PORT = 35729;
const LIVERELOAD_URL = `ws://${LIVERELOAD_HOST}${LIVERELOAD_PORT}/livereload`;

let lastReload = false;

/**
 * Initialise l'écoute de l'événement `onInstalled` de l'extension
 * pour enregistrer l'heure de la dernière installation.
 * 
 * @function
 * @returns {void}
 */
function initOnInstalled() {
  chrome.runtime.onInstalled.addListener(() => {
    lastReload = Date.now();
  });
}

/**
 * Crée une connexion WebSocket avec le serveur LiveReload.
 * Gère automatiquement les erreurs et les messages entrants.
 * 
 * @function
 * @returns {WebSocket} La connexion WebSocket établie.
 */
function createLiveReloadConnection() {
  const connection = new WebSocket(LIVERELOAD_URL);

  connection.onerror = (error) => {
    console.log('reload connection got error:', error);
  };

  connection.onmessage = (e) => {
    handleReloadMessage(e.data);
  };

  return connection;
}

/**
 * Gère les messages reçus via WebSocket.
 * Si un message de type "reload" est reçu, recharge l'extension
 * si plus d'une minute s'est écoulée depuis le dernier rechargement.
 * 
 * @function
 * @param {string} data - Les données JSON reçues via WebSocket.
 * @returns {void}
 */
function handleReloadMessage(data) {
  if (!data) return;

  try {
    const parsed = JSON.parse(data);

    if (parsed.command === 'reload') {
      const now = Date.now();
      if (!lastReload || now - lastReload > 60000) {
        chrome.runtime.reload();
        if (chrome.developerPrivate) {
          chrome.developerPrivate.reload(chrome.runtime.id, { failQuietly: true });
        }
        lastReload = now;
      }
    }
  } catch (err) {
    console.error('Erreur parsing message LiveReload :', err);
  }
}

// Lancement des fonctions au chargement du script
initOnInstalled();
createLiveReloadConnection();

export { initOnInstalled, createLiveReloadConnection, handleReloadMessage };
