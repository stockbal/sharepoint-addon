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
import quickMenu from './quickMenu';

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
    imagePreview,
    quickMenu
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
        return !$selectionNode.is('.coding') && !$selectionNode.closest('.coding').length;
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
    setEditMode({ commit, state }, value) {
      commit('setEditMode', value);
    },
    updateSelection({ commit }, data) {
      commit('setSelection', data);
    }
  }
});

export default store;
