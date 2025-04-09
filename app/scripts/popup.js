'use strict';

const toggleButton = document.getElementById('toggle');
const activate = document.getElementById('activate');
const desactivate = document.getElementById('desactivate');
const popup = document.getElementById('popup');

toggleButton.addEventListener('click', (event) => {
  if (event.target === activate) {
      // Activer devient "gradient", Désactiver devient "gris avec ombre intérieure"
      activate.classList.add('gradient');
      activate.classList.remove('inactive', 'active');

      desactivate.classList.add('active');
      desactivate.classList.remove('gradient', 'inactive');

      popup.style.display = 'block';
  } else if (event.target === desactivate) {
      // Désactiver redevient actif, Activer retourne à l'état inactif
      desactivate.classList.add('inactive');
      desactivate.classList.remove('gradient', 'active');

      activate.classList.add('active');
      activate.classList.remove('gradient', 'inactive');

      popup.style.display = 'none';
  }
});


// Permet de déplacer la pop-up
popup.addEventListener('mousedown', (e) => {
    let offsetX = e.clientX - popup.offsetLeft;
    let offsetY = e.clientY - popup.offsetTop;

    function movePopup(event) {
        popup.style.left = `${event.clientX - offsetX}px`;
        popup.style.top = `${event.clientY - offsetY}px`;
    }

    function stopMovingPopup() {
        document.removeEventListener('mousemove', movePopup);
        document.removeEventListener('mouseup', stopMovingPopup);
    }

    document.addEventListener('mousemove', movePopup);
    document.addEventListener('mouseup', stopMovingPopup);
});
