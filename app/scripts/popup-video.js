'use strict';

import { api } from './api.js';

let pollHandle = null;
const POLL_INTERVAL_MS = 500;

function setBackendState(stateChar, title) {
  const el = document.getElementById('backend-state');
  if (!el) return;
  el.textContent = stateChar;
  el.title = title || '';
}

function showVideoFeed() {
  const img = document.getElementById('videoFeed');
  const placeholder = document.getElementById('videoPlaceholder');
  if (!img) return;

  img.src = `${api.videoFeedUrl}?ts=${Date.now()}`;
  img.style.display = 'block';
  if (placeholder) placeholder.style.display = 'none';

  img.onerror = () => {
    img.style.display = 'none';
    if (placeholder) {
      placeholder.style.display = 'flex';
      placeholder.textContent = 'Backend indisponible';
    }
    setBackendState('✕', 'Backend indisponible');
  };
}

function updateUiFromStatus(data) {
  if (!data) return;
  const predEl = document.getElementById('prediction');
  const modeEl = document.getElementById('mode');
  const phraseEl = document.getElementById('phrase');

  if (predEl) predEl.textContent = data.prediction || '…';
  if (modeEl) modeEl.textContent = data.mode || '…';
  if (phraseEl) phraseEl.textContent = data.text || '';

  if (data.success !== false && data.camera_running) {
    setBackendState('●', 'Backend connecté');
  }
}

async function pollBackend() {
  try {
    const status = await api.status();
    updateUiFromStatus(status);
  } catch (err) {
    setBackendState('✕', `Erreur backend : ${err.message}`);
  }
}

function startPolling() {
  if (pollHandle !== null) return;
  pollBackend();
  pollHandle = setInterval(pollBackend, POLL_INTERVAL_MS);
}

function stopPolling() {
  if (pollHandle !== null) {
    clearInterval(pollHandle);
    pollHandle = null;
  }
}

async function ensureBackendStarted() {
  try {
    const health = await api.health();
    if (!health || !health.success) {
      setBackendState('✕', 'Backend KO');
      return false;
    }
  } catch (err) {
    setBackendState('✕', 'Backend hors ligne');
    return false;
  }

  try {
    await api.start();
  } catch (err) {
    console.warn('start ignoré :', err);
  }
  return true;
}

async function bindClearPhrase() {
  const btn = document.getElementById('clearPhrase');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      await api.clearPhrase();
      const phraseEl = document.getElementById('phrase');
      if (phraseEl) phraseEl.textContent = '';
    } catch (err) {
      console.error('clearPhrase :', err);
    }
  });
}

async function initPopupVideo() {
  const videoFeed = document.getElementById('videoFeed');
  if (!videoFeed) return;

  setBackendState('⏳', 'Connexion au backend…');

  const ok = await ensureBackendStarted();
  if (!ok) return;

  showVideoFeed();
  bindClearPhrase();
  startPolling();

  window.addEventListener('beforeunload', () => {
    stopPolling();
    api.end().catch(() => {});
  });
}

document.addEventListener('DOMContentLoaded', initPopupVideo);

export {
  ensureBackendStarted,
  showVideoFeed,
  pollBackend,
  startPolling,
  stopPolling,
  initPopupVideo,
};
