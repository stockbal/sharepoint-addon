import Logger from 'js-logger';
import store from '../store';
import $ from 'jquery';

const logger = Logger.get('CodeCreator');
const CONTENTEDITABLE = 'contenteditable="false"';

export default {
  _options: {},
  _code: '',
  _finalCode: '',

  /**
   * Creates an html string with correct programming
   * language syntax highlighting from the passed string
   *
   * @param {object} [options]
   *              Map which contains the following parameter options
   * @param {string} [options.code]
   *              the code to be converted
   * @param {string} [options.language]
   *              the language for the syntax highlighting
   * @param {string} [options.element]
   *              element of the current coding element that is
   *              being edited
   * @param {boolean} [options.makeInline=false]
   *              should the code be created as an inline html string
   * @param {boolean} [options.printLineNumbers=false]
   *              should created code display line numbers (only valid with makeInline=false)
   */
  createCoding: function(options) {
    this._finalCode = '';
    this._code = '';

    this._options = options;

    // perform checks
    try {
      this._checkParameters();
      this._createCode();
      this._finalizeCode();
      this._updateElement();
    } catch (error) {
      logger.error(error);
    }
  },

  /**
   * Checks validity of parameters
   * @throws Error
   */
  _checkParameters: function() {
    if (!this._options) {
      throw new Error("No 'options' were passed for conversion");
    }
    this._options.code = this._options.code ? this._options.code : '';
    this._options.language = this._options.language ? this._options.language : 'markup';
    this._options.languageClass = 'language-' + this._options.language;
    this._options.element = this._options.element ? this._options.element : null;
    this._options.makeInline = this._options.makeInline ? this._options.makeInline : false;

    if (this._options.code === '') {
      throw new Error('No code for conversion was passed');
    }
  },

  /**
   * Wraps the highlighted html string with pre/code tags according
   * to the passed options
   */
  _createCode: function() {
    const { printLineNumbers, makeInline, languageClass } = this._options;
    let lineNumberClass = printLineNumbers ? ' line-numbers ' : '';

    let blockCodePrefix = makeInline ? '' : '<pre class="' + languageClass + lineNumberClass + '">';
    let blockCodeSuffix = makeInline ? '' : '</pre>';

    this._code = `${blockCodePrefix}<code  
      class="${languageClass}">${this._options.code}</code>${blockCodeSuffix}`;
  },

  /**
   * Finalizes the html string by wrapping it either inside
   * a <code>span</code>-tag for "inline" coding or a <code>div</code>-tag
   * for block coding
   */
  _finalizeCode: function() {
    if (this._options.element) {
      // code highlighting is final
      this._finalCode = this._code;
    } else {
      // create new inline coding
      if (this._options.makeInline) {
        this._finalCode = `<span class="coding inline" ${this._getDataAttributesAsString()} ${CONTENTEDITABLE}>${
          this._code
        }</span>`;
      } else {
        // create new block coding
        this._finalCode = `<div class="coding" ${this._getDataAttributesAsString()} ${CONTENTEDITABLE}>${
          this._code
        }</div><div><br/></div>`;
      }
    }
  },

  _getDataAttributesAsString() {
    const { makeInline, language, printLineNumbers } = this._options;
    return ` data-language="${language}" data-line-numbers="${printLineNumbers}" data-inline="${makeInline}" `;
  },

  _fillDataAttributes(element) {
    const { makeInline, language, printLineNumbers } = this._options;

    element.setData('inline', makeInline);
    element.setData('language', language);
    element.setData('line-numbers', printLineNumbers);
  },

  _updateElement: function() {
    const { element: $element, makeInline, fromSelection = false } = this._options;

    // write the created code into the page
    if ($element) {
      const tagIsInlineTag = $element.hasClass('inline');

      // check if code is still inline/block - if not that surrounding element needs to be changed
      if ((tagIsInlineTag && makeInline) || (!tagIsInlineTag && !makeInline)) {
        this._fillDataAttributes($element[0]);
        $element.html(this._finalCode);
      } else {
        // tag needs to be replaced with correct tag
        let newTagName = makeInline ? 'span' : 'div';
        let inlineClass = makeInline ? 'inline' : '';
        $element.replaceWith(
          `<${newTagName} class="coding ${inlineClass}" ${this._getDataAttributesAsString()} 
                          ${CONTENTEDITABLE}>${this._finalCode}</${newTagName}>`
        );
      }
    } else {
      let selection = store.state.selectionData;
      if (fromSelection) {
        selection.range.deleteContents();
        let $newInlineCode = $(this._finalCode);
        selection.range.insertNode($newInlineCode[0]);
      } else {
        selection.range.insertNode($(this._finalCode)[0]);
      }
    }
  }
};
