/* eslint-disable no-unused-vars */

import localDbSvc from '../../services/localDbSvc';
import layoutSvc from '../../services/layoutSvc';
import keyListener from '../../services/editor/keyListener';
import eventProxy from '../../util/eventProxy';

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
            eventProxy.$trigger('updatePrismStyle');
          } else if (id === 'editorDisabled') {
            if (editMode) {
              if (value) {
                eventProxy.$trigger('disableEditor');
              } else {
                eventProxy.$trigger('enableEditor');
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
              eventProxy.$trigger('activateCustomEditorStyle');
            } else {
              layoutSvc.deactivateAddonStyle();
              keyListener.unregisterChangeFontSizeListeners();
              eventProxy.$trigger('deactivateCustomEditorStyle');
            }
          } else if (id === 'editorCustomStyleDark') {
            if (store.state.settings.editorCustomStyleActive) {
              layoutSvc.toggleAddonStyleDark(value);
            }
          } else if (id === 'baseFontSize') {
            eventProxy.$trigger('setCustomStyle', false);
          }
        }
      });
    };
  }
};
