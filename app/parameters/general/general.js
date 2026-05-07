import {
  callBackendStart,
  callBackendEnd,
  openPopupWindow,
  closePopupWindow,
} from '../../scripts/popup.js';
import { api } from '../../scripts/api.js';

const refreshBackendStatus = async () => {
  const indicator = document.getElementById('backend-status-indicator');
  const label = document.getElementById('backend-status-label');
  if (!indicator || !label) return;

  try {
    const data = await api.health();
    if (data && data.success) {
      indicator.className = 'status-dot status-ok';
      label.textContent = 'Backend connecté';
      return;
    }
    throw new Error('health KO');
  } catch {
    indicator.className = 'status-dot status-ko';
    label.textContent = 'Backend hors ligne (lance `python app.py`)';
  }
};

export const initGeneralPage = () => {
  const signDetection = document.getElementById('enable-sign-detection');
  const languageSelect = document.getElementById('language-select');

  if (!signDetection || !languageSelect) {
    return;
  }

  chrome.storage.sync.get(['signDetection', 'language'], (data) => {
    signDetection.checked = data.signDetection || false;
    languageSelect.value = data.language || 'fr';
  });

  signDetection.addEventListener('change', () => {
    const value = signDetection.checked;

    chrome.storage.sync.set({ signDetection: value });

    if (value) {
      callBackendStart();
      openPopupWindow();
    } else {
      closePopupWindow();
      callBackendEnd();
    }
  });

  languageSelect.addEventListener('change', () => {
    chrome.storage.sync.set({ language: languageSelect.value });
  });

  refreshBackendStatus();
};
