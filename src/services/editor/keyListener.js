import $ from 'jquery';
import keyListenerSvc from '../keyListenerSvc';
import KeyStrokes from '../keystrokes';
import store from '../../store';
import config from '../../config';
import { CODING_SELECTOR, ZERO_WIDTH } from '../../config/constants';
import selectionSvc from '../selectionSvc';

const updateRange = (selection, range, evt) => {
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
  evt.preventDefault();
};

const insertBreak = (element, range, afterElement) => {
  if (afterElement) {
    range.setStartAfter(element);
    range.setEndAfter(element);
  } else {
    range.setStartBefore(element);
    range.setEndBefore(element);
  }

  const zeroWidthSpace = document.createTextNode(ZERO_WIDTH);
  const p = document.createElement('p');
  p.appendChild(zeroWidthSpace);

  range.insertNode(p);
  range.setStartBefore(zeroWidthSpace);
  range.setEndBefore(zeroWidthSpace);
};

const insertSpace = (element, range, afterElement) => {
  if (afterElement) {
    range.setStartAfter(element);
    range.setEndAfter(element);
  } else {
    range.setStartBefore(element);
    range.setEndBefore(element);
  }

  const spaceSpan = document.createElement('span');
  const zeroWidth = document.createTextNode(ZERO_WIDTH);
  spaceSpan.appendChild(zeroWidth);

  range.insertNode(spaceSpan);
  range.setStartAfter(zeroWidth);
  range.setEndAfter(zeroWidth);
};

export default {
  _listenersCreated: false,
  _started: false,
  _createListeners() {
    if (this._listenersCreated) {
      return;
    }
    this._createMenuShortcuts();
    this._connectSPActionButtons(store.state.editMode);
    this._listenersCreated = true;
  },
  _escapeElement(evt, escapeAfter = true) {
    const { range, containerElement, sel: selection } = selectionSvc.getSelection();
    const $nearestBlockquote = $(containerElement).closest('blockquote, .alert');

    if ($nearestBlockquote.length) {
      insertBreak($nearestBlockquote[0], range, escapeAfter);
      updateRange(selection, range, evt);
    } else {
      const $codingArea = $(containerElement).closest(CODING_SELECTOR);
      if ($codingArea.length) {
        if ($codingArea.prop('tagName') === 'DIV') {
          insertBreak($codingArea[0], range, escapeAfter);
        } else {
          insertSpace($codingArea[0], range, escapeAfter);
        }

        updateRange(selection, range, evt);
      }
    }
  },
  _createEscapeListeners() {
    keyListenerSvc.addKeyListener(KeyStrokes.Enter, { ctrl: true }, evt => {
      this._escapeElement(evt);
    });
    keyListenerSvc.addKeyListener(KeyStrokes.Enter, { ctrl: true, shift: true }, evt => {
      this._escapeElement(evt, false);
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
    this._createEscapeListeners();
  },
  unregisterEditModeListeners() {
    keyListenerSvc.removeKeyListener(KeyStrokes.Enter, { ctrl: true });
  },
  _connectSPActionButtons(editMode) {
    const defaultActionKeyStroke = editMode ? KeyStrokes.S : KeyStrokes.E;
    keyListenerSvc.addKeyListener(defaultActionKeyStroke, { ctrl: true }, evt => {
      const defaultButton = document.getElementById(config.elements.saveEditButtonId);
      if (defaultButton) {
        defaultButton.click();
        evt.preventDefault();
      }
    });
    if (editMode) {
      keyListenerSvc.addKeyListener(KeyStrokes.E, { ctrl: true, alt: true }, evt => {
        const editSourceButton = document.getElementById(config.elements.editSourceCodeButtonId);
        if (editSourceButton) {
          editSourceButton.click();
          evt.preventDefault();
        }
      });
    }
    if (editMode) {
      keyListenerSvc.addKeyListener(KeyStrokes.Q, { ctrl: true }, evt => {
        const editDropdownButton = document.querySelector('a.ms-cui-ctl-a2[title="Bearbeiten"]');
        if (editDropdownButton) {
          editDropdownButton.click();

          setTimeout(() => {
            const quitWithoutSavingButton = document.querySelector(
              'a[aria-describedby="Ribbon.EditingTools.CPEditTab.EditAndCheckout.SaveEdit.Menu.SaveEdit.StopEditing_ToolTip"]'
            );
            if (quitWithoutSavingButton) {
              quitWithoutSavingButton.click();
            }
          }, 1);
        }
      });
    }

    keyListenerSvc.addKeyListener(KeyStrokes.F11, { ctrl: true }, evt => {
      const fullScreenModeButton = document.getElementById(config.elements.fullScreenModeElementId);

      if (fullScreenModeButton.style.display === 'none') {
        const exitFullScreenmodeButton = document.getElementById(
          config.elements.exitFullScreenModeButtonId
        );
        if (exitFullScreenmodeButton) {
          exitFullScreenmodeButton.click();
          evt.preventDefault();
        }
      } else {
        const fullscreenModeButton = document.getElementById(config.elements.fullScreeModeButtonId);
        if (fullscreenModeButton) {
          fullscreenModeButton.click();
          evt.preventDefault();
        }
      }
    });
  },
  _disconnectSPActionButtons(editMode) {
    keyListenerSvc.removeKeyListener(editMode ? KeyStrokes.S : KeyStrokes.E, { ctrl: true });
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
