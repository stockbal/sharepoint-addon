import { ADT_LINK_SELECTOR, CODING_SELECTOR, ICON_SELECTOR } from '../../config/constants';
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
  convertADTLinks() {
    for (const adtLink of document.querySelectorAll(ADT_LINK_SELECTOR)) {
      // parse the content of the adt link span tag
      let adtLinkParser = new RegExp('\\[(adt:/{2}[^\\]]+)\\]\\((.+)\\)');
      let adtLinkContent = adtLink.innerText.match(adtLinkParser);

      const linkElement = document.createElement('a');
      const linkTextSpan = document.createElement('span');

      linkElement.appendChild(linkTextSpan);
      let noLinkIcon = true;
      if (browser.isChrome() || browser.isFirefox()) {
        const linkIcon = document.createElement('img');
        linkIcon.src =
          'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoP' +
          'SIzMiIgaGVpZ2h0PSIzMiIgdmVyc2lvbj0iMSI+CiA8cmVjdCBmaWxsPSIjZmZhYjMwIiB3aWR0aD0iMjgiIGhla' +
          'WdodD0iMjgiIHg9Ii0zMCIgeT0iLTI4IiByeD0iMTQiIHJ5PSIxNCIgdHJhbnNmb3JtPSJtYXRyaXgoMCwtMSwtM' +
          'SwwLDAsMCkiLz4KIDxwYXRoIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii4yIiBkPSJtMTQgMmMtNy43NTYgMC0xNCA2LjI0' +
          'NC0xNCAxNC0yLjMxNjNlLTcgMC4xNjkgMC4wMTk1MjEgMC4zMzMgMC4wMjUzOSAwLjUgMC4yNjM3NC03LjUyMDYgNi4' +
          'zODc0LTEzLjUgMTMuOTc1LTEzLjUgNy41ODcgMCAxMy43MTEgNS45Nzk0IDEzLjk3NSAxMy41IDAuMDA1LTAuMTY3ID' +
          'AuMDI1LTAuMzMxIDAuMDI1LTAuNSAwLTcuNzU2LTYuMjQ0LTE0LTE0LTE0eiIvPgogPHBhdGggb3BhY2l0eT0iLjIiI' +
          'GQ9Im0wLjAyNTM5IDE2LjVjLTAuMDA1ODY5IDAuMTY3LTAuMDI1MzkgMC4zMzEtMC4wMjUzOSAwLjUtMi4zMTYzZS0' +
          '3IDcuNzU2IDYuMjQ0IDE0IDE0IDE0czE0LTYuMjQ0IDE0LTE0YzAtMC4xNjktMC4wMi0wLjMzMy0wLjAyNS0wLjUt' +
          'MC4yNjQgNy41MjEtNi4zODggMTMuNS0xMy45NzUgMTMuNS03LjU4NzIgMC0xMy43MTEtNS45NzktMTMuOTc1LTEzL' +
          'jV6Ii8+CiA8cmVjdCBmaWxsPSIjNWU0MDk1IiB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHg9Ii0zMCIgeT0iLTMyIi' +
          'ByeD0iMTQiIHJ5PSIxNCIgdHJhbnNmb3JtPSJtYXRyaXgoMCwtMSwtMSwwLDAsMCkiLz4KIDxwYXRoIG9wYWNpdH' +
          'k9Ii4yIiBkPSJtNC45Mjk3IDEyYy0wLjI0NjEgMC42NDYtMC40NTIyIDEuMzExLTAuNjAxNiAyaDI3LjM0NGMtMC' +
          '4xNS0wLjY4OS0wLjM1Ni0xLjM1NC0wLjYwMi0yaC0yNi4xNHptLTAuODc4OSA0Yy0wLjAxMTcgMC4xNjYtMC4wMTU' +
          '2IDAuMzM1LTAuMDI1NCAwLjUwMiAwLjAxNzggMC41MDcgMC4wNjI4IDEuMDA2IDAuMTMyOCAxLjQ5OGgyNy42ODRj' +
          'MC4wNy0wLjQ5MiAwLjExNS0wLjk5MSAwLjEzMy0xLjQ5OC0wLjAxLTAuMTY3LTAuMDE0LTAuMzM2LTAuMDI2LTAuN' +
          'TAyaC0yNy44OTh6bTAuNTMxMiA0YzAuMjA1IDAuNjkzIDAuNDcxIDEuMzU3IDAuNzc1NCAyaDI1LjI4NmMwLjMwN' +
          'C0wLjY0MyAwLjU3LTEuMzA3IDAuNzc1LTJoLTI2LjgzNnoiLz4KIDxwYXRoIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii' +
          '44IiBkPSJtNC45Mjk3IDExYy0wLjI0NjEgMC42NDYtMC40NTIyIDEuMzExLTAuNjAxNiAyaDI3LjM0NGMtMC4xNS' +
          '0wLjY4OS0wLjM1Ni0xLjM1NC0wLjYwMi0yaC0yNi4xNHptLTAuODc4OSA0Yy0wLjAyMzMgMC4zMzItMC4wNTA4ID' +
          'AuNjYyLTAuMDUwOCAxczAuMDI3NSAwLjY2OCAwLjA1MDggMWgyNy44OThjMC4wMjMtMC4zMzIgMC4wNTEtMC42NjI' +
          'gMC4wNTEtMXMtMC4wMjgtMC42NjgtMC4wNTEtMWgtMjcuODk4em0wLjI3NzMgNGMwLjE0OTQgMC42ODkgMC4zNTU1' +
          'IDEuMzU0IDAuNjAxNiAyaDI2LjE0YzAuMjQ2LTAuNjQ2IDAuNDUyLTEuMzExIDAuNjAyLTJoLTI3LjM0NHoiLz4K' +
          'IDxwYXRoIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii4xIiBkPSJtMTggMmMtNy43NTYgMC0xNCA2LjI0NC0xNCAxNCAw' +
          'IDAuMTY4ODQgMC4wMTk1IDAuMzMyNjQgMC4wMjU0IDAuNSAwLjI2NDEtNy41MjA2IDYuMzg4LTEzLjUgMTMuOTc1' +
          'LTEzLjUgNy41ODcyIDAgMTMuNzExIDUuOTc5NCAxMy45NzUgMTMuNSAwLjAwNi0wLjE2NzM2IDAuMDI1NC0wLjMzM' +
          'TE2IDAuMDI1NC0wLjUgMC03Ljc1Ni02LjI0NC0xNC0xNC0xNHoiLz4KIDxwYXRoIG9wYWNpdHk9Ii4yIiBkPSJtMT' +
          'ggMzFjLTcuNzU2IDAtMTQtNi4yNDQtMTQtMTQgMC0wLjE2OSAwLjAxOTUtMC4zMzMgMC4wMjU0LTAuNSAwLjI2Mzc' +
          'gNy41MjEgNi4zODc2IDEzLjUgMTMuOTc1IDEzLjUgNy41ODcyIDAgMTMuNzExLTUuOTc5NCAxMy45NzUtMTMuNSAw' +
          'LjAwNiAwLjE2NzM2IDAuMDI1NCAwLjMzMTE2IDAuMDI1NCAwLjUgMCA3Ljc1Ni02LjI0NCAxNC0xNCAxNHoiLz4KPC9zdmc+Cg==';
        linkIcon.classList.add('adt-link-icon');
        linkElement.appendChild(linkIcon);
        noLinkIcon = false;
      }

      if (adtLinkContent && adtLinkContent.length === 3) {
        linkElement.href = adtLinkContent[1];
        linkTextSpan.innerText = adtLinkContent[2];
        if (noLinkIcon) {
          linkTextSpan.innerText = 'ADT-LINK: ' + linkTextSpan.innerText;
        }
        linkElement.title = 'ADT Link';
      } else {
        linkTextSpan.innerText = '<ADT Link could not be parsed>';
        linkElement.classList.add('adt-link--parse-error');
      }

      adtLink.parentNode.replaceChild(linkElement, adtLink);
    }
  }
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
      const highlightedLines = blockCoding.getData('line');
      if (highlightedLines) {
        pre.setData('line', highlightedLines);
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

  /**
   * Replace &lt;br&gt; elements inside of
   * coding lines to prevent the display of duplicate
   * empty lines
   *
   * @public
   */
  convertLineBreaksToNonBreaking() {
    for (const breakEl of document.querySelectorAll('.coding-line br')) {
      const parentNode = breakEl.parentNode;
      if (parentNode.childNodes.length === 1) {
        parentNode.innerHTML = '&nbsp;';
      } else {
        breakEl.remove();
      }
    }
  }

  /**
   * Returns Regular Expression to match icon content
   * @returns {RegExp}
   */
  static getIconMatcher() {
    return /\[(regular|brand|solid):(\w+)(:?:(\d))?]/;
  }

  /**
   * Insert FontAweSome Icons at icon areas
   *
   * @public
   */
  static convertIcons() {
    for (const iconEl of document.querySelectorAll(ICON_SELECTOR)) {
      // retrieve the icon name and category from the element
      const iconInfo = iconEl.innerText.match(CodeConverter.getIconMatcher());

      if (!iconInfo || !Array.isArray(iconInfo)) {
        continue;
      }
      const iconName = iconInfo[2];
      let iconSize = 1; // eslint-disable-line no-unused-vars

      if (iconInfo.length === 5) {
        iconSize = iconInfo[4];
      }

      const newIconEl = document.createElement('i');
      switch (iconInfo[1]) {
        case 'brand':
          newIconEl.classList.add('fab');
          break;
        case 'regular':
          newIconEl.classList.add('far');
          break;
        case 'solid':
          newIconEl.classList.add('fas');
          break;
      }
      newIconEl.classList.add(`fa-${iconName}`, `fa-${iconSize}x`);
      iconEl.parentElement.replaceChild(newIconEl, iconEl);
    }
  }
}
