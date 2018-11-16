import $ from 'jquery';
import keyListenerSvc from '../keyListenerSvc';
import KeyStrokes from '../keystrokes';
import store from '../../store';
import config from '../../config';
import { ADT_LINK_SELECTOR, CODING_SELECTOR, ZERO_WIDTH } from '../../config/constants';
import selectionSvc, { RangeCursor } from '../selectionSvc';
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
    let $codingArea = null;
    let $adtLinkArea = null;
    let isCoding = false;
    let isBlockQuote = false;
    let isADTLink = false;

    const { range, containerElement, sel: selection } = selectionSvc.getSelection();
    const $nearestBlockquote = $(containerElement).closest('blockquote, .alert');

    if ($nearestBlockquote.length) {
      isBlockQuote = true;
    } else {
      $codingArea = $(containerElement).closest(CODING_SELECTOR);
      if ($codingArea.length) {
        isCoding = true;
      } else {
        // is it inside ADT Link?
        $adtLinkArea = $(containerElement).closest(ADT_LINK_SELECTOR);
        if ($adtLinkArea.length) {
          isADTLink = true;
        }
      }
    }

    if (isCoding) {
      if ($codingArea.prop('tagName') === 'DIV') {
        insertBreak($codingArea[0], range, escapeAfter);
      } else {
        insertSpace($codingArea[0], range, escapeAfter);
      }
      updateRange(selection, range, evt);
    } else if (isBlockQuote) {
      insertBreak($nearestBlockquote[0], range, escapeAfter);
      updateRange(selection, range, evt);
    } else if (isADTLink) {
      insertSpace($adtLinkArea[0], range, escapeAfter);
      updateRange(selection, range, evt);
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
      utils.createTabElement().insertBeforeNode(selection.start);
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
          utils.createTabElement().insertBeforeNode(codingLine.firstChild);
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
          codingLine.firstChild.nodeType !== Node.TEXT_NODE &&
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
      const rangeCursor = new RangeCursor();

      if (!rangeCursor.isClosestTo('coding-line')) {
        return;
      }

      if (rangeCursor.hasContent) {
        this._insertTabsAtStartOfCodingLines(rangeCursor);
      } else {
        const newTab = utils.createTabElement();

        if (rangeCursor.getClosestToStart('tab')) {
          newTab.insertAfterNode(rangeCursor.startParent);
        } else {
          newTab.insertBeforeNode(rangeCursor.start);
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
      const rangeCursor = new RangeCursor();

      if (!rangeCursor.isClosestTo('coding-line')) {
        return;
      }

      if (rangeCursor.hasContent) {
        this._removeTabsAtStartOfCodingLines(rangeCursor);
      } else {
        let tabEl;
        if (rangeCursor.startParent.classList.contains('tab')) {
          tabEl = rangeCursor.startParent;
        } else if (
          rangeCursor.start.previousSibling &&
          rangeCursor.start.previousSibling.nodeType !== Node.TEXT_NODE &&
          rangeCursor.start.previousSibling.classList.contains('tab')
        ) {
          tabEl = rangeCursor.start.previousElementSibling;
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
      const { containerElement } = selectionSvc.getSelection();

      const $codingArea = $(containerElement).closest(CODING_SELECTOR);
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
