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
import { TextStyleRemover } from './editor/textStyleRemover';
import eventProxy from '../util/eventProxy';
import './editorUtilsSvc';
import { CodeConverter } from './editor/codeConverter';
import { ClipBoardListener } from './editor/clipboardListener';
import tocSvc from './tocSvc';

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
    new TextStyleRemover(type).removeFormattingFromSelection();
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
   * Determines the
   * @returns {Promise<*>}
   */
  async determineEditMode() {
    return store.dispatch(
      'setEditMode',
      !$(`.${config.cssClasses.sharePointReadOnlyClass}`).length
    );
  },
  /**
   * Hides the web part where the add on was loaded
   * @private
   */
  _hideInitializingWebPartContainer() {
    let webPart = document.getElementById('app');
    if (!webPart) {
      return;
    }
    while (webPart) {
      if (webPart.classList.contains('ms-rte-wpbox')) {
        // hide the outer webPart container
        webPart.style.display = 'none';
        break;
      }
      webPart = webPart.parentElement;
    }
  },
  /**
   * Performs necessary actions according to edit/read-only mode
   * @public
   */
  updateEditMode() {
    const codeConverter = new CodeConverter();
    // check if wiki site resides in edit mode, by checking
    if (store.state.editMode) {
      const { editorDisabled } = store.state.settings;

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
      eventProxy.on('updateToc', () => tocSvc.synchronizeTableOfContents());
      // one time conversion of coding preview areas to editing areas
      codeConverter.convertPreviewAreasToEditableAreas();
      codeConverter.convertLineBreaksToNonBreaking();
    } else {
      this._hideInitializingWebPartContainer();
      this._scrollToStateLocation(history.state, true);
      ImagePreview.createImgListeners();

      codeConverter.convertCodingAreas();
      codeConverter.convertADTLinks();
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
    if (store.state.editMode) {
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
  _scrollToStateLocation(state) {
    if (state) {
      if (state.hasOwnProperty('headingId')) {
        this._scrollToElementInWorkspace(state.headingId);
      } else if (state.hasOwnProperty('workspaceTop')) {
        $(`#${config.elements.workspaceElementId}`).scrollTop(state.workspaceTop);
      }
    } else {
      // check if hash is filled
      this._scrollToElementInWorkspace(window.location.hash);
    }
  },
  _scrollToElementInWorkspace(elementId) {
    const $workspace = $(`#${config.elements.workspaceElementId}`);

    if (elementId) {
      $workspace.scrollTop(
        $(elementId).offset().top - $workspace.offset().top + $workspace.scrollTop()
      );
    } else {
      $workspace.scrollTop(0);
    }
  },
  /**
   * Creates the custom editor style sheet
   * @private
   */
  _setCustomEditorStyle(updateBaseFontSize = false) {
    styleSvc.createCustomStyles(updateBaseFontSize);
    this._updatePrismStyle();
  },
  /**
   * Inserts ADT Link section at the current position
   * @private
   */
  _insertADTLink: function() {
    let selectionData = store.state.selectionData;

    // check if selection resides already inside adtLink
    const adtLink = document.createElement('span');
    adtLink.classList.add('adt-link');
    adtLink.innerText = `[${
      store.state.selectionData ? store.state.selectionData.text : 'adt://...'
    }](Name of link)`;

    selectionData.range.deleteContents();
    selectionData.sel.removeAllRanges();
    selectionData.range.insertNode(adtLink);
    selectionData.range.setStartBefore(adtLink);
    selectionData.range.setEndAfter(adtLink);
  },
  /**
   * Main initialisation for the editor functions
   */
  init() {
    eventProxy.on('disableEditor', () => this._disableEditor());
    eventProxy.on('enableEditor', () => this._enableEditor());
    eventProxy.on('updatePrismStyle', () => this._updatePrismStyle());
    eventProxy.on('insertADTLink', () => this._insertADTLink());
    eventProxy.on('setCustomStyle', (updateBaseFontSize = true) =>
      this._setCustomEditorStyle(updateBaseFontSize)
    );
    eventProxy.on('deactivateCustomEditorStyle', () => this._updatePrismStyle());
    eventProxy.on('activateCustomEditorStyle', () => this._updatePrismStyle());

    this._setCustomEditorStyle();
    this.updateEditMode();
    keyListener.start();

    eventProxy.on('navigateToHeading', headingIdSelector => {
      history.pushState({ headingId: headingIdSelector }, '', headingIdSelector);
      this._scrollToElementInWorkspace(headingIdSelector);
    });
    window.addEventListener('beforeunload', evt => {
      history.replaceState(
        { workspaceTop: $(`#${config.elements.workspaceElementId}`).scrollTop() },
        '',
        '#'
      );
    });
    window.addEventListener('popstate', evt => {
      this._scrollToStateLocation(evt.state);
    });
  }
};
