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
        let content = $codingArea[0].innerText;

        $codingArea.children().remove();

        if ($codingArea.prop('tagName') === 'SPAN') {
          if (browser.isIE()) {
            content = content.replace('\r\n');
          } else {
            content = content.replace('\n');
          }
          $codingArea.append(`<span class="coding-line">${utils.escapeXML(content)}</span>`);
        } else {
          const codingLines = browser.isIE() ? content.split('\r\n') : content.split('\n');

          for (const line of codingLines) {
            if (line === '') {
              continue;
            }
            $codingArea.append(`<div class="coding-line">${utils.escapeXML(line)}</div>`);
          }
        }
      }, 500);
    }
  }
}
