import { CODING_SELECTOR } from '../../config/constants';
import browser from '../../services/browser';
import utils from '../utils';
const previewCodingClass = 'coding';

const lineBreakCharacter = browser.isIE() ? '\r\n' : '\n';
const createCodingLine = (type, text) => {
  const line = document.createElement(type);
  line.classList.add('coding-line');
  line.innerHTML = utils.escapeXML(text);
  return line;
};
const getCodingText = code => {
  const dummyPre = document.createElement('pre');
  dummyPre.appendChild(code);
  return dummyPre.innerText;
};

export class CodeConverter {
  convertPreviewAreasToEditableAreas() {
    for (const previewArea of document.querySelectorAll('.coding')) {
      const codingArea = document.createElement(previewArea.tagName);
      codingArea.classList.add(CODING_SELECTOR.replace('.', ''));
      codingArea.setData('language', previewArea.getData('language'));

      const code = previewArea.querySelector('code');

      if (previewArea.tagName === 'DIV') {
        codingArea.setData('line-numbers', previewArea.getData('line-numbers'));
        // fill coding area with coding lines
        for (const codingLine of getCodingText(code).split(lineBreakCharacter)) {
          codingArea.appendChild(createCodingLine('div', codingLine));
        }
      } else {
        codingArea.appendChild(createCodingLine('span', code.innerText));
      }

      // replace preview area with coding area
      previewArea.parentNode.replaceChild(codingArea, previewArea);
    }
  }
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
