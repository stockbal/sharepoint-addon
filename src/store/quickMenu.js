const setter = propertyId => (state, value) => {
  state[propertyId] = value;
};

export default {
  namespaced: true,
  state: {
    items: [],
    title: '',
    coordinates: {
      top: 0,
      left: 0
    }
  },
  mutations: {
    setItems: setter('items'),
    setCoordinates: setter('coordinates'),
    setTitle: setter('title')
  },
  actions: {
    open({ commit }, { items, title = 'Quick Menu', coordinates }) {
      commit('setItems', items);
      commit('setTitle', title);
      commit('setCoordinates', coordinates);
    },
    close({ commit }) {
      commit('setItems', []);
    }
  }
};
