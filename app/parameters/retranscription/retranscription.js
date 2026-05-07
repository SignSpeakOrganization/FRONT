import { api } from '../../scripts/api.js';

const TOGGLE_SECTIONS = [
  { checkboxId: 'enable-oral-transcription', sectionId: 'oral-transcription-options' },
  { checkboxId: 'enable-subtitles', sectionId: 'subtitle-options' },
  { checkboxId: 'enable-lsf-bubble', sectionId: 'lsf-bubble-options' },
];

const STORAGE_KEYS = [
  'enable-oral-transcription',
  'voice-level',
  'voice-select',
  'enable-subtitles',
  'subtitle-size',
  'subtitle-color',
  'subtitle-background-color',
  'subtitle-background',
  'enable-lsf-bubble',
  'lsf-bubble-position',
  'lsf-bubble-size',
  'lsf-bubble-opacity',
];

const setSectionVisibility = (checkbox, section) => {
  section.classList.toggle('hidden', !checkbox.checked);
};

const restorePersistedValues = () => {
  chrome.storage.sync.get(STORAGE_KEYS, (data) => {
    STORAGE_KEYS.forEach((key) => {
      const el = document.getElementById(key);
      if (!el || data[key] === undefined) return;
      if (el.type === 'checkbox') {
        el.checked = Boolean(data[key]);
      } else {
        el.value = data[key];
      }
    });

    TOGGLE_SECTIONS.forEach(({ checkboxId, sectionId }) => {
      const checkbox = document.getElementById(checkboxId);
      const section = document.getElementById(sectionId);
      if (checkbox && section) setSectionVisibility(checkbox, section);
    });
  });
};

const bindPersistence = () => {
  STORAGE_KEYS.forEach((key) => {
    const el = document.getElementById(key);
    if (!el) return;
    const evt = el.tagName === 'SELECT' || el.type === 'number' ? 'change' : 'change';
    el.addEventListener(evt, () => {
      const value = el.type === 'checkbox' ? el.checked : el.value;
      chrome.storage.sync.set({ [key]: value });
    });
  });
};

const bindToggleSections = () => {
  TOGGLE_SECTIONS.forEach(({ checkboxId, sectionId }) => {
    const checkbox = document.getElementById(checkboxId);
    const section = document.getElementById(sectionId);
    if (!checkbox || !section) return;
    setSectionVisibility(checkbox, section);
    checkbox.addEventListener('change', () => setSectionVisibility(checkbox, section));
  });
};

let livePollHandle = null;

const startLivePolling = () => {
  if (livePollHandle !== null) return;

  const tick = async () => {
    const predEl = document.getElementById('live-prediction');
    const modeEl = document.getElementById('live-mode');
    const phraseEl = document.getElementById('live-phrase');
    if (!predEl || !modeEl || !phraseEl) return;

    try {
      const data = await api.status();
      predEl.textContent = data.prediction || '—';
      modeEl.textContent = data.mode || '—';
      phraseEl.textContent = data.text || '';
    } catch {
      predEl.textContent = 'backend hors ligne';
      modeEl.textContent = '—';
    }
  };

  tick();
  livePollHandle = setInterval(tick, 700);
};

const stopLivePolling = () => {
  if (livePollHandle !== null) {
    clearInterval(livePollHandle);
    livePollHandle = null;
  }
};

const bindLiveControls = () => {
  const clearBtn = document.getElementById('live-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      try {
        await api.clearPhrase();
        const phraseEl = document.getElementById('live-phrase');
        if (phraseEl) phraseEl.textContent = '';
      } catch (err) {
        console.error('clearPhrase :', err);
      }
    });
  }
};

let mediaRecorder = null;
let recordedChunks = [];

const setSttStatus = (text) => {
  const el = document.getElementById('stt-status');
  if (el) el.textContent = text;
};

const setSttResult = (text) => {
  const el = document.getElementById('stt-text');
  if (el) el.textContent = text || '—';
};

const startRecording = async () => {
  recordedChunks = [];
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

  mediaRecorder.addEventListener('dataavailable', (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  });

  mediaRecorder.addEventListener('stop', async () => {
    stream.getTracks().forEach((t) => t.stop());
    const blob = new Blob(recordedChunks, { type: 'audio/webm' });
    setSttStatus('Envoi au backend…');
    try {
      const result = await api.transcribe(blob, 'fr');
      if (result.success) {
        setSttResult(result.text);
        setSttStatus('Transcription reçue');
      } else {
        setSttResult('—');
        setSttStatus(`Erreur : ${result.error || 'inconnue'}`);
      }
    } catch (err) {
      setSttStatus(`Erreur : ${err.message}`);
    }
  });

  mediaRecorder.start();
  setSttStatus('Enregistrement…');
};

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
};

const bindSttButton = () => {
  const btn = document.getElementById('stt-record');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      try {
        await startRecording();
        btn.textContent = "Arrêter l'enregistrement";
      } catch (err) {
        setSttStatus(`Erreur micro : ${err.message}`);
      }
    } else {
      stopRecording();
      btn.textContent = "Démarrer l'enregistrement";
    }
  });
};

export const initRetranscriptionPage = () => {
  bindToggleSections();
  bindPersistence();
  restorePersistedValues();
  bindLiveControls();
  bindSttButton();
  startLivePolling();
};

export const teardownRetranscriptionPage = () => {
  stopLivePolling();
};
