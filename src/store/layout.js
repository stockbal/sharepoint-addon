const constants = {
  panelHeightRibbonClosed: 85,
  panelHeightRibbonOpen: 176,
  panelHeightRibbonWebPartOpen: 530,
  sideBarOpenWidth: '280px',
  sideBarClosedWidth: '31px'
};

export default {
  namespaced: true,
  state: {
    distanceFromTop: `${constants.panelHeightRibbonClosed}px`
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
