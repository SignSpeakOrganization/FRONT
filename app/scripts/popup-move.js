'use strict';

const popup = document.getElementById('popup');

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

popup.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - popup.offsetLeft;
  offsetY = e.clientY - popup.offsetTop;
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    popup.style.left = `${e.clientX - offsetX}px`;
    popup.style.top = `${e.clientY - offsetY}px`;
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});
