import $ from 'jquery';
import keyListenerSvc from '../keyListenerSvc';
import KeyStrokes from '../keystrokes';
import store from '../../store';
import { ZERO_WIDTH } from '../../config/constants';

export default {
  _listenersCreated: false,
  _started: false,
  _createListeners() {
    if (this._listenersCreated) {
      return;
    }
    this._createMenuShortcuts();
    this._listenersCreated = true;
  },
  _createBlockQuoteEscapeListener() {
    keyListenerSvc.addKeyListener(KeyStrokes.Enter, { ctrl: true }, evt => {
      const { range, containerElement, sel: selection } = store.state.selectionData;
      const $nearestBlockquote = $(containerElement).closest('blockquote, .alert');

      range.setStartAfter($nearestBlockquote[0]);
      range.setEndAfter($nearestBlockquote[0]);

      const zeroWidthSpace = document.createTextNode(ZERO_WIDTH);
      const p = document.createElement('p');
      p.appendChild(zeroWidthSpace);

      range.insertNode(p);
      range.setStartBefore(zeroWidthSpace);
      range.setEndBefore(zeroWidthSpace);

      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      evt.preventDefault();
    });
  },
  _createMenuShortcuts() {
    keyListenerSvc.addKeyListener(KeyStrokes.T, { shift: true, alt: true }, evt => {
      store.dispatch('layoutSettings/toggleMenu', 'toc');
      evt.stopPropagation();
      evt.preventDefault();
    });
    keyListenerSvc.addKeyListener(KeyStrokes.C, { shift: true, alt: true }, evt => {
      store.dispatch('layoutSettings/toggleMenu', 'config');
      evt.stopPropagation();
      evt.preventDefault();
    });
    keyListenerSvc.addKeyListener(KeyStrokes.M, { shift: true, alt: true }, evt => {
      store.dispatch('layoutSettings/toggleMenu', 'menu');
      evt.stopPropagation();
      evt.preventDefault();
    });
  },
  registerChangeFontSizeListeners() {
    keyListenerSvc.addKeyListener(KeyStrokes.Plus, { shift: true, alt: true }, evt => {
      store.dispatch('settings/increaseBaseFontSize');
      evt.stopPropagation();
      evt.preventDefault();
    });
    keyListenerSvc.addKeyListener(KeyStrokes.Minus, { shift: true, alt: true }, evt => {
      store.dispatch('settings/decreaseBaseFontSize');
      evt.stopPropagation();
      evt.preventDefault();
    });
    keyListenerSvc.addKeyListener(KeyStrokes.Zero, { shift: true, alt: true }, evt => {
      store.dispatch('settings/resetBaseFontSize');
      evt.stopPropagation();
      evt.preventDefault();
    });
  },
  unregisterChangeFontSizeListeners() {
    keyListenerSvc.removeKeyListener(KeyStrokes.Zero, { shift: true, alt: true });
    keyListenerSvc.removeKeyListener(KeyStrokes.Plus, { shift: true, alt: true });
    keyListenerSvc.removeKeyListener(KeyStrokes.Minus, { shift: true, alt: true });
  },
  registerEditModeListeners() {
    this._createBlockQuoteEscapeListener();
  },
  unregisterEditModeListeners() {
    keyListenerSvc.removeKeyListener(KeyStrokes.Enter, { ctrl: true });
  },
  start() {
    this._createListeners();

    if (this._started) {
      return;
    }
    keyListenerSvc.startListening();
    this._started = true;
  },
  stop() {
    if (this._started) {
      keyListenerSvc.stopListening();
      this._started = false;
    }
  }
};
