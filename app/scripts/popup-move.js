'use strict';

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

/**
 * Initialise le comportement de glisser-déposer sur une popup.
 * @function
 * @param {HTMLElement} popup - L'élément HTML à rendre déplaçable.
 * @returns {void}
 */
function initPopupMove(popup) {
  if (!popup) return;
  popup.addEventListener('mousedown', (e) => handleMouseDown(e, popup));
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

/**
 * Gère le début du glisser-déposer (clic initial sur la popup).
 * @function
 * @param {MouseEvent} e - L'événement de la souris.
 * @param {HTMLElement} popup - L'élément ciblé pour le déplacement.
 * @returns {void}
 */
function handleMouseDown(e, popup) {
  isDragging = true;
  offsetX = e.clientX - popup.offsetLeft;
  offsetY = e.clientY - popup.offsetTop;
}

/**
 * Gère le déplacement de la popup pendant le glisser.
 * @function
 * @param {MouseEvent} e - L'événement de la souris.
 * @returns {void}
 */
function handleMouseMove(e) {
  if (isDragging) {
    const popup = document.getElementById('popup');
    if (popup) {
      popup.style.left = `${e.clientX - offsetX}px`;
      popup.style.top = `${e.clientY - offsetY}px`;
    }
  }
}

/**
 * Gère la fin du glisser-déposer (lors du relâchement du clic).
 * @function
 * @returns {void}
 */
function handleMouseUp() {
  isDragging = false;
}

/**
 * Initialise le comportement de la popup après chargement du DOM.
 */
document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('popup');
  initPopupMove(popup);
});

export { initPopupMove, handleMouseDown, handleMouseMove, handleMouseUp };
