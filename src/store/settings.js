import yaml from 'js-yaml';
import utils from '../services/utils';
import defaultCustomStyle from '../data/defaultCustomEditorStyles.yml';
import { styleConstants } from '../services/styleSvc';

export default {
  namespaced: true,
  state: {
    tocShowAtStart: false,
    tocCollapsedInitially: false,
    codeEditorDisabled: false,
    codeEditorTheme: 'prism-default',
    editorCustomStyleActive: false,
    editorCustomStyleDark: false,
    editorCustomStyle: '',
    editorDisabled: false,
    baseFontSize: 16
  },
  mutations: {
    setSetting(state, { id, value }) {
      state[id] = value;
    },
    toggleSetting(state, id) {
      state[id] = !state[id];
    }
  },
  getters: {
    computedStyleSettings: state => {
      let customStyleConfig = yaml.safeLoad(state.editorCustomStyle);
      if (!customStyleConfig) {
        customStyleConfig = {};
      }
      const defaultStyleConfig = yaml.safeLoad(defaultCustomStyle);

      let styleConfig = utils.overrideProperties(defaultStyleConfig, customStyleConfig);

      const includeIfExists = styleId => {
        if (customStyleConfig.hasOwnProperty(styleId)) {
          styleConfig[styleId] = utils.includeProperties(
            styleConfig[styleId],
            customStyleConfig[styleId]
          );
        }
      };

      includeIfExists(styleConstants.TEXT_STYLE);
      includeIfExists(styleConstants.HEADING_STYLE_CONFIG);
      includeIfExists(styleConstants.HEADING_STYLE);
      includeIfExists(styleConstants.DARK_THEME);
      includeIfExists(styleConstants.LIGHT_THEME);
      includeIfExists(styleConstants.SIDE_NAV_STYLE);

      return styleConfig;
    },
    darkThemeDisabled: state => !state.editorCustomStyleActive
  },
  actions: {
    updateSetting({ commit }, data) {
      commit('setSetting', data);
    },
    increaseBaseFontSize({ commit, state }) {
      commit('setSetting', { id: 'baseFontSize', value: state.baseFontSize + 1 });
    },
    decreaseBaseFontSize({ commit, state }) {
      commit('setSetting', { id: 'baseFontSize', value: state.baseFontSize - 1 });
    },
    resetBaseFontSize({ commit }) {
      commit('setSetting', { id: 'baseFontSize', value: 16 });
    }
  }
};
