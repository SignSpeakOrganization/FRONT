'use strict';

import { api } from './api.js';

let popupWindowId = null;
let opening = false;

function updateButtonStylesOnActivate() {
  activate.classList.add('gradient');
  activate.classList.remove('inactive', 'active');
  desactivate.classList.add('active');
  desactivate.classList.remove('gradient', 'inactive');
}

function updateButtonStylesOnDeactivate() {
  desactivate.classList.add('inactive');
  desactivate.classList.remove('gradient', 'active');
  activate.classList.add('active');
  activate.classList.remove('gradient', 'inactive');
}

function openPopupWindow(callback) {
  if (popupWindowId !== null) {
    if (callback) callback();
    return;
  }
  chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    width: 560,
    height: 500,
    top: 100,
    left: 100,
    focused: true
  }, (newWindow) => {
    popupWindowId = newWindow.id;
    opening = true;
    if (callback) callback();
  });
}

function closePopupWindow(callback) {
  if (popupWindowId !== null) {
    chrome.windows.remove(popupWindowId, () => {
      popupWindowId = null;
      opening = false;
      if (callback) callback();
    });
  } else if (callback) {
    callback();
  }
}

function callBackendStart() {
  return api.start()
    .then((data) => console.log('Backend /start:', data))
    .catch((err) => console.error('Backend /start erreur :', err));
}

function callBackendEnd() {
  return api.end()
    .then((data) => console.log('Backend /end:', data))
    .catch((err) => console.error('Backend /end erreur :', err));
}

function handleToggleClick(event) {
  if (event.target === activate) {
    if (opening) return;
    updateButtonStylesOnActivate();
    callBackendStart();
    openPopupWindow();
    chrome.storage.sync.set({ signDetection: true });
  } else if (event.target === desactivate) {
    updateButtonStylesOnDeactivate();
    closePopupWindow();
    callBackendEnd();
    chrome.storage.sync.set({ signDetection: false });
  }
}

function initPopupEvents() {
  const toggleButton = document.getElementById('toggle');
  window.activate = document.getElementById('activate');
  window.desactivate = document.getElementById('desactivate');
  if (toggleButton) {
    toggleButton.addEventListener('click', handleToggleClick);
  }

  if (chrome?.windows?.onRemoved) {
    chrome.windows.onRemoved.addListener((windowId) => {
      if (windowId === popupWindowId) {
        popupWindowId = null;
        opening = false;
      }
    });
  }
}

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
