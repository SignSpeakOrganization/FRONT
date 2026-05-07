import { api, BACKEND_URL } from '../../scripts/api.js';

const detectPlatformFromUrl = (url) => {
  if (!url) return null;
  if (url.includes('meet.google.com')) return 'Google Meet';
  if (url.includes('teams.microsoft.com')) return 'Microsoft Teams';
  if (url.includes('zoom.us')) return 'Zoom';
  return null;
};

const refreshBackend = async () => {
  const indicator = document.getElementById('compat-backend-indicator');
  const label = document.getElementById('compat-backend-label');
  const meta = document.getElementById('compat-backend-meta');
  if (!indicator || !label) return;

  try {
    const data = await api.health();
    if (data && data.success) {
      indicator.className = 'status-dot status-ok';
      label.textContent = `Connecté à ${BACKEND_URL}`;
      if (meta) meta.textContent = `Service : ${data.service || 'SignSpeak BACK'}`;
      return;
    }
    throw new Error('health KO');
  } catch (err) {
    indicator.className = 'status-dot status-ko';
    label.textContent = `Hors ligne (${BACKEND_URL})`;
    if (meta) meta.textContent = 'Démarre le backend avec `python app.py`.';
  }
};

const refreshCurrentPlatform = () => {
  const out = document.getElementById('compat-current-platform');
  if (!out) return;

  if (!chrome?.tabs?.query) {
    out.textContent = 'Indisponible';
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    const platform = detectPlatformFromUrl(tab && tab.url);
    out.textContent = platform || 'Aucune plateforme compatible détectée';
  });
};

export const initCompatibilitePage = () => {
  refreshBackend();
  refreshCurrentPlatform();

  const refreshBtn = document.getElementById('compat-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBackend();
      refreshCurrentPlatform();
    });
  }
};
