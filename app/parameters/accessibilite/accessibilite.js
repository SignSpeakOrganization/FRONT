const KEYS = ['enable-auto-mode', 'enable-bw-mode'];

const applyBwMode = (enabled) => {
  document.body.classList.toggle('bw-mode', enabled);
};

export const initAccessibilitePage = () => {
  const autoMode = document.getElementById('enable-auto-mode');
  const bwMode = document.getElementById('enable-bw-mode');

  if (!autoMode || !bwMode) return;

  chrome.storage.sync.get(KEYS, (data) => {
    autoMode.checked = Boolean(data['enable-auto-mode']);
    bwMode.checked = Boolean(data['enable-bw-mode']);
    applyBwMode(bwMode.checked);
  });

  autoMode.addEventListener('change', () => {
    chrome.storage.sync.set({ 'enable-auto-mode': autoMode.checked });
  });

  bwMode.addEventListener('change', () => {
    const value = bwMode.checked;
    chrome.storage.sync.set({ 'enable-bw-mode': value });
    applyBwMode(value);
  });
};

export const restoreAccessibilityFromStorage = () => {
  chrome.storage.sync.get(['enable-bw-mode'], (data) => {
    applyBwMode(Boolean(data['enable-bw-mode']));
  });
};
