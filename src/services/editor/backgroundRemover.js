import selectionSvc from '../selectionSvc';

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

  _checkAndRemoveFormatting(node) {
    if (!node || !(node instanceof HTMLElement)) {
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
   * Removes the background color from all nodes
   * in the selection where a theme background color was found
   */
  removeFormattingFromSelection() {
    let selectedNodes = selectionSvc.selectionReader.getSelectedNodes();

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
