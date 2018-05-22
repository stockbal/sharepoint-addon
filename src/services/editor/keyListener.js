import $ from 'jquery';
import keyListenerSvc from '../keyListenerSvc';
import KeyStrokes from '../keystrokes';
import store from '../../store';
import config from '../../config';
import { CODING_SELECTOR, ZERO_WIDTH } from '../../config/constants';
import selectionSvc, { Selection } from '../selectionSvc';
import utils from '../utils';

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

const getTab = node => {
  if (node.parentNode.classList.contains('tab')) {
    return node.parentNode;
  } else if (
    node.previousSibling &&
    node.previousSibling.nodeType !== Node.TEXT_NODE &&
    node.previousSibling.classList.contains('tab')
  ) {
    return node.previousSibling;
  } else {
    return null;
  }
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
  _insertTabsAtStartOfCodingLines(selection) {
    if (selection.isSingleElementSelection()) {
      selection.startParent.insertBefore(utils.createTabElement(), selection.start);
    } else {
      // get all coding lines in selection
      const selectedNodes = selection.getNodesInSelection();
      const uniqueCodingLines = new Set();

      for (const node of selectedNodes) {
        const codingLine = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
        if (codingLine.classList.contains('coding-line')) {
          uniqueCodingLines.add(codingLine);
        }
      }

      for (const codingLine of uniqueCodingLines) {
        if (codingLine.firstChild) {
          codingLine.insertBefore(utils.createTabElement(), codingLine.firstChild);
        } else {
          codingLine.append(utils.createTabElement());
        }
      }
    }
  },
  _removeTabsAtStartOfCodingLines(selection) {
    if (selection.isSingleElementSelection()) {
      const tab = getTab(selection.start);
      if (tab) {
        tab.remove();
      }
    } else {
      // get all coding lines in selection
      const selectedNodes = selection.getNodesInSelection();
      const tabs = new Set();

      for (const node of selectedNodes) {
        const codingLine = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
        if (
          codingLine.classList.contains('coding-line') &&
          codingLine.firstChild &&
          codingLine.firstChild.classList.contains('tab')
        ) {
          tabs.add(codingLine.firstChild);
        }
      }

      for (const tab of tabs) {
        tab.remove();
      }
    }
  },
  _createTabListener() {
    // insert tabulator listener
    keyListenerSvc.addKeyListener(KeyStrokes.Tab, {}, evt => {
      const selection = new Selection();

      if (!selection.hasClass('coding-line')) {
        return;
      }

      if (selection.hasContent) {
        this._insertTabsAtStartOfCodingLines(selection);
      } else {
        const newTab = utils.createTabElement();

        if (selection.end.nextSibling) {
          selection.endParent.insertBefore(newTab, selection.end.nextSibling);
        } else {
          selection.endParent.appendChild(newTab);
        }
        const sel = document.getSelection();
        const range = document.createRange();

        range.setStartAfter(newTab);
        range.setEndAfter(newTab);

        sel.removeAllRanges();
        sel.addRange(range);
      }

      evt.preventDefault();
    });
    // remove tabulator listener
    keyListenerSvc.addKeyListener(KeyStrokes.Tab, { shift: true }, evt => {
      const selection = new Selection();

      if (!selection.hasClass('coding-line')) {
        return;
      }

      if (selection.hasContent) {
        // this._insertTabsAtStartOfCodingLines(selection);
        this._removeTabsAtStartOfCodingLines(selection);
      } else {
        let tabEl;
        if (selection.startParent.classList.contains('tab')) {
          tabEl = selection.startParent;
        } else if (
          selection.start.previousSibling &&
          selection.start.previousSibling.nodeType !== Node.TEXT_NODE &&
          selection.start.previousSibling.classList.contains('tab')
        ) {
          tabEl = selection.start.previousElementSibling;
        }

        if (tabEl) {
          const sel = document.getSelection();
          const range = document.createRange();

          range.setStartBefore(tabEl);
          range.setEndBefore(tabEl);

          sel.removeAllRanges();
          sel.addRange(range);

          // remove the tab
          tabEl.remove();
        }
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
    this._createEscapeListeners();
    this._createTabListener();

    keyListenerSvc.addKeyListener(KeyStrokes.Backspace, { alt: true }, evt => {
      const selection = new Selection();

      if (!selection.hasClass('coding--editable')) {
        return;
      }

      const $codingArea = $(selection.start).closest(CODING_SELECTOR);
      if ($codingArea.length) {
        $codingArea.remove();
        evt.preventDefault();
      }
    });
  },
  unregisterEditModeListeners() {
    keyListenerSvc.removeKeyListener(KeyStrokes.Enter, { ctrl: true });
    keyListenerSvc.removeKeyListener(KeyStrokes.Enter, { ctrl: true, shift: true });
    keyListenerSvc.removeKeyListener(KeyStrokes.Tab);
    keyListenerSvc.removeKeyListener(KeyStrokes.Backspace, { alt: true });
    keyListenerSvc.removeKeyListener(KeyStrokes.Tab, { shift: true });
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
