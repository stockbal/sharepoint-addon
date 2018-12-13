<template>
  <div class="toc" id="toc">
    <div class="toc__inner">
      <div class="toc__navbar">
        <a @click="scrollToTop" class="toc__nav-button button" title="To Top of Page">
          <icon icon="arrow-circle-up" />
        </a>
        <a
          @click="scrollSync"
          class="toc__nav-button button"
          :class="{ 'button--toggled': tocSynchronize }"
          title="Synchronize scroll position with Wikipage"
        >
          <icon icon="sync" />
        </a>
        <a v-if="editMode" @click="redo" class="button toc__nav-button" title="Refresh">
          <icon icon="redo"></icon>
        </a>
        <a class="button toc__nav-button" @click="expandAll" title="Expand all top menus">
          <icon icon="plus-circle" />
        </a>
        <a class="button toc__nav-button" @click="collapseAll" title="Collapse all top menus">
          <icon icon="minus-circle" />
        </a>
      </div>
      <div class="toc__filter">
        <span class="toc__filter-wrap">
          <form-entry label="Filter">
            <div slot="field">
              <input
                class="textfield"
                v-form-el-focus
                v-model="filterText"
                v-on:keyup="filter"
                @keydown.enter.prevent
              />
              <span
                class="toc__filter-delete-icon"
                v-if="filterText !== ''"
                @click="clearFilter"
                title="Clear filter"
              >
                <icon icon="times" fixed-width :mask="['fas', 'circle']" transform="shrink-6" />
              </span>
            </div>
          </form-entry>
        </span>
      </div>
    </div>
    <div class="toc__nodes"><toc-node :node="rootNode" /></div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import TocNode from './TocNode';
import $ from 'jquery';
import config from '../config';
import FormEntry from './FormEntry';
import eventProxy from '../util/eventProxy';

export default {
  components: {
    TocNode,
    FormEntry
  },
  data: () => ({
    unwatchTocSync: () => {},
    filterText: ''
  }),
  computed: {
    ...mapGetters('toc', ['rootNode']),
    ...mapState('toc', ['activeNode']),
    ...mapState('settings', ['tocSynchronize']),
    ...mapState(['editMode'])
  },
  destroyed() {
    this.$store.dispatch('toc/clearFilter');
  },
  methods: {
    ...mapActions('toc', {
      expandAll: 'openAllNodes',
      collapseAll: 'closeAllNodes'
    }),
    redo() {
      eventProxy.$trigger('updateToc');
    },
    scrollSync() {
      return this.$store.dispatch('settings/toggleSetting', 'tocSynchronize');
    },
    scrollToTop() {
      $(`#${config.elements.workspaceElementId}`).scrollTop(0);
      $('.toc__nodes').scrollTop(0);
      window.location.href = '#';
    },
    clearFilter() {
      this.filterText = '';
      this.$store.dispatch('toc/filter', '');
      $('.toc__filter .textfield').focus();
    },
    filter(e) {
      this.$store.dispatch('toc/filter', e.target.value);
    },
    scrollToActiveNodeItem(activeNodeItem) {
      const $activeTocItem = $(`#toc-item-${activeNodeItem}`);
      if (!$activeTocItem.length) {
        return;
      }

      const $tocNodes = $('.toc__nodes');

      $tocNodes.scrollTop(
        $activeTocItem.offset().top - $tocNodes.offset().top + $tocNodes.scrollTop()
      );
    },
    watchTocSynchronisation(watch) {
      if (!watch) {
        this.unwatchTocSync();
        this.unwatchTocSync = () => {};
      } else {
        // listen for activeNode changes
        this.unwatchTocSync = this.$watch('activeNode', this.scrollToActiveNodeItem);
      }
    }
  },
  mounted() {
    this.watchTocSynchronisation(this.tocSynchronize);
    this.$watch('tocSynchronize', newVal => {
      this.watchTocSynchronisation(newVal);
    });
  }
};
</script>

<style lang="scss" scoped>
@import './common/base';

.toc {
  width: 100%;
}

.toc__inner {
  padding: 10px;
  position: fixed;
  overflow: hidden;
  font-size: 0.85 * $font-size-base;
}

.toc__nodes {
  $top: 145px;

  position: absolute;
  top: $top;
  padding: 4px;
  height: calc(100% - #{$top});
  overflow: auto;
  width: 100%;
}

.toc__navbar {
  width: 100%;
}

.toc__filter {
  margin-top: -5px;
  padding-bottom: 10px;
  border-bottom: 1px solid $hr-color;
  width: $sidebar-width-full - 20px;

  .form-entry {
    margin: 5px 0;
  }
}

.toc__filter-wrap {
  position: relative;

  input {
    padding-right: 16px;

    &:focus {
      outline: none;
      border-color: $primary-color;
    }
  }

  .toc__filter-delete-icon {
    color: $dark-grey;
    position: absolute;
    display: block;
    font-size: 14px;
    top: 1px;
    height: 16px;
    width: 16px;
    right: 7px;
    cursor: pointer;
    &:active {
      color: $primary-color;
    }
  }
}

.button {
  &:hover {
    border-radius: 20px;
  }
  &.button--toggled {
    color: $primary-color;
    background: lightgray;
    border-radius: 20px;
    box-shadow: 1px 1px 2px darkgray inset;
  }
}
</style>
