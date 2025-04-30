'use strict';

let isDragging = false;
let startX = 0;
let startY = 0;
let initialLeft = 0;
let initialTop = 0;
let currentWindowId = null;

document.addEventListener('mousemove', (e) => {
  if (isDragging && currentWindowId !== null) {
    const dx = e.screenX - startX;
    const dy = e.screenY - startY;

    chrome.windows.update(currentWindowId, {
      left: initialLeft + dx,
      top: initialTop + dy
    });
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});
