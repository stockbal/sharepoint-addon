export class BackgroundRemover {
  constructor(type) {
    switch (type) {
      case 'background':
        this._remover = [this._checkAndRemoveBackground];
        break;
      case 'foreground':
        this._remover = [this._checkAndRemoveForeground];
        break;
      case 'fontsize':
        this._remover = [this._checkAndRemoveFontSize];
        break;
      case 'all':
        this._remover = [
          this._checkAndRemoveBackground,
          this._checkAndRemoveFontSize,
          this._checkAndRemoveForeground
        ];
    }
  }
  /**
   * Retrieves the next node in the tree
   * @param node
   * @returns {*}
   * @private
   */
  _nextNode(node) {
    if (node.hasChildNodes()) {
      return node.firstChild;
    } else {
      while (node && !node.nextSibling) {
        node = node.parentNode;
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
      node = this._nextNode(node);
      rangeNodes.push(node);
    }

    // Add partially selected nodes at the start of the range
    node = range.startContainer;
    while (node && node !== range.commonAncestorContainer) {
      rangeNodes.unshift(node);
      node = node.parentNode;
    }

    return rangeNodes;
  }

  _checkAndRemoveFormatting(node) {
    if (!node || node.nodeType === Node.TEXT_NODE) {
      return;
    }

    for (const remover of this._remover) {
      remover(node);
    }
  }

  _checkAndRemoveForeground(node) {
    const regex = /ms-rte(Theme)?ForeColor.*/;
    if (node.hasClass(regex)) {
      node.removeClass(regex);
    }
    if (node.style.color) {
      node.style.color = '';
    }
  }

  _checkAndRemoveBackground(node) {
    const regex = /ms-rte(Theme)?BackColor.*/;
    if (node.hasClass(regex)) {
      node.removeClass(regex);
    }
    if (node.style.background) {
      node.style.background = '';
    }
    if (node.style.backgroundColor) {
      node.style.backgroundColor = '';
    }
  }

  _checkAndRemoveFontSize(node) {
    if (node.style.fontSize) {
      node.style.fontSize = '';
    }
  }

  /**
   * Returns the all nodes in the current selection
   * @returns {*}
   * @private
   */
  _getSelectedNodes() {
    if (window.getSelection) {
      const sel = window.getSelection();
      return this._getRangeSelectedNodes(sel.getRangeAt(0));
    }
    return [];
  }

  /**
   * Removes the background color from all nodes
   * in the selection where a theme background color was found
   */
  removeFormattingFromSelection() {
    let selectedNodes = this._getSelectedNodes();

    if (selectedNodes.length === 1) {
      let singleNode = selectedNodes[0];
      if (singleNode.nodeType === Node.TEXT_NODE) {
        singleNode = singleNode.parentNode;
      }
      selectedNodes = [singleNode];
    }

    for (const backgroundNode of selectedNodes) {
      this._checkAndRemoveFormatting(backgroundNode);
    }
  }
}
