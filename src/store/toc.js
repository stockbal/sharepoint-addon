import Vue from 'vue';

class Node {
  constructor(id, item, depth, isFolder = false, isRoot = false) {
    this.id = id;
    this.item = item;
    this.isRoot = isRoot;
    this.isFolder = isFolder;
    this.depth = depth;

    if (isFolder) {
      this.children = [];
    }
  }
}

// factory to create node
const createNode = flatNode => {
  const { id, headingId, name: headingName, depth, hasChildren: isFolder } = flatNode;
  const item = {
    headingId,
    headingName
  };
  return new Node(id, item, depth, isFolder);
};

export default {
  namespaced: true,
  state: {
    tocClosureTable: [],
    openNodes: {},
    filteredNodes: {},
    activeNode: ''
  },
  mutations: {
    setClosureTable(state, closureTable) {
      state.tocClosureTable = closureTable;
    },
    closeAllNodes(state) {
      state.openNodes = {};
    },
    openNode(state, id) {
      Vue.set(state.openNodes, id, true);
    },
    toggleOpenNode(state, id) {
      Vue.set(state.openNodes, id, !state.openNodes[id]);
    },
    clearFilteredNodes(state) {
      state.filteredNodes = {};
    },
    filterNode(state, id) {
      Vue.set(state.filteredNodes, id, true);
    },
    setActiveNode(state, id) {
      state.activeNode = id;
    }
  },
  getters: {
    nodeStructure: (state, getters) => {
      const nodeMap = {};
      const rootNode = new Node('root', {}, 0, true, true);
      // first process all nodes
      state.tocClosureTable.forEach(flatNode => {
        let { parentId } = flatNode;
        let node = createNode(flatNode);
        nodeMap[node.id] = node;

        // get correct parent node
        let parentNode = parentId === 0 ? rootNode : nodeMap[flatNode.parentId];
        node.parentId = parentNode.id;
        parentNode.children.push(node);
      });

      return {
        nodeMap,
        rootNode
      };
    },
    nodeMap: (state, getters) => getters.nodeStructure.nodeMap,
    rootNode: (state, getters) => getters.nodeStructure.rootNode,
    allNodesExpanded: (state, getters) => {
      try {
        Object.entries(getters.nodeMap).forEach(([, node]) => {
          if (node.isFolder && !state.openNodes[node.id]) {
            throw Error('Not all folders expanded');
          }
        });
      } catch (e) {
        return false;
      }
      return true;
    }
  },
  actions: {
    updateClosureTable({ commit }, node) {
      commit('setClosureTable', node);
    },
    closeAllNodes({ commit }) {
      commit('closeAllNodes');
    },
    filter({ commit, dispatch, getters }, phrase) {
      commit('clearFilteredNodes');

      // check if toc is expanded before filtering
      if (!getters.allNodesExpanded) {
        dispatch('openAllNodes');
      }

      Object.entries(getters.nodeMap).forEach(([, node]) => {
        let filterText = phrase;
        let filterRegex;
        if (filterText || filterText !== '') {
          filterRegex = new RegExp('.*' + filterText + '.*', 'i');
          if (!filterRegex.test(node.item.headingName)) {
            commit('filterNode', node.id);
          } else if (node.isFolder) {
            commit('openNode', node.id);
          }
        }
      });
    },
    clearFilter: ({ commit }) => commit('clearFilteredNodes'),
    openAllNodes({ commit, getters }) {
      Object.entries(getters.nodeMap).forEach(([, node]) => {
        if (node.isFolder) {
          commit('openNode', node.id);
        }
      });
    },
    toggleOpenNode({ commit, getters, dispatch }, id) {
      commit('toggleOpenNode', id);
    },
    updateActiveNode({ commit, state }, id) {
      if (state.activeNode !== id) {
        commit('setActiveNode', id);
      }
    }
  }
};
