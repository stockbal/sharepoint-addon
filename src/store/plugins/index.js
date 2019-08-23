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

          switch (id) {
            case 'codeEditorTheme':
              eventProxy.$trigger('updatePrismStyle');
              break;

            case 'editorDisabled':
              if (editMode) {
                if (value) {
                  eventProxy.$trigger('disableEditor');
                } else {
                  eventProxy.$trigger('enableEditor');
                }
              }
              break;

            case 'sideBarOpen':
              if (value) {
                layoutSvc.showSideBar();
              } else {
                layoutSvc.hideSideBar();
              }
              break;
            case 'editorShowLanguage':
              layoutSvc.toggleCodeEditorLanguage(value);
              break;
            case 'editorShowLineNumbers':
              layoutSvc.toggleCodeEditorLines(value);
              break;
            case 'editorCustomStyleActive':
              if (value) {
                layoutSvc.activateAddonStyle();
                keyListener.registerChangeFontSizeListeners();
                eventProxy.$trigger('activateCustomEditorStyle');
              } else {
                layoutSvc.deactivateAddonStyle();
                keyListener.unregisterChangeFontSizeListeners();
                eventProxy.$trigger('deactivateCustomEditorStyle');
              }
              break;

            case 'editorCustomStyleDark':
              if (store.state.settings.editorCustomStyleActive) {
                layoutSvc.toggleAddonStyleDark(value);
              }
              break;

            case 'baseFontSize':
              eventProxy.$trigger('setCustomStyle', false);
              break;
          }
        }
      });
    };
  }
};
