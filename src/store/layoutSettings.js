export default {
  namespaced: true,
  state: {
    sideBarPanel: 'menu',
    sideBarOpen: false
  },
  mutations: {
    setSetting(state, { id, value }) {
      state[id] = value;
    }
  },
  actions: {
    updateSetting({ commit }, data) {
      commit('setSetting', data);
    },
    toggleSideBar({ commit, state }, value) {
      commit('setSetting', {
        id: 'sideBarOpen',
        value: value === undefined ? !state.sideBarOpen : value
      });
    },
    setSideBarPanel({ commit }, value = 'menu') {
      commit('setSetting', { id: 'sideBarPanel', value });
    },
    toggleMenu({ commit, dispatch, state }, menu) {
      const tocVisible = state.sideBarPanel === menu;
      if (!tocVisible) {
        commit('setSetting', { id: 'sideBarPanel', value: menu });
      }

      if (state.sideBarOpen) {
        if (tocVisible) {
          dispatch('toggleSideBar');
        }
      } else {
        dispatch('toggleSideBar');
      }
    }
  }
};
