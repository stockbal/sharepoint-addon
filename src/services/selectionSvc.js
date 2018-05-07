import $ from 'jquery';
import store from '../store';
import config from '../config';
import { CODING_SELECTOR } from '../config/constants';

/**
 * Retrieves the current selection data
 * @returns {{text: string, node: Range, containerElement: Element}}
 */
const getSelection = () => {
  let text = '';
  let range = null;
  let sel;
  let containerElement = null;

  if (typeof window.getSelection !== 'undefined') {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      let ancestorContainer = range.commonAncestorContainer;
      containerElement =
        ancestorContainer.nodeType === Node.ELEMENT_NODE
          ? ancestorContainer
          : ancestorContainer.parentNode;
      text = sel.toString();
    }
  } else if (typeof document.selection !== 'undefined' && document.selection.type !== 'Control') {
    let textRange = document.selection.createRange();
    containerElement = textRange.parentElement();
    text = textRange.text;
  }
  return {
    sel,
    text,
    range,
    containerElement
  };
};

class SelectionListener {
  _listener(e) {
    Promise.resolve()
      .then(() => {
        let selection = {};
        if (e.target.activeElement) {
          let $activeElement = $(e.target.activeElement);

          if (
            $activeElement.hasClass(config.elements.sharePointEditorArea) ||
            $activeElement.closest(`.${config.elements.sharePointEditorArea}`).length
          ) {
            selection = getSelection();
          } else {
            // store previous selection until new selection in edtitorial area occurs
            selection = store.state.selectionData;
          }
        }
        return selection;
      })
      .then(selection => {
        store.dispatch('updateSelection', selection);
      });
  }
  start() {
    return Promise.resolve().then(() =>
      document.addEventListener('selectionchange', this._listener)
    );
  }
  stop() {
    return Promise.resolve().then(() =>
      document.removeEventListener('selectionchange', this._listener)
    );
  }
}

export default {
  selectionListener: new SelectionListener(),
  getSelection,
  /**
   * Moves the selection after the passed element
   * @param element
   */
  moveSelectionAfter(element) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStartAfter(element);
    range.setEndAfter(element);
    selection.removeAllRanges();
    selection.addRange(range);
  },
  /**
   * Prevent selection of coding elements by moving
   * the selection after the clicked coding elements
   *
   * This is only relevant for internet explorer to remove
   * the resize boxes of the coding elements
   */
  preventSelectionForCoding() {
    const getCoding = target => {
      let $target = $(target);
      if ($target.is(CODING_SELECTOR)) {
        return $target[0];
      } else {
        $target = $target.closest(CODING_SELECTOR);
        return $target.length ? $target[0] : null;
      }
    };

    const moveSelectionIfCoding = evt => {
      const coding = getCoding(evt.target);
      if (coding) {
        this.moveSelectionAfter(coding);
      }
    };

    document.addEventListener('mousedown', moveSelectionIfCoding);
    document.addEventListener('mouseup', moveSelectionIfCoding);
    document.addEventListener('contextmenu', moveSelectionIfCoding);
  }
};
