const setter = propertyId => (state, value) => {
  state[propertyId] = value;
};

export default {
  namespaced: true,
  state: {
    items: [],
    afterClose: undefined,
    title: '',
    actions: [],
    coordinates: {
      top: 0,
      left: 0
    }
  },
  mutations: {
    setItems: setter('items'),
    setAfterClose: setter('afterClose'),
    setActions: setter('actions'),
    setCoordinates: setter('coordinates'),
    setTitle: setter('title')
  },
  actions: {
    open({ commit }, { items, actions, afterClose, title = 'Quick Menu', coordinates }) {
      commit('setItems', items);
      commit('setAfterClose', afterClose);
      commit('setActions', actions);
      commit('setTitle', title);
      commit('setCoordinates', coordinates);
    },
    close({ commit, state }, force = false) {
      if (!force) {
        if (state.afterClose) {
          state.afterClose();
        }
      }
      commit('setItems', []);
      commit('setActions', []);
      commit('setAfterClose', undefined);
    }
  }
};
