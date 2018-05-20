import store from '../store';
import Prism from 'prismjs';
import Logger from 'js-logger';
import config from '../config';
import utils from './utils';
import $ from 'jquery';
import contextMenuListener from './editor/contextMenuListener';
import keyListener from './editor/keyListener';
import { styleSvc } from './styleSvc';
import { ImagePreview } from './editor/imagePreview';
import { BackgroundRemover } from './editor/backgroundRemover';
import eventProxy from '../util/eventProxy';
import './editorUtilsSvc';
import { CodeConverter } from './editor/codeConverter';
import { ClipBoardListener } from './editor/clipboardListener';

const logger = Logger.get('Editor Service');

export default {
  /**
   * Gets the coding information from the element by
   * using the custom <code>data</code> attributes
   * @param $element
   * @private
   */
  _getCodingInfo($element) {
    const element = $element[0];

    return {
      printLineNumbers: element.getData('line-numbers'),
      inline: element.getData('inline'),
      language: element.getData('language'),
      text: $element.find('code').text()
    };
  },
  /**
   * Creates a coding area element into editor
   * @param text
   * @param inline
   */
  createCodingArea(text = '', inline = false) {
    const { range, sel } = store.state.selectionData;
    const codingArea = document.createElement(inline ? 'span' : 'div');
    codingArea.classList.add('coding--editable');

    const createCodingLine = (text, type) => {
      const codingLine = document.createElement(type);
      codingLine.classList.add('coding-line');
      codingLine.innerText = text;

      codingArea.appendChild(codingLine);
    };

    if (inline) {
      createCodingLine(text, 'span');
    } else {
      const codingLines = text === '' ? ['Enter Coding here...'] : text.split('\n');
      for (const codingLine of codingLines) {
        createCodingLine(codingLine, 'div');
      }
    }

    codingArea.setData('language', 'markup');

    range.insertNode(codingArea);

    // select all coding lines
    sel.removeAllRanges();

    range.setStartBefore(codingArea.firstElementChild.childNodes[0]);
    range.setEndAfter(codingArea.lastElementChild.childNodes[0]);
    sel.addRange(range);
  },
  addCoding(inline = false) {
    const selectedText = store.state.selectionData ? store.state.selectionData.text : '';
    if (selectedText) {
      store.state.selectionData.range.deleteContents();
    }

    this.createCodingArea(selectedText, inline);
  },
  _pasteClipboard() {
    const clipBoard = store.state.clipboardData;
    const range = store.state.selectionData.range;

    range.deleteContents();
    range.insertNode(clipBoard.content.cloneNode(true));
  },
  /**
   * Removes the defined background from the selected nodes
   * @param type
   * @private
   */
  _removeFormatting(type) {
    new BackgroundRemover(type).removeFormattingFromSelection();
  },
  /**
   * Creates a block quote at the current caret position / text selection
   */
  _createBlockQuote() {
    let selectionData = store.state.selectionData;

    if (!selectionData) {
      logger.error('No Selection data available');
      return;
    }

    const blockquote = document.createElement('blockquote');
    blockquote.classList.add('quote');
    const paragraph = document.createElement('p');
    blockquote.appendChild(paragraph);

    if (selectionData.text) {
      paragraph.appendChild(selectionData.range.cloneContents());
    } else {
      paragraph.appendChild(document.createTextNode('New Quote goes here'));
    }
    selectionData.range.deleteContents();
    selectionData.range.insertNode(blockquote);
  },
  /**
   * Creates an alert block to capture attention of reader
   * @param type type of alert
   *    possible values are 'success', 'info, 'warning', 'danger'
   * @private
   */
  _createAlert(type) {
    let selectionData = store.state.selectionData;
    let $possibleAlert = null;
    let alreadyAlert = false;

    if (!selectionData) {
      logger.error('No Selection data available');
      return;
    }

    // check if selection resides already inside alert
    if (selectionData.containerElement) {
      $possibleAlert = $(selectionData.containerElement);
      if ($possibleAlert.is('.alert')) {
        alreadyAlert = true;
      } else {
        const $parentAlert = $possibleAlert.closest('.alert');
        if ($parentAlert.length) {
          alreadyAlert = true;
          $possibleAlert = $parentAlert;
        }
      }
    }

    if (alreadyAlert) {
      const currentAlertType = utils.queryClassByPattern($possibleAlert, /alert--(\w+)/);
      if (currentAlertType !== type) {
        $possibleAlert.removeClass(`alert--${currentAlertType}`);
        $possibleAlert.addClass(`alert--${type}`);
      }
    } else {
      const alert = document.createElement('div');
      alert.classList.add('alert');
      alert.classList.add(`alert--${type}`);
      const paragraph = document.createElement('p');
      alert.appendChild(paragraph);

      if (selectionData.text) {
        paragraph.appendChild(selectionData.range.cloneContents());
      } else {
        paragraph.appendChild(document.createTextNode('Alert text'));
      }

      selectionData.range.deleteContents();
      selectionData.sel.removeAllRanges();
      selectionData.range.insertNode(alert);
      selectionData.range.setStartBefore(alert);
      selectionData.range.setEndAfter(alert);
    }
  },
  /**
   * Checks if edit mode is active and performs necessary
   * actions
   * @returns {Promise<void>}
   * @private
   */
  async _updateEditMode() {
    const codeConverter = new CodeConverter();
    // check if wiki site resides in edit mode, by checking
    if (!$(`.${config.cssClasses.sharePointReadOnlyClass}`).length) {
      await store.dispatch('toggleEditMode');
      const { editorDisabled, codeEditorDisabled } = store.state.settings;

      if (codeEditorDisabled) {
        this._disableCodeEditor();
      } else {
        this._enableCodeEditor();
      }

      if (editorDisabled) {
        this._disableEditor();
      } else {
        this._enableEditor();
      }

      // connect some listeners
      eventProxy.on('createCode', () => this.addCoding());
      eventProxy.on('createInlineCode', () => this.addCoding(true));
      eventProxy.on('blockquote', () => this._createBlockQuote());
      eventProxy.on('alert', type => this._createAlert(type));
      eventProxy.on('paste', () => this._pasteClipboard());
      eventProxy.on('removeFormatting', type => this._removeFormatting(type));

      // one time conversion of coding preview areas to editing areas
      codeConverter.convertPreviewAreasToEditableAreas();
    } else {
      ImagePreview.createImgListeners();

      codeConverter.convertCodingAreas();
      this._updatePrismStyle();
      this.highlightCode();
    }
  },
  highlightCode() {
    Prism.highlightAllUnder(document.getElementById(config.elements.editorContentElementId));
  },
  /**
   * Update the documents code styling according
   * to the currently chosen prism theme
   * @private
   */
  _updatePrismStyle() {
    if (store.state.settings.codeEditorDisabled || store.state.editMode) {
      return;
    }
    let $editorArea = $(`#${config.elements.editorContentElementId}`);
    const currentlyAppliedPrismStyle = utils.queryClassByPattern($editorArea, /(prism[\w-]+)/);
    const settingsPrismTheme = store.state.settings.codeEditorTheme;

    if (currentlyAppliedPrismStyle !== settingsPrismTheme) {
      $editorArea.removeClass(currentlyAppliedPrismStyle);
      $editorArea.addClass(settingsPrismTheme);
    }
    this.highlightCode();
  },
  /**
   * Disables the code editor features
   * @private
   */
  _disableCodeEditor() {
    this.disableCodeTheming();
  },
  /**
   * Enables the code editor features
   * @private
   */
  _enableCodeEditor() {
    this._updatePrismStyle();
  },
  /**
   * Enables the editor
   * @private
   */
  _enableEditor() {
    ClipBoardListener.start();
    contextMenuListener.start();
    keyListener.registerEditModeListeners();
  },
  /**
   * Disables the editor
   * @private
   */
  _disableEditor() {
    ClipBoardListener.stop();
    contextMenuListener.stop();
    keyListener.unregisterEditModeListeners();
  },
  /**
   * Disables the prism theming for all code blocks
   */
  disableCodeTheming() {
    const $editorArea = $(`#${config.elements.editorContentElementId}`);
    const currentlyAppliedPrismStyle = utils.queryClassByPattern($editorArea, /(prism[\w-]+)/);
    if (currentlyAppliedPrismStyle) {
      $editorArea.removeClass(currentlyAppliedPrismStyle);
    }
  },
  _scrollToLoadedLocation() {
    if (!window.location.hash) {
      return;
    }

    setTimeout(() => {
      const $workSpace = $(`#${config.elements.workspaceElementId}`);
      $workSpace.scrollTop(
        $workSpace.scrollTop() - $workSpace.offset().top + $(window.location.hash).offset().top
      );
    }, 2);
  },
  /**
   * Creates the custom editor style sheet
   * @private
   */
  _setCustomEditorStyle(updateBaseFontSize = false) {
    styleSvc.createCustomStyles(updateBaseFontSize);
    this._updatePrismStyle();
  },
  async init() {
    eventProxy.on('disableCodeEditor', () => this._disableCodeEditor());
    eventProxy.on('enableCodeEditor', () => this._enableCodeEditor());
    eventProxy.on('disableEditor', () => this._disableEditor());
    eventProxy.on('enableEditor', () => this._enableEditor());
    eventProxy.on('updatePrismStyle', () => this._updatePrismStyle());
    eventProxy.on('setCustomStyle', (updateBaseFontSize = true) =>
      this._setCustomEditorStyle(updateBaseFontSize)
    );
    eventProxy.on('deactivateCustomEditorStyle', () => this._updatePrismStyle());
    eventProxy.on('activateCustomEditorStyle', () => this._updatePrismStyle());

    await this._updateEditMode();
    keyListener.start();
    this._setCustomEditorStyle();
    this._scrollToLoadedLocation();
  }
};
