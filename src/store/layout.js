const constants = {
  panelHeightRibbonClosed: '5.25rem',
  panelHeightRibbonOpen: '11rem',
  panelHeightRibbonWebPartOpen: '29.2rem',
  sideBarOpenWidth: '280px',
  sideBarClosedWidth: '31px'
};

export default {
  namespaced: true,
  state: {
    distanceFromTop: constants.panelHeightRibbonClosed
  },
  mutations: {
    setDistanceFromTop(state, value) {
      state.distanceFromTop = value;
    }
  },
  getters: {
    constants: () => constants,
    styles: (state, getters) => ({
      ...state
    })
  },
  actions: {
    updateDistanceFromTop({ commit }, value) {
      commit('setDistanceFromTop', value);
    }
  }
};
