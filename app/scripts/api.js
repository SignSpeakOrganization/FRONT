'use strict';

const BACKEND_URL = 'http://127.0.0.1:8000';

const callJson = async (path, options = {}) => {
  const res = await fetch(`${BACKEND_URL}${path}`, options);
  return res.json();
};

const api = {
  baseUrl: BACKEND_URL,
  videoFeedUrl: `${BACKEND_URL}/video_feed`,
  start: () => callJson('/start'),
  end: () => callJson('/end'),
  status: () => callJson('/status'),
  health: () => callJson('/health'),
  sign: () => callJson('/sign'),
  phrase: () => callJson('/phrase'),
  clearPhrase: () => callJson('/clear_phrase'),
  conversationState: () => callJson('/conversation/state'),
  conversationHistory: () => callJson('/conversation/history'),
  clearHistory: () => callJson('/conversation/history/clear'),
  transcribe: (audioBlob, lang = 'fr') => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('lang', lang);
    return fetch(`${BACKEND_URL}/speech/transcribe`, {
      method: 'POST',
      body: formData,
    }).then((r) => r.json());
  },
};

export { api, BACKEND_URL };
