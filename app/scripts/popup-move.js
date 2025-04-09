'use strict';

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

document.body.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX;
  offsetY = e.clientY;
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    chrome.windows.getCurrent({}, function(win) {
      chrome.windows.update(win.id, {
        left: e.screenX - offsetX,
        top: e.screenY - offsetY
      });
    });
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});
