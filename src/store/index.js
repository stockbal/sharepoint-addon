import Vue from 'vue';
import Vuex from 'vuex';
import $ from 'jquery';
import editor from './editor';
import settings from './settings';
import layoutSettings from './layoutSettings';
import toc from './toc';
import plugins from './plugins';
import modal from './modal';
import layout from './layout';
import contextMenu from './contextMenu';
import imagePreview from './imagePreview';

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: true,
  modules: {
    editor,
    toc,
    settings,
    layoutSettings,
    modal,
    layout,
    contextMenu,
    imagePreview
  },
  state: {
    editMode: false,
    selectionData: {},
    clipboardData: {}
  },
  plugins: [plugins.createPlugins()],
  mutations: {
    setEditMode(state, value) {
      state.editMode = value;
    },
    setSelection(state, data) {
      state.selectionData = data;
    },
    setClipboardData(state, data) {
      state.clipboardData = data;
    }
  },
  getters: {
    hasSelection: state => checkText => {
      const selection = state.selectionData;
      if (!selection.containerElement || (checkText && !selection.text)) {
        return false;
      } else {
        const $selectionNode = $(selection.containerElement);
        return (
          state.settings.codeEditorDisabled ||
          (!$selectionNode.is('.coding') && !$selectionNode.closest('.coding').length)
        );
      }
    },
    hasClipboardData: state => !!state.clipboardData.content,
    selectionOffset: state => {
      let offset = { top: 0, left: 0 };
      if (state.selectionData && state.selectionData.containerElement) {
        const containerOffset = $(state.selectionData.containerElement).offset();
        offset = containerOffset;
      }
      return offset;
    }
  },
  actions: {
    toggleEditMode({ commit, state }) {
      commit('setEditMode', !state.editMode);
    },
    updateSelection({ commit }, data) {
      commit('setSelection', data);
    }
  }
});

export default store;
