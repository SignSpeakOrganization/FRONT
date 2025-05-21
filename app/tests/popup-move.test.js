/**
 * @jest-environment jsdom
 */

import {
  initPopupMove,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp
} from '../scripts/popup-move';

describe('popup-move.js', () => {
  let popup;

  beforeEach(() => {
    // Structure HTML simulée
    document.body.innerHTML = `
      <div id="popup" style="position: absolute; left: 100px; top: 100px;"></div>
    `;
    popup = document.getElementById('popup');

    // Reset position
    popup.style.left = '100px';
    popup.style.top = '100px';
  });

  describe('initPopupMove', () => {
    it('should attach mousedown, mousemove and mouseup listeners', () => {
      const mouseDownSpy = jest.spyOn(popup, 'addEventListener');
      const docMouseMoveSpy = jest.spyOn(document, 'addEventListener');

      initPopupMove(popup);

      expect(mouseDownSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(docMouseMoveSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(docMouseMoveSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

      mouseDownSpy.mockRestore();
      docMouseMoveSpy.mockRestore();
    });

    it('should do nothing if popup is null', () => {
      expect(() => initPopupMove(null)).not.toThrow();
    });
  });

  describe('handleMouseDown', () => {
    it('should enable dragging and calculate offset', () => {
      const event = {
        clientX: 150,
        clientY: 160
      };

      Object.defineProperty(popup, 'offsetLeft', {
        configurable: true,
        value: 100
      });
      Object.defineProperty(popup, 'offsetTop', {
        configurable: true,
        value: 120
      });

      handleMouseDown(event, popup);

      // Simule un déplacement
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 170, clientY: 180 }));

      expect(popup.style.left).toBe(`${170 - 50}px`); // 120px
      expect(popup.style.top).toBe(`${180 - 40}px`);  // 140px
    });
  });

  describe('handleMouseMove', () => {
    it('should move popup if dragging is active', () => {
      Object.defineProperty(popup, 'offsetLeft', {
        configurable: true,
        value: 100
      });
      Object.defineProperty(popup, 'offsetTop', {
        configurable: true,
        value: 100
      });

      // Simule le clic initial
      handleMouseDown({ clientX: 160, clientY: 170 }, popup); // offset = 60 / 70

      // Simule le déplacement
      handleMouseMove({ clientX: 180, clientY: 190 });

      expect(popup.style.left).toBe(`${180 - 60}px`); // 120px
      expect(popup.style.top).toBe(`${190 - 70}px`);  // 120px
    });
  });

  describe('handleMouseUp', () => {
    it('should stop dragging', () => {
      handleMouseDown({ clientX: 150, clientY: 150 }, popup);
      handleMouseUp();
      handleMouseMove({ clientX: 200, clientY: 200 });

      // Ne doit pas avoir modifié la position après mouseup
      expect(popup.style.left).not.toBe(`${200 - (150 - 100)}px`);
    });
  });
});
