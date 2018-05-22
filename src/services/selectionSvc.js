/* eslint-disable no-unused-vars */

import config from '../config';

export class Selection {
  constructor() {
    this._nodes = [];
    this._start = document.getElementById(config.elements.rangeStart);
    this._end = document.getElementById(config.elements.rangeEnd);
    this._hasContent = this._start && this._end && this._end !== this._start.nextSibling;
    this._startParent = this._start.parentElement;
    this._endParent = this._end.parentElement;

    this._startParent.parentElement.normalize();
  }
  get start() {
    return this._start;
  }
  get end() {
    return this._end;
  }
  get startParent() {
    return this._startParent;
  }
  get endParent() {
    return this._endParent;
  }
  get hasContent() {
    return this._hasContent;
  }
  isSingleElementSelection() {
    return this._startParent === this._endParent;
  }
  hasClass(className) {
    let startNode = this._startParent;
    while (startNode && startNode !== document) {
      if (startNode.classList.contains(className)) {
        return true;
      }

      startNode = startNode.parentNode;
    }
    return false;
  }
  getNodesInSelection() {
    if (this._start === undefined || this._end === undefined || !this._hasContent) {
      this._nodes = [];
      return this._nodes;
    }

    let node = this._start;
    const endNode = this._end;

    // Iterate nodes until we hit the end container
    while (node && node !== endNode) {
      node = this._nextNode(node, endNode);
      if (node && node !== endNode) {
        this._nodes.push(node);
      }
    }

    return this._nodes;
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
}
/**
 * Retrieves the current selection data
 * @returns {{text: string, node: Range, containerElement: Element}}
 */
const getSelection = () => {
  let text = '';
  let range = null;
  let containerElement = null;

  const sel = window.getSelection();

  if (sel.rangeCount) {
    range = sel.getRangeAt(0);

    let ancestorContainer = range.commonAncestorContainer;
    containerElement =
      ancestorContainer.nodeType === Node.ELEMENT_NODE
        ? ancestorContainer
        : ancestorContainer.parentNode;
    text = sel.toString();
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
  getSelectedNodes(range = null) {
    return this._getRangeSelectedNodes(range || getSelection().range);
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

export default {
  getSelection,
  selectionReader: new SelectionReader()
};
