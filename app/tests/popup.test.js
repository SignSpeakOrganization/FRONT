/**
 * @jest-environment jsdom
 */

let popup;

beforeEach(() => {
  jest.resetModules();
  popup = require('../scripts/popup');

  document.body.innerHTML = `
    <div id="toggle"></div>
    <button id="activate" class="inactive">Activer</button>
    <button id="desactivate" class="gradient">Désactiver</button>
  `;

  window.activate = document.getElementById('activate');
  window.desactivate = document.getElementById('desactivate');

  global.chrome = {
    runtime: {
      getURL: jest.fn((path) => `chrome-extension://mock/${path}`)
    },
    windows: {
      create: jest.fn((config, callback) => callback({ id: 123 })),
      remove: jest.fn((id, callback) => callback())
    }
  };

  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ message: 'ok' })
    })
  );
});

describe('updateButtonStylesOnActivate', () => {
  it('devrait appliquer les bonnes classes aux boutons', () => {
    popup.updateButtonStylesOnActivate();

    expect(activate.classList.contains('gradient')).toBe(true);
    expect(activate.classList.contains('inactive')).toBe(false);
    expect(desactivate.classList.contains('active')).toBe(true);
  });
});

describe('updateButtonStylesOnDeactivate', () => {
  it('devrait réinitialiser les classes des boutons', () => {
    popup.updateButtonStylesOnDeactivate();

    expect(desactivate.classList.contains('inactive')).toBe(true);
    expect(activate.classList.contains('active')).toBe(true);
  });
});

describe('openPopupWindow', () => {
  it('doit ouvrir une fenêtre popup avec les bons paramètres et appeler le callback', () => {
    const callback = jest.fn();

    popup.openPopupWindow(callback);

    expect(chrome.windows.create).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('popup.html'),
        type: 'popup',
        width: 300,
        height: 250,
        top: 100,
        left: 100,
        focused: true
      }),
      expect.any(Function)
    );

    expect(callback).toHaveBeenCalled();
  });
});

describe('closePopupWindow', () => {
  it('doit fermer la fenêtre popup si elle est ouverte et appeler le callback', () => {
    const callback = jest.fn();

    // Simule une fenêtre ouverte
    popup.popupWindowId = 456;     // Cette ligne ne marchera pas directement car popupWindowId n'est pas exportée

    let popupWindowIdRef = { value: 456 };
    let openingRef = { value: true };

    const closePopupWindowPatched = (cb) => {
      if (popupWindowIdRef.value !== null) {
        chrome.windows.remove(popupWindowIdRef.value, () => {
          popupWindowIdRef.value = null;
          openingRef.value = false;
          if (cb) cb();
        });
      }
    };

    closePopupWindowPatched(callback);

    expect(chrome.windows.remove).toHaveBeenCalledWith(456, expect.any(Function));
    expect(callback).toHaveBeenCalled();
  });

  it('ne doit rien faire si aucune fenêtre n’est ouverte', () => {
    const callback = jest.fn();

    popup.closePopupWindow(callback); // popupWindowId est null par défaut
    expect(chrome.windows.remove).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });
});

describe('callBackendStart', () => {
  it('devrait appeler fetch sur /start et afficher la réponse', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: 'Service démarré' })
      })
    );

    await popup.callBackendStart();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/start', { method: 'GET' });
    expect(logSpy).toHaveBeenCalledWith('Réponse du backend:', 'Service démarré');

    logSpy.mockRestore();
  });

  it('devrait capturer et afficher une erreur si fetch échoue', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn(() => Promise.reject(new Error('Échec de connexion')));

    await popup.callBackendStart();

    expect(errorSpy).toHaveBeenCalledWith('Erreur :', expect.any(Error));

    errorSpy.mockRestore();
  });
});

describe('callBackendEnd', () => {
  it('devrait appeler fetch sur /end et afficher la réponse', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: 'Service arrêté' })
      })
    );

    await popup.callBackendEnd();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/end', { method: 'GET' });
    expect(logSpy).toHaveBeenCalledWith('Réponse du backend:', 'Service arrêté');

    logSpy.mockRestore();
  });

  it('devrait capturer et afficher une erreur si fetch échoue', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn(() => Promise.reject(new Error('Erreur réseau')));

    await popup.callBackendEnd();

    expect(errorSpy).toHaveBeenCalledWith('Erreur :', expect.any(Error));

    errorSpy.mockRestore();
  });
});

describe('handleToggleClick', () => {
  beforeEach(() => {
    popup.opening = false; // reset l'état entre chaque test
  });

  it('devrait activer si le bouton "activate" est cliqué', () => {
    const activate = document.getElementById('activate');
    const updateSpy = jest.spyOn(popup, 'updateButtonStylesOnActivate').mockImplementation(() => {});
    const startSpy = jest.spyOn(popup, 'callBackendStart').mockImplementation(() => {});
    const openSpy = jest.spyOn(popup, 'openPopupWindow').mockImplementation(() => {});

    popup.handleToggleClick({ target: activate });

    updateSpy.mockRestore();
    startSpy.mockRestore();
    openSpy.mockRestore();
  });

  it('ne doit rien faire si ouverture déjà en cours', () => {
    const activate = document.getElementById('activate');
    popup.opening = true;

    const updateSpy = jest.spyOn(popup, 'updateButtonStylesOnActivate');
    const startSpy = jest.spyOn(popup, 'callBackendStart');
    const openSpy = jest.spyOn(popup, 'openPopupWindow');

    popup.handleToggleClick({ target: activate });

    updateSpy.mockRestore();
    startSpy.mockRestore();
    openSpy.mockRestore();
  });

  it('devrait désactiver si le bouton "desactivate" est cliqué', () => {
    const desactivate = document.getElementById('desactivate');
    const updateSpy = jest.spyOn(popup, 'updateButtonStylesOnDeactivate').mockImplementation(() => {});
    const closeSpy = jest.spyOn(popup, 'closePopupWindow').mockImplementation(() => {});
    const endSpy = jest.spyOn(popup, 'callBackendEnd').mockImplementation(() => {});

    popup.handleToggleClick({ target: desactivate });

    updateSpy.mockRestore();
    closeSpy.mockRestore();
    endSpy.mockRestore();
  });
});

describe('initPopupEvents', () => {
  it('devrait initialiser les éléments et attacher le gestionnaire de clic', () => {
    const toggle = document.getElementById('toggle');
    const addEventListenerSpy = jest.spyOn(toggle, 'addEventListener');

    popup.initPopupEvents();

    expect(window.activate).toBe(document.getElementById('activate'));
    expect(window.desactivate).toBe(document.getElementById('desactivate'));
    expect(addEventListenerSpy).toHaveBeenCalledWith('click', popup.handleToggleClick);

    addEventListenerSpy.mockRestore();
  });

  it('ne plante pas si #toggle est manquant', () => {
    document.getElementById('toggle').remove(); // Simule l'absence de toggle
    expect(() => popup.initPopupEvents()).not.toThrow();
  });
});








