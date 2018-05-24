/* eslint-disable no-unused-vars */
import browser from '../browser';
import $ from 'jquery';
import utils from '../utils';
import selectionSvc from '../selectionSvc';
import { CODING_SELECTOR } from '../../config/constants';
import config from '../../config';

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
  static _createNewCodingLines(rangeCursor, text) {
    const codingLines = browser.isIE() ? text.split('\r\n') : text.split('\n');

    const newRange = document.createRange();
    let codingLine = null;
    const restNodes = [];
    let isFirstLine = true;
    let lastInserted;

    for (let textLine of codingLines) {
      if (isFirstLine) {
        const spanInCodingLine = document.createElement('span');
        spanInCodingLine.innerHTML = utils.escapeXML(textLine);
        spanInCodingLine.insertBeforeNode(rangeCursor.start);

        if (codingLines.length > 1) {
          let node = rangeCursor.end.nextSibling;
          while (node) {
            restNodes.push(node);
            node = node.nextSibling;
          }
        } else {
          // no more lines exist, so the new range starts after the inserted content
          newRange.setStartAfter(spanInCodingLine);
          newRange.setEndAfter(spanInCodingLine);
        }
        isFirstLine = false;
      } else {
        lastInserted = codingLine;
        codingLine = document.createElement('div');
        codingLine.classList.add('coding-line');
        codingLine.innerHTML = utils.escapeXML(textLine);

        // insert new line
        if (lastInserted) {
          codingLine.insertAfterNode(lastInserted);
        } else {
          codingLine.insertAfterNode(rangeCursor.startParent);
        }
      }
    }

    if (codingLine) {
      if (restNodes.length) {
        for (const node of restNodes) {
          codingLine.appendChild(node);
        }
        newRange.setStartAfter(codingLine.lastChild ? codingLine.lastChild : codingLine);
        newRange.setEndAfter(codingLine.lastChild ? codingLine.lastChild : codingLine);
      } else {
        newRange.setStartAfter(codingLine.lastChild ? codingLine.lastChild : codingLine);
        newRange.setEndAfter(codingLine.lastChild ? codingLine.lastChild : codingLine);
      }
    }

    return newRange;
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
    const { sel, containerElement } = selectionSvc.getSelection();

    let $containerElement = $(containerElement);
    if ($containerElement.is(`.${config.elements.sharePointEditorArea}`)) {
      $containerElement = $(sel.anchorNode.parentNode);
    }

    // check if selection resides inside coding area
    const isCodingArea = $containerElement.is(CODING_SELECTOR);
    const isCodingLine = $containerElement.is('.coding-line');

    if (isCodingArea || isCodingLine) {
      setTimeout(() => {
        const $codingArea = $containerElement.closest(CODING_SELECTOR);

        const codingLines = browser.isIE()
          ? $codingArea[0].innerText.split('\r\n')
          : $codingArea[0].innerText.split('\n');

        $codingArea.children().remove();

        for (const line of codingLines) {
          if (line === '') {
            continue;
          }
          $codingArea.append(`<div class="coding-line">${utils.escapeXML(line)}</div>`);
        }
      }, 500);
    }
  }
}
