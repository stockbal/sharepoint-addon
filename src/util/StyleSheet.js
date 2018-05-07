import { ZERO_WIDTH } from '../config/constants';

export class StyleSheet {
  constructor(id) {
    this.style = StyleSheet._createStyleElement(id);
    this.sheet = this.style.sheet;
    this._prefix = '';
    this._index = 0;
  }

  setPrefix(prefix) {
    this._prefix = prefix;
  }

  static _createStyleElement(id) {
    // check if a style with the id already exists
    let style = document.getElementById(id);
    if (style) {
      style.parentElement.removeChild(style);
    }

    // Create the <style> tag
    style = document.createElement('style');
    style.id = id;
    style.type = 'text/css';

    // Add a media (and/or media query) here if you'd like!
    // style.setAttribute("media", "screen")
    // style.setAttribute("media", "only screen and (max-width : 1024px)")

    // Add the <style> element to the page
    document.body.appendChild(style);
    return style;
  }

  addRule(selector, rules, forceImportantQualifier = true) {
    let fullSelector = '';
    if (Array.isArray(selector)) {
      fullSelector = selector.map(value => `${this._prefix} ${value}`).join(',');
    } else {
      fullSelector = `${this._prefix} ${selector}`;
    }

    let rulesString = '';

    Object.entries(rules).forEach(([styleName, styleValue]) => {
      if (Array.isArray(styleValue)) {
        styleValue = styleValue.join(',');
      } else {
        styleValue = styleValue ? styleValue.replace(ZERO_WIDTH, '') : '';
      }
      rulesString = `${rulesString} ${styleName}: ${styleValue} ${
        forceImportantQualifier ? '!important' : ''
      };`;
    });
    if (this.sheet.addRule) {
      this.sheet.addRule(fullSelector, rulesString, this._index++);
    } else {
      this.sheet.insertRule(`${fullSelector} {${rulesString}}`, this._index++);
    }
    // this.style.innerText += `${fullSelector} { ${rulesString} }`;
    return this;
  }
}
