<template>
  <div v-if="!isOpen" class="side-bar-opener side-title" :style="{ top: distanceFromTop }">
    <button
      class="side-title__button side-title__button--open button"
      :title="toggleButtonText"
      @click="toggleSideBar()"
    >
      <icon v-if="panel === 'toc'" icon="list" fixed-width />
      <icon v-else-if="panel === 'config'" icon="cog" fixed-width />
      <icon v-else icon="bars" fixed-width />
    </button>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { PANEL_NAMES } from '../config/constants';

export default {
  computed: {
    ...mapState('layoutSettings', {
      isOpen: 'sideBarOpen',
      panel: 'sideBarPanel'
    }),
    distanceFromTop() {
      return this.$store.getters['layout/styles'].distanceFromTop;
    },
    toggleButtonText() {
      // return `Open ${this.panelName}`;
      return `Open ${PANEL_NAMES[this.panel]}`;
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

.side-bar-opener {
  position: fixed;
  width: 36px;
  padding: 2px;
  left: -25px;
  transition: left 0.2s;

  &:hover {
    left: 0;
    box-shadow: 3px 0 3px rgba(0, 0, 0, 0.3);
  }
}
</style>
