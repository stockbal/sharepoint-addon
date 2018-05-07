export default {
  namespaced: true,
  state: {
    stack: []
  },
  mutations: {
    setStack: (state, value) => {
      state.stack = value;
    }
  },
  getters: {
    config: state => state.stack[0]
  },
  actions: {
    open({ commit, state }, param) {
      return new Promise((resolve, reject) => {
        const config = typeof param === 'object' ? { ...param } : { type: param };
        const clean = () =>
          commit('setStack', state.stack.filter(otherConfig => otherConfig !== config));
        config.resolve = result => {
          clean();
          resolve(result);
        };
        config.reject = error => {
          clean();
          reject(error);
        };
        commit('setStack', [config, ...state.stack]);
      });
    }
  }
};
