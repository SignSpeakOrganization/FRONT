'use strict';

const toggleButton = document.getElementById('toggle');
const activate = document.getElementById('activate');
const desactivate = document.getElementById('desactivate');
const popup = document.getElementById('popup');

let isActive = false;

toggleButton.addEventListener('click', () => {
    isActive = !isActive;
    console.log('Popup fonctionnel');
    if (isActive) {
        activate.classList.add('active');
        activate.classList.remove('inactive');
        desactivate.classList.add('inactive');
        desactivate.classList.remove('active');
        popup.style.display = 'block';
    } else {
        desactivate.classList.add('active');
        desactivate.classList.remove('inactive');
        activate.classList.add('inactive');
        activate.classList.remove('active');
        popup.style.display = 'none';
    }
});

// Pour deplacer le popup
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


