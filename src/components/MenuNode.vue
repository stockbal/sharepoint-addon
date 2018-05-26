<template>
  <div class="menu-node">
    <div class="menu-node__item" v-on:mouseenter="toggleActive(true)">
      <div class="menu-node__item-separator" v-if="item.type === 'separator'"></div>
      <div class="menu-node__item--icon-buttons" v-else-if="item.type === 'actions'">
        <span v-for="(action, idx3) in item.actions" :key="idx3" :class="{active: action.id === activeNodeId}"
              v-on:mouseenter="toggleActionActive(action)"
              class="menu-node__action-item" :title="action.tooltip" :style="{ marginLeft: (action.space || 0) + 'px'}"
              @click.stop="close(action)" @mousedown.prevent @mouseup.prevent>
          <icon class="menu-icon" :icon="action.icon" fixed-width style="font-size: 15px"></icon>
        </span>
      </div>
      <div class="menu-node__item menu-node__item--disabled" v-else-if="item.disabled">{{item.name}}
      </div>
      <div class="menu-node__item-link flex flex--row flex--align-center" v-else
           :class="{active: item.id === activeNodeId}"
           @click.stop="close(item)" @mousedown.prevent @mouseup.prevent>
        <span class="menu-node__item-icon flex flex--column flex--center flex--align-center">
          <icon v-if="item.icon" :icon="item.icon" fixed-width size="lg"/>
        </span>
        <span class="menu-node__item-text flex flex--column">{{item.name}}</span>
        <span class="menu-node__item-arrow flex flex--column flex--end" v-if="item.hasMenu">
          <icon icon="angle-right" fixed-width/>
        </span>
      </div>
    </div>

    <sub-menu-node :item="item" :key="item.id" v-if="item.hasMenu && isMenuOpen" :space-to-bottom="spaceToBottom"
                   :space-to-right="spaceToRight"></sub-menu-node>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import SubMenuNode from './SubMenuNode';

export default {
  name: 'MenuNode',
  props: {
    item: Object,
    spaceToBottom: {
      type: Number,
      default: 0
    },
    spaceToRight: {
      type: Number,
      default: 0
    }
  },
  components: {
    SubMenuNode
  },
  data: () => ({
    itemsVisible: false
  }),
  computed: {
    ...mapState('contextMenu', ['resolve', 'activeNodeId']),
    ...mapGetters('contextMenu', ['hasOpenMenus']),
    isMenuOpen() {
      return this.$store.state.contextMenu.openMenus.hasOwnProperty(this.item.id);
    }
  },
  methods: {
    close(item) {
      if (item) {
        this.resolve(item);
      }
      this.$store.dispatch('contextMenu/close');
    },
    toggleActive(active) {
      if (this.item.type === 'separator') {
        return;
      }
      this.$store.dispatch('contextMenu/activateNode', { item: this.item, active });
    },
    toggleActionActive(action) {
      this.$store.dispatch('contextMenu/activateNode', { item: action, active: true });
    }
  }
};
</script>

<style lang="scss">
@import './common/base';

.menu-node__action-item {
  cursor: pointer;
}

.menu-node__item-link {
  width: 100%;
  padding: 5px 5px 5px 15px;
  cursor: pointer;
  color: $primary-color;

  &.active {
    color: white;
    background: $primary-color;
  }
}

.menu-node__item-icon {
  width: 15px;
  height: 15px;
  margin-right: 8px;
}

.menu-node__item-text {
  flex: 1;
  /*width: 100%;*/
}

.menu-node__item--disabled {
}

.menu-node__item-separator {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin: 5px 0;
}

.menu-node__children {
  position: absolute;
  display: block;
}

.menu-node__action-item {
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  border-left: 1px solid #ddd;
  background: $primary-color;
  color: white;
  border-radius: 0;
  padding: 5px 7px;
  margin-right: 0;

  &.active {
    color: $primary-color;
    background: white;
  }
}

.menu-node__item--icon-buttons {
  padding: 5px 5px 5px 10px;
}
</style>
