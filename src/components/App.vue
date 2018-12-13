<template>
  <div id="wiki-addons-container">
    <side-bar />
    <modal v-if="showModal" />
    <context-menu v-if="showContextMenu" />
    <image-overlay v-if="showImagePreview" />
    <quick-menu v-if="showQuickMenu" />
  </div>
</template>

<script>
import ImageOverlay from './ImageOverlay';
import QuickMenu from './QuickMenu';
import SideBar from './SideBar';
import ContextMenu from './ContextMenu';
import Modal from './Modal';
import Logger from 'js-logger';
import Tooltip from 'tooltip.js';
import editorSvc from '../services/editorSvc';
import localDbSvc from '../services/localDbSvc';
import tocSvc from '../services/tocSvc';
import layoutSvc from '../services/layoutSvc';
import Vue from 'vue';
import $ from 'jquery';
import MenuNode from './MenuNode';

Logger.useDefaults();

Vue.component('menu-node', MenuNode);

const logger = Logger.get('App');

Vue.directive('form-el-focus', {
  bind(el) {
    const focusInOutListener = e => {
      $(e.target)
        .parents('.form-entry')
        .toggleClass('form-entry--focused');
    };
    el.addEventListener('focusin', focusInOutListener);
    el.addEventListener('focusout', focusInOutListener);
  }
});

Vue.directive('tooltip', {
  bind(el, binding) {
    /* eslint-disable no-new */
    new Tooltip(el, { title: binding.value, delay: 500 });
  }
});

export default {
  components: {
    QuickMenu,
    ImageOverlay,
    SideBar,
    ContextMenu,
    Modal
  },
  async created() {
    try {
      await editorSvc.determineEditMode();
      await localDbSvc.syncLocalStorage();
      await tocSvc.synchronizeTableOfContents();
      tocSvc.startScrollListener();
      tocSvc.updateActiveElement();
      await layoutSvc.startObservingChanges();
      await editorSvc.init();
    } catch (e) {
      logger.error(e);
    }
  },
  destroyed() {
    layoutSvc.stopObservingChanges();
  },
  computed: {
    showModal() {
      return !!this.$store.getters['modal/config'];
    },
    showContextMenu() {
      return this.$store.getters['contextMenu/hasItems'];
    },
    showImagePreview() {
      return !!this.$store.state.imagePreview.source;
    },
    showQuickMenu() {
      return this.$store.state.quickMenu.items.length > 0;
    }
  }
};
</script>

<style lang="scss">
@import './common/app';
@import './common/prism-themes';
</style>
