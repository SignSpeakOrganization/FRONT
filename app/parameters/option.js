import { initGeneralPage } from './general/general.js';
import {
  initRetranscriptionPage,
  teardownRetranscriptionPage,
} from './retranscription/retranscription.js';
import {
  initAccessibilitePage,
  restoreAccessibilityFromStorage,
} from './accessibilite/accessibilite.js';
import { initCompatibilitePage } from './compatibilite/compatibilite.js';
import { initContactPage } from './contact/contact.js';

const PAGES = {
  general: { path: 'general/general.html', init: initGeneralPage },
  retranscription: { path: 'retranscription/retranscription.html', init: initRetranscriptionPage },
  accessibilite: { path: 'accessibilite/accessibilite.html', init: initAccessibilitePage },
  compatibilite: { path: 'compatibilite/compatibilite.html', init: initCompatibilitePage },
  contact: { path: 'contact/contact.html', init: initContactPage },
};

let currentPageKey = null;

const teardownPage = (pageKey) => {
  if (pageKey === 'retranscription') {
    teardownRetranscriptionPage();
  }
};

const activateMenuItem = (pageKey) => {
  document.querySelectorAll('#links li').forEach((item) => {
    item.classList.toggle('active', item.dataset.page === pageKey);
  });
};

const loadPage = (pageKey) => {
  const entry = PAGES[pageKey];
  if (!entry) return;

  if (currentPageKey) teardownPage(currentPageKey);

  fetch(entry.path)
    .then((res) => {
      if (!res.ok) throw new Error(`Impossible de charger ${entry.path}`);
      return res.text();
    })
    .then((html) => {
      document.getElementById('content-container').innerHTML = html;
      activateMenuItem(pageKey);
      currentPageKey = pageKey;
      if (typeof entry.init === 'function') entry.init();
    })
    .catch((err) => console.error('Erreur de chargement de page :', err));
};

const bindMenuNavigation = () => {
  document.querySelectorAll('#links li').forEach((item) => {
    item.addEventListener('click', () => loadPage(item.dataset.page));
  });
};

document.addEventListener('DOMContentLoaded', () => {
  restoreAccessibilityFromStorage();

  fetch('menu/menu.html')
    .then((res) => {
      if (!res.ok) throw new Error('Impossible de charger le menu');
      return res.text();
    })
    .then((html) => {
      document.getElementById('menu-container').innerHTML = html;
      bindMenuNavigation();
      loadPage('general');
    })
    .catch((err) => console.error('Erreur de chargement du menu :', err));
});
