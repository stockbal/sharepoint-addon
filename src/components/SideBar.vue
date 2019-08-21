<template>
  <div
    v-if="isOpen"
    class="side-bar flex flex--column"
    :class="{ visible: isOpen }"
    :style="{ height: panelHeight }"
  >
    <div class="side-title flex flex--row">
      <button
        v-if="panel !== 'menu'"
        class="side-title__button button"
        @click="setPanel('menu')"
        title="Add-On's Menu"
      >
        <icon icon="arrow-left" fixed-width />
      </button>
      <div class="side-title__title">{{ panelName }}</div>
      <button class="side-title__button button" @click="toggleSideBar()" title="Close Sidebar">
        <icon icon="times" fixed-width />
      </button>
    </div>

    <div class="side-bar__inner">
      <main-menu v-if="panel === 'menu'" />
      <config-menu v-else-if="panel === 'config'" />
      <toc v-else />
    </div>
  </div>
</template>

<script>
import MainMenu from './menus/MainMenu';
import ConfigMenu from './menus/ConfigMenu';
import Toc from './Toc';
import { mapState, mapActions } from 'vuex';
import { PANEL_NAMES } from '../config/constants';

export default {
  components: {
    MainMenu,
    ConfigMenu,
    Toc
  },
  computed: {
    ...mapState('layoutSettings', {
      isOpen: 'sideBarOpen',
      panel: 'sideBarPanel'
    }),
    panelName() {
      return PANEL_NAMES[this.panel];
    },
    panelHeight() {
      return `calc(100% - ${this.$store.getters['layout/styles'].distanceFromTop}`;
    },
    toggleButtonText() {
      return `Open ${this.panelName}`;
    }
  },
  methods: {
    ...mapActions('layoutSettings', {
      setPanel: 'setSideBarPanel',
      toggleSideBar: 'toggleSideBar'
    })
  }
};
</script>

<style lang="scss">
@import './common/base';

.side-bar {
  overflow: hidden;
  position: fixed;
  background: $light-gray;
  width: $sidebar-width-folded;
  bottom: 0;
  @include box-shadow(1px 2px 5px $shadow-color);

  .button,
  button {
    /*font-size: 14px;*/
  }
  hr {
    margin: 10px 40px;
    display: none;
    border-top: 1px solid $hr-color;
  }

  * + hr {
    display: block;
  }

  hr + hr {
    display: none;
  }

  &.visible {
    width: $sidebar-width-full;
  }
}

.side-bar__inner {
  overflow: auto;
  height: 100%;
}

.side-bar__panel--menu {
  padding: 10px;
}
</style>
