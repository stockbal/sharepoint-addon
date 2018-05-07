const setter = propertyId => (state, value) => {
  state[propertyId] = value;
};

export default {
  namespaced: true,
  state: {
    source: '',
    width: 0,
    height: 0,
    sizeRatio: 0,
    description: '',
    resolve: () => {}
  },
  mutations: {
    setSource: setter('source'),
    setWidth: setter('width'),
    setHeight: setter('height'),
    setSizeRatio: setter('sizeRatio'),
    setDescription: setter('description'),
    setResolve: setter('resolve')
  },
  actions: {
    open({ commit, state }, { source, description, width, height }) {
      commit('setSource', source);
      commit('setWidth', width);
      commit('setHeight', height);
      commit('setSizeRatio', width / height);
      commit('setDescription', description);
      return new Promise(resolve => commit('setResolve', resolve));
    },
    close({ commit }) {
      commit('setSource', '');
      commit('setDescription', '');
      commit('setResolve', () => {});
    }
  }
};
