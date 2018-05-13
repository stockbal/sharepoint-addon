<template>
  <div class="context-menu" @contextmenu.prevent="close()" @click.prevent.stop="close()">
    <div class="context-menu__inner menu-list" tabindex="0"
         :style="{left: coordinates.left + 'px', top: top + 'px'}">
      <menu-node v-for="(item, idx) in items" :key="idx" :item="item" :space-to-bottom="bottomSpace"/>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import MenuNode from './MenuNode';
import KeyCodes from '../services/keystrokes';
import $ from 'jquery';

export default {
  name: 'context-menu',
  components: { MenuNode },
  data: () => ({
    topOffset: 0,
    spaceToBottom: 0
  }),
  computed: {
    ...mapState('contextMenu', ['items', 'coordinates']),
    top() {
      return this.coordinates.top - this.topOffset;
    },
    bottomSpace() {
      return this.spaceToBottom;
    }
  },
  methods: {
    close() {
      this.$store.dispatch('contextMenu/close');
    },
    _mouseListener(evt) {
      const $target = $(evt.target);
      if (!$target.closest('.context-menu__inner').length) {
        this.close();
      }
    },
    _keyListener(evt) {
      const validKeys = [
        KeyCodes.ArrowUp,
        KeyCodes.ArrowDown,
        KeyCodes.ArrowLeft,
        KeyCodes.ArrowRight,
        KeyCodes.Enter
      ];
      if (validKeys.includes(evt.keyCode)) {
        const activeItem = this.$store.getters['contextMenu/activeNodeNavProps'];
        if (activeItem) {
          let nextActiveNodeId = 0;

          if (evt.keyCode === KeyCodes.ArrowUp && activeItem.up > 0) {
            nextActiveNodeId = activeItem.up;
          } else if (evt.keyCode === KeyCodes.ArrowRight && activeItem.right > 0) {
            nextActiveNodeId = activeItem.right;
          } else if (evt.keyCode === KeyCodes.ArrowDown && activeItem.down > 0) {
            nextActiveNodeId = activeItem.down;
          } else if (evt.keyCode === KeyCodes.ArrowLeft && activeItem.left > 0) {
            nextActiveNodeId = activeItem.left;
          } else if (evt.keyCode === KeyCodes.Enter) {
            this.$store.dispatch('contextMenu/performOnActive');
          }

          if (nextActiveNodeId > 0) {
            this.$store.dispatch('contextMenu/activateNodeWithId', nextActiveNodeId);
          }
        }
        evt.preventDefault();
      } else {
        this.close();
      }
    }
  },
  mounted() {
    document.addEventListener('keydown', this._keyListener);
    document.addEventListener('mousedown', this._mouseListener);
    this.$store.commit('contextMenu/setActiveNodeToFirst');

    let contextMenuHeight = this.$el.querySelector('.context-menu__inner').offsetHeight;
    let spaceForMenu = this.$el.offsetHeight - (this.coordinates.top + contextMenuHeight);

    if (spaceForMenu < 0) {
      this.topOffset = contextMenuHeight;
      this.spaceToBottom = this.$el.offsetHeight - this.coordinates.top;
    } else {
      this.spaceToBottom = this.$el.offsetHeight - this.coordinates.top - contextMenuHeight;
    }
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this._keyListener);
    document.removeEventListener('mousedown', this._mouseListener);
  }
};
</script>

<style lang="scss">
@import './common/base';

.context-menu {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.menu-list {
  position: absolute;
  padding: 5px 0;
  min-width: 200px;
  background: $light-gray;

  border-radius: $border-radius-base + 2px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
}
</style>
