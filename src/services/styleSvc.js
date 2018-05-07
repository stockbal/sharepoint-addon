import config from '../config';
import store from '../store';
import { StyleSheet } from '../util/StyleSheet';

const TEXT_STYLE = 'textStyle';
const DARK_THEME = 'darkTheme';
const LIGHT_THEME = 'lightTheme';
const HEADING_STYLE = 'headingStyle';
const HEADING_STYLE_CONFIG = 'headingStyleConfig';
const SIZE_FACTOR = 'SizeFactor';
const BASE_SIZE = 'baseFontSize';
const SIDE_NAV_STYLE = 'sideLinkStyle';
const LINK = 'link';
const LINK_STATES = 'linkStates';

export const styleConstants = {
  TEXT_STYLE,
  DARK_THEME,
  LIGHT_THEME,
  HEADING_STYLE,
  HEADING_STYLE_CONFIG,
  SIZE_FACTOR,
  BASE_SIZE,
  SIDE_NAV_STYLE,
  LINK,
  LINK_STATES
};

export const styleSvc = {
  _createHeadingStyles(styleSheet, styleConfig, baseFontSize) {
    const headingStyle = styleConfig[HEADING_STYLE];

    if (headingStyle) {
      // create heading style
      styleSheet.addRule(['h1', 'h2', 'h3', 'h4'], headingStyle);
    }

    const headingStyleConfig = styleConfig[HEADING_STYLE_CONFIG];
    const {
      h1SizeFactor = 2.25,
      h2SizeFactor = 1.75,
      h3SizeFactor = 1.5,
      h4SizeFactor = 1.25
    } = headingStyleConfig;

    styleSheet.addRule('h1', { 'font-size': baseFontSize * h1SizeFactor + 'px' });
    styleSheet.addRule('h2', { 'font-size': baseFontSize * h2SizeFactor + 'px' });
    styleSheet.addRule('h3', { 'font-size': baseFontSize * h3SizeFactor + 'px' });
    styleSheet.addRule('h4', { 'font-size': baseFontSize * h4SizeFactor + 'px' });
  },
  _createContentStyles(styleSheet, styleConfig, baseFontSize) {
    let contentStyle = styleConfig[TEXT_STYLE];

    contentStyle['font-size'] = baseFontSize + 'px';

    styleSheet.addRule('', contentStyle);
    styleSheet.addRule('p', contentStyle);
  },
  _createLightThemeStyle(styleSheet, styleConfig) {
    const lightTheme = styleConfig[LIGHT_THEME];

    // create heading style
    styleSheet.addRule(['h1', 'h2', 'h3', 'h4'], lightTheme[HEADING_STYLE]);
    styleSheet.addRule('', lightTheme[TEXT_STYLE]);
    styleSheet.addRule('*', lightTheme[TEXT_STYLE]);

    Object.entries(lightTheme).forEach(([key, value]) => {
      if (!Object.values(styleConstants).includes(key)) {
        styleSheet.addRule(key, value);
      }
    });
  },
  _createDarkThemeStyle(styleSheet, styleConfig) {
    const darkTheme = styleConfig[DARK_THEME];

    // create heading style
    styleSheet.addRule(['h1', 'h2', 'h3', 'h4'], darkTheme[HEADING_STYLE]);
    styleSheet.addRule('', darkTheme[TEXT_STYLE]);

    Object.entries(darkTheme).forEach(([key, value]) => {
      if (!Object.values(styleConstants).includes(key)) {
        styleSheet.addRule(key, value);
      }
    });

    styleSheet.setPrefix(`.${config.cssClasses.addonStyleDark}`);
    styleSheet.addRule(`.${config.cssClasses.coreOverlay}`, {
      background: darkTheme[TEXT_STYLE].background,
      color: darkTheme[TEXT_STYLE].color
    });

    // add dark theme to title row links
    styleSheet.setPrefix(
      `.${config.cssClasses.addonStyleDark} #${config.elements.titleRowElementId}`
    );

    styleSheet.addRule('a', darkTheme[TEXT_STYLE]);

    // add dark theme to side navbox links
    styleSheet.setPrefix(
      `.${config.cssClasses.addonStyleDark} #${config.elements.sideNavBoxElementId}`
    );

    styleSheet.addRule('a', darkTheme[SIDE_NAV_STYLE][LINK]);
    styleSheet.addRule(
      ['a:active', 'a:hover', 'a.selected'],
      darkTheme[SIDE_NAV_STYLE][LINK_STATES]
    );
  },
  /**
   * Creates custom styles for editor content
   */
  createCustomStyles(updateBaseFontSize) {
    const customStyleSettings = store.getters['settings/computedStyleSettings'];
    let baseFontSize = 0;

    if (updateBaseFontSize) {
      store.commit('settings/setSetting', {
        id: 'baseFontSize',
        value: customStyleSettings[BASE_SIZE]
      });
      baseFontSize = customStyleSettings[BASE_SIZE];
    } else {
      baseFontSize = store.state.settings.baseFontSize;
    }

    const styleId = 'customEditorStyle';
    const customStyleSheet = new StyleSheet(styleId);

    customStyleSheet.setPrefix(
      `.${config.cssClasses.addonStyleGeneric} #${config.elements.editorContentElementId}`
    );
    this._createHeadingStyles(customStyleSheet, customStyleSettings, baseFontSize);
    this._createContentStyles(customStyleSheet, customStyleSettings, baseFontSize);

    customStyleSheet.setPrefix(
      `.${config.cssClasses.addonStyleLight} #${config.elements.editorContentElementId}`
    );
    this._createLightThemeStyle(customStyleSheet, customStyleSettings);

    customStyleSheet.setPrefix(
      `.${config.cssClasses.addonStyleDark} #${config.elements.editorContentElementId}`
    );
    this._createDarkThemeStyle(customStyleSheet, customStyleSettings);
  }
};
