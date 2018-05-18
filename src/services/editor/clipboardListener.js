/* eslint-disable no-unused-vars */
import store from '../../store';
import config from '../../config';
import $ from 'jquery';
import { CODING_SELECTOR } from '../../config/constants';
import browser from '../browser';
import utils from '../utils';
import selectionSvc from '../selectionSvc';

/**
 * Listener for ClipBoard events
 * (handles currently only coding areas)
 */
export class ClipBoardListener {
  static start() {
    document.body.addEventListener('paste', ClipBoardListener._listener, true);
  }
  static stop() {
    document.body.removeEventListener('paste', ClipBoardListener._listener);
  }
  static _createNewCodingLines(range, selectionHasText, rangeInCodingLine, rangeContainer, text) {
    const codingLines = browser.isIE() ? text.split('\r\n') : text.split('\n');

    let codingLine;
    for (let textLine of codingLines) {
      if (codingLine) {
        range.setStartAfter(codingLine);
        range.setEndAfter(codingLine);
      }

      if (!selectionHasText && rangeInCodingLine) {
        if (range.startOffset) {
          let offsetText = rangeContainer.innerText;
          offsetText =
            offsetText.substring(0, range.startOffset) +
            textLine +
            offsetText.substring(range.startOffset);
          rangeContainer.innerHTML = utils.escapeXML(offsetText);
        } else {
          rangeContainer.innerHTML = utils.escapeXML(textLine);
        }

        range.setStartAfter(rangeContainer);
        range.setEndAfter(rangeContainer);
        rangeInCodingLine = false;
      } else {
        codingLine = document.createElement('div');
        codingLine.classList.add('coding-line');
        codingLine.innerHTML = utils.escapeXML(textLine);
        range.insertNode(codingLine);
      }
    }
  }
  static _createNewCodingLineForInline(text) {
    // remove any line breaks
    if (browser.isIE()) {
      text = text.replace('\r\n', '');
    } else {
      text = text.replace('\n');
    }

    return document.createTextNode(text);
  }
  static _listener(evt) {
    // first check the current selection
    const { text, range, containerElement, sel } = selectionSvc.getSelection();

    let $containerElement = $(containerElement);
    if ($containerElement.is(`.${config.elements.sharePointEditorArea}`)) {
      $containerElement = $(sel.anchorNode.parentNode);
    }

    // check if selection resides inside coding area
    const isCodingArea = $containerElement.is(CODING_SELECTOR);
    const isCodingLine = $containerElement.is('.coding-line');

    if (!isCodingArea && !isCodingLine) {
      return;
    }
    const selectionHasText = text !== '';
    let $codingArea = isCodingArea ? $containerElement : $containerElement.closest(CODING_SELECTOR);
    const isInline = $codingArea.prop('tagName') === 'SPAN';

    let paste = (evt.clipboardData || window.clipboardData).getData('text');

    if (selectionHasText) {
      range.deleteContents();
    }

    if (isInline) {
      const textNode = ClipBoardListener._createNewCodingLineForInline(paste);
      range.insertNode(textNode);
    } else {
      ClipBoardListener._createNewCodingLines(
        range,
        selectionHasText,
        isCodingLine,
        $containerElement[0],
        paste
      );
    }
    evt.preventDefault();
    return false;
  }
}
