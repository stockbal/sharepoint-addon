/* eslint-disable no-unused-vars */

import localDbSvc from '../../services/localDbSvc';
import layoutSvc from '../../services/layoutSvc';
import editorUtilsSvc from '../../services/editorUtilsSvc';
import keyListener from '../../services/editor/keyListener';

export default {
  createPlugins() {
    return store => {
      store.subscribe(({ type, payload }) => {
        const { editMode } = store.state;

        if (/(layout)?[sS]ettings\/(set|toggle)/.test(type)) {
          const { id, value } = payload;
          localDbSvc.writeLocalStorage();

          // check if prism theme was updated
          if (id === 'codeEditorTheme') {
            editorUtilsSvc.$trigger('updatePrismStyle');
          } else if (id === 'codeEditorDisabled') {
            if (value) {
              editorUtilsSvc.$trigger('disableCodeEditor');
            } else {
              editorUtilsSvc.$trigger('enableCodeEditor');
            }
          } else if (id === 'editorDisabled') {
            if (editMode) {
              if (value) {
                editorUtilsSvc.$trigger('disableEditor');
              } else {
                editorUtilsSvc.$trigger('enableEditor');
              }
            }
          } else if (id === 'sideBarOpen') {
            if (value) {
              layoutSvc.showSideBar();
            } else {
              layoutSvc.hideSideBar();
            }
          } else if (id === 'editorCustomStyleActive') {
            if (value) {
              layoutSvc.activateAddonStyle();
              keyListener.registerChangeFontSizeListeners();
              editorUtilsSvc.$trigger('activateCustomEditorStyle');
            } else {
              layoutSvc.deactivateAddonStyle();
              keyListener.unregisterChangeFontSizeListeners();
              editorUtilsSvc.$trigger('deactivateCustomEditorStyle');
            }
          } else if (id === 'editorCustomStyleDark') {
            if (store.state.settings.editorCustomStyleActive) {
              layoutSvc.toggleAddonStyleDark(value);
            }
          } else if (id === 'baseFontSize') {
            editorUtilsSvc.$trigger('setCustomStyle', false);
          }
        }
      });
    };
  }
};
