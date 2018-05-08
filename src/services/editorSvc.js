import store from '../store';
import selectionSvc from './selectionSvc';
import Prism from 'prismjs';
import codeCreatorSvc from './codeCreatorSvc';
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
   * Opens the editor modal for the past element
   * @param $coding jquery element
   * @returns {Promise<void>}
   */
  async _openEditorForElement($coding) {
    try {
      await selectionSvc.selectionListener.stop();
      let code = await store.dispatch('modal/open', {
        type: 'editor',
        ...this._getCodingInfo($coding)
      });
      this.createCode({ ...code, element: $coding });
    } catch (e) {
      if (e) {
        logger.error(e);
      }
    }
    selectionSvc.selectionListener.start();
  },
  /**
   * Inserts/updates styled coding
   * @param printLineNumbers
   * @param inline
   * @param text
   * @param language
   * @param element
   * @param fromSelection
   */
  createCode({
    printLineNumbers = false,
    inline,
    text,
    language = 'markup',
    element = null,
    fromSelection = false
  }) {
    if (text === '') {
      logger.error('No code was passed for saving...');
      // for testing only
      return;
    }

    codeCreatorSvc.createCoding({
      element,
      code: text,
      language,
      makeInline: inline,
      printLineNumbers,
      fromSelection
    });

    // highlight contentBox
    this.highlightCode();
  },
  async addCoding() {
    try {
      // check if there is a text selection
      const text = store.state.selectionData ? store.state.selectionData.text : '';
      await selectionSvc.selectionListener.stop();

      const code = await store.dispatch('modal/open', {
        type: 'editor',
        text
      });

      const selectedText = store.state.selectionData ? store.state.selectionData.text : '';
      if (selectedText) {
        store.state.selectionData.range.deleteContents();
      }

      this.createCode(code);
    } catch (e) {
      if (e) {
        logger.error(e);
      }
    }
    return selectionSvc.selectionListener.start();
  },
  _pasteClipboard() {
    const clipBoard = store.state.clipboardData;
    const range = store.state.selectionData.range;

    range.deleteContents();
    range.insertNode(clipBoard.content.cloneNode(true));
  },
  /**
   * Connverts the passed coding element to text form
   * @param $coding
   */
  _convertCodeToText($coding) {
    const text = $coding.find('code').text();

    const newSpan = text => {
      const span = document.createElement('span');
      span.textContent = text;
      return span;
    };

    if ($coding[0].getData('inline')) {
      $coding.replaceWith(document.createTextNode(text));
    } else {
      const paragraph = document.createElement('p');
      const textLines = text.split('\n');

      for (let line of textLines) {
        // split beginning tabs and the rest of the text
        let beginningTabs = /^\t*/.exec(line);
        if (beginningTabs) {
          const tabs = newSpan(beginningTabs[0]);
          tabs.style.whiteSpace = 'pre';
          paragraph.appendChild(tabs);
          // remove found tabs from line
          line = line.replace(/^\t*/g, '');
        }

        const span = newSpan(line);
        paragraph.appendChild(span);

        const spanBreak = newSpan('');
        spanBreak.innerHTML = '\n<br>';
        paragraph.appendChild(spanBreak);
      }

      $coding.replaceWith(paragraph);
    }
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
      eventProxy.on('openEditorWith', $coding => {
        this._openEditorForElement($coding);
      });

      eventProxy.on('createCode', async () => this.addCoding());
      eventProxy.on('createInlineCode', () => {
        this.createCode({
          inline: true,
          text: store.state.selectionData.text,
          language: 'markdown',
          fromSelection: true
        });
      });
      eventProxy.on('convertToText', $coding => this._convertCodeToText($coding));
      eventProxy.on('blockquote', () => this._createBlockQuote());
      eventProxy.on('alert', type => this._createAlert(type));
      eventProxy.on('paste', () => this._pasteClipboard());
      eventProxy.on('removeFormatting', type => this._removeFormatting(type));
    } else {
      ImagePreview.createImgListeners();
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
    if (store.state.settings.codeEditorDisabled) {
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
    contextMenuListener.start();
    keyListener.registerEditModeListeners();
    selectionSvc.selectionListener.start();
  },
  /**
   * Disables the editor
   * @private
   */
  _disableEditor() {
    contextMenuListener.stop();
    keyListener.unregisterEditModeListeners();
    selectionSvc.selectionListener.stop();
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
    keyListener.start();
    await this._updateEditMode();
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
    this._setCustomEditorStyle();
    this._updatePrismStyle();
    this._scrollToLoadedLocation();
  }
};
