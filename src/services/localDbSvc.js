import utils from './utils';
import layoutSvc from './layoutSvc';
import store from '../store';
// import keyListener from './editor/keyListener';

export default {
  syncLocalStorage() {
    return Promise.resolve().then(() => {
      utils.localStorageDataIds.forEach(id => {
        const state = store.state[id];

        try {
          // Try to parse the item from the localStorage
          const storedItem = JSON.parse(localStorage.getItem(id));
          if (!storedItem) {
            // no item found for key so create it
            localStorage.setItem(id, JSON.stringify(state));
          } else {
            // item was persisted so update the store
            for (let [key, value] of Object.entries(storedItem)) {
              store.commit(`${id}/setSetting`, { id: key, value });
            }
          }
        } catch (e) {
          // Ignore parsing issue
        }
      });

      // update the layout according to some settings
      if (store.state.settings.tocShowAtStart) {
        store.dispatch('layoutSettings/setSideBarPanel', 'toc');
        store.dispatch('layoutSettings/toggleSideBar', true);
        layoutSvc.showSideBar();
      }

      if (store.state.settings.editorCustomStyleActive) {
        // layoutSvc.activateAddonStyle();
      }
    });
  },
  writeLocalStorage() {
    Promise.resolve().then(() => {
      utils.localStorageDataIds.forEach(id => {
        const state = store.state[id];
        localStorage.setItem(id, JSON.stringify(state));
      });
    });
  }
};
