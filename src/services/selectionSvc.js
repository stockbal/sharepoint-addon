import $ from 'jquery';
import store from '../store';
import config from '../config';

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

class SelectionReader {
  /**
   * Returns the all nodes in the current selection
   * @returns {*}
   */
  getSelectedNodes() {
    return this._getRangeSelectedNodes(getSelection().range);
  }

  _nextNode(node, endNode) {
    if (node.hasChildNodes()) {
      return node.firstChild;
    } else {
      while (node && !node.nextSibling) {
        node = node.parentNode;
        if (node === endNode) {
          return null;
        }
      }
      if (!node) {
        return null;
      }
      return node.nextSibling;
    }
  }

  /**
   * Returns all background nodes in the selected Range
   * @param range the currently selected range
   * @returns {*}
   * @private
   */
  _getRangeSelectedNodes(range) {
    let node = range.startContainer;
    const endNode = range.endContainer;

    // Special case for a range that is contained within a single node
    if (node === endNode) {
      return [node];
    }

    // Iterate nodes until we hit the end container
    const rangeNodes = [];
    while (node && node !== endNode) {
      node = this._nextNode(node, endNode);
      if (node) {
        rangeNodes.push(node);
      }
    }

    // Add partially selected nodes at the start of the range
    node = range.startContainer;
    while (node && node !== range.commonAncestorContainer) {
      rangeNodes.unshift(node);
      node = node.parentNode;
    }

    return rangeNodes;
  }
}

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
  selectionReader: new SelectionReader()
};
