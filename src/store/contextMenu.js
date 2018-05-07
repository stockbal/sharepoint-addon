/* eslint-disable no-unused-vars */
import Vue from 'vue';
import _ from 'lodash';

const setter = property => (state, value) => {
  state[property] = value;
};

const processItems = (items, level, currentNodeId) => {
  for (let item of items) {
    item.level = level;
    item.id = currentNodeId++;
    item.hasMenu = !!item.items && item.type === 'item';

    if (item.hasMenu) {
      currentNodeId = processItems(item.items, level + 1, currentNodeId);
    }

    if (item.actions) {
      for (let action of item.actions) {
        action.id = currentNodeId++;
      }
    }
  }
  return currentNodeId;
};

const newNavTreeItem = (id, hasMenu, level) => ({
  id,
  hasMenu,
  level,
  left: -1,
  up: -1,
  down: -1,
  right: -1
});

const getNextItem = (items, index) => {
  if (index < items.length) {
    const nextItem = items[index];
    let id = nextItem.id;
    let type = nextItem.type;

    if (nextItem.type === 'actions') {
      id = nextItem.actions[0].id;
      type = 'action';
    }

    return {
      id,
      type
    };
  } else {
    return {
      id: 0,
      type: 'none'
    };
  }
};

// currently handles only one sub menu level
const buildItemNavTree = (items, navMap) => {
  const itemsCount = items.length;
  let navItem;
  let previousItem = -1;

  items.forEach((item, index) => {
    const nextItem = getNextItem(items, index + 1);

    if (item.type !== 'actions') {
      navItem = navMap[item.id] = newNavTreeItem(item.id, item.hasMenu, item.level);
      navItem.perform = item.perform;
      navItem.up = previousItem;

      if (index !== itemsCount - 1) {
        navItem.down = nextItem.id;
      }
      navItem.hasMenu = item.hasMenu;
    } else {
      const actionsLength = item.actions.length;
      let previousAction = -1;
      item.actions.forEach((action, index) => {
        navItem = navMap[action.id] = newNavTreeItem(action.id, false, item.level);
        navItem.perform = action.perform;
        const nextAction = getNextItem(item.actions, index + 1);

        navItem.left = previousAction;

        if (index !== actionsLength - 1) {
          navItem.right = nextAction.id;
        }

        navItem.up = previousItem;

        navItem.down = nextItem.id;
        previousAction = action.id;
      });
    }

    if (item.hasMenu) {
      const subMenuLength = item.items.length;
      let previousSubItem = -1;
      navItem.right = item.items[0].id;

      item.items.forEach((subItem, index) => {
        navItem = navMap[subItem.id] = newNavTreeItem(subItem.id, subItem.hasMenu, subItem.level);
        navItem.perform = subItem.perform;
        const nextSubItem = getNextItem(item.items, index + 1);

        navItem.up = previousSubItem;
        navItem.left = item.id;

        if (index !== subMenuLength - 1) {
          navItem.down = nextSubItem.id;
        }

        previousSubItem = subItem.id;
      });
    }

    if (item.type === 'actions') {
      previousItem = item.actions[0].id;
    } else {
      previousItem = item.id;
    }
  });
};

export default {
  namespaced: true,
  state: {
    items: [],
    openMenus: {},
    itemNavTree: {},
    activeNodeId: 0,
    coordinates: {
      top: 0,
      left: 0
    },
    resolve: () => {}
  },
  mutations: {
    setResolve: setter('resolve'),
    setItems: setter('items'),
    setItemNavTree: setter('itemNavTree'),
    setActiveNode: (state, value) => {
      state.activeNodeId = value;
    },
    setActiveNodeToFirst: (state, item) => {
      if (state.items.length > 0) {
        const first = state.items[0];
        if (first.type === 'actions') {
          state.activeNodeId = first.actions[0].id;
        } else {
          state.activeNodeId = first.id;
        }
      }
    },
    setCoordinates: setter('coordinates'),
    openMenu: (state, item) => {
      Vue.set(state.openMenus, item.id, item.level);
    },
    closeAllMenus: state => {
      state.openMenus = {};
    },
    closeMenus: (state, activeLevel) => {
      Object.entries(state.openMenus).forEach(([id, level]) => {
        if (level >= activeLevel) {
          Vue.delete(state.openMenus, id);
        }
      });
    }
  },
  getters: {
    hasOpenMenus: state => Object.keys(state.openMenus).length > 0,
    hasItems: state => state.items.length > 0,
    activeNodeNavProps: state => {
      if (state.activeNodeId && state.itemNavTree) {
        return state.itemNavTree[state.activeNodeId];
      } else {
        return null;
      }
    }
  },
  actions: {
    open({ commit }, { items, coordinates }) {
      // enrich item array with some properties needed for state handling
      let level = 0;
      let nodeId = 1;

      processItems(items, level, nodeId);

      let navMap = {};
      const strippedItems = _.cloneDeep(items);

      const removeInvalidTypes = item => !item.type || item.type === 'separator';
      // clear separators from items for nav tree building
      _.remove(strippedItems, removeInvalidTypes);
      for (const strippedItem of strippedItems) {
        if (strippedItem.hasMenu) {
          _.remove(strippedItem.items, removeInvalidTypes);
        }
      }

      buildItemNavTree(strippedItems, navMap);

      commit('setItemNavTree', navMap);
      commit('setItems', items);
      commit('setCoordinates', coordinates);
      return new Promise(resolve => commit('setResolve', resolve));
    },
    close({ commit }) {
      commit('setItems', []);
      commit('closeAllMenus');
      commit('setItemNavTree', {});
      commit('setActiveNode', 0);
      commit('setResolve', () => {});
    },
    activateNode({ commit, state, getters }, { item, active }) {
      if (active) {
        commit('setActiveNode', item.id);
      }

      if (item.hasMenu) {
        // close all other open menus
        if (getters.hasOpenMenus) {
          commit('closeMenus', item.level);
        }
        commit('openMenu', item);
      } else {
        if (getters.hasOpenMenus) {
          commit('closeMenus', item.level || 0);
        }
      }
    },
    performOnActive({ dispatch, state, getters }) {
      const activeNode = getters.activeNodeNavProps;
      if (activeNode && activeNode.perform) {
        state.resolve(activeNode);
        dispatch('close');
      }
    },
    activateNodeWithId({ commit, dispatch, state, getters }, id) {
      const item = state.itemNavTree[id];
      if (item) {
        dispatch('activateNode', { item, active: true });
      }
    }
  }
};
