import { CODING_SELECTOR } from '../../config/constants';
import browser from '../../services/browser';
const previewCodingClass = 'coding';

export class CodeConverter {
  convertCodingAreas() {
    this._convertBlockCodingAreas();
    this._convertInlineCodingAreas();
  }
  _convertInlineCodingAreas() {
    const codingAreasInline = document.querySelectorAll(`span${CODING_SELECTOR}`);

    for (const inlineCoding of codingAreasInline) {
      const codeSpan = document.createElement('span');
      codeSpan.classList.add(previewCodingClass);
      codeSpan.classList.add('inline');

      codeSpan.appendChild(this._createCodeElement(inlineCoding, inlineCoding.getData('language')));

      inlineCoding.parentNode.replaceChild(codeSpan, inlineCoding);
    }
  }
  _convertBlockCodingAreas() {
    const codingAreasBlock = document.querySelectorAll(`div${CODING_SELECTOR}`);

    for (const blockCoding of codingAreasBlock) {
      const codeDiv = document.createElement('div');
      codeDiv.classList.add(previewCodingClass);

      const pre = document.createElement('pre');

      const language = blockCoding.getData('language');
      pre.classList.add(`language-${language}`);

      if (blockCoding.getData('line-numbers')) {
        pre.classList.add('line-numbers');
      }

      pre.appendChild(this._createCodeElement(blockCoding, language));
      codeDiv.appendChild(pre);

      blockCoding.parentNode.replaceChild(codeDiv, blockCoding);
    }
  }
  _createCodeElement(codeArea, language) {
    const code = document.createElement('code');
    code.classList.add(`language-${language}`);
    if (browser.isIE()) {
      code.textContent = this._createIECodingPreview(codeArea);
    } else {
      code.textContent = codeArea.innerText;
    }
    return code;
  }

  _createIECodingPreview(codeArea) {
    let codingText = '';
    const codingLines = codeArea.querySelectorAll('.coding-line');
    for (const codingLine of codingLines) {
      if (codingLine.innerText === '' && codingLine.innerHTML !== '<br>') {
        continue;
      }
      codingText += `${codingLine.innerText}\n`;
    }
    return codingText;
  }
}
