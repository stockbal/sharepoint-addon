<template>
  <div class="toc" id="toc">
    <div class="toc__inner">
      <div class="toc__navbar">
        <a @click="scrollToTop" class="toc__nav-button button" title="To Top of Page">
          <icon icon="arrow-circle-up"/>
        </a>
        <a class="button toc__nav-button" @click="expandAll" title="Expand all top menus">
          <icon icon="plus-circle"/>
        </a>
        <a class="button toc__nav-button" v-on:click="collapseAll" title="Collapse all top menus">
          <icon icon="minus-circle"/>
        </a>
      </div>
      <div class="toc__filter">
      <span class="toc__filter-wrap">
        <form-entry label="Filter">
          <div slot="field">
            <input class="textfield" v-form-el-focus v-model="filterText" v-on:keyup="filter" @keydown.enter.prevent/>
            <span class="toc__filter-delete-icon" v-if="filterText !== ''" @click="clearFilter" title="Clear filter">
              <icon icon="times" fixed-width :mask="['fas', 'circle']" transform="shrink-6"/>
            </span>
          </div>
        </form-entry>
      </span>
      </div>
      <hr />
    </div>
    <div class="toc__nodes">
      <toc-node :node="rootNode"/>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import TocNode from './TocNode';
import $ from 'jquery';
import config from '../config';
import FormEntry from './FormEntry';

export default {
  components: {
    TocNode,
    FormEntry
  },
  data: () => ({
    filterText: ''
  }),
  computed: {
    ...mapGetters('toc', ['rootNode'])
  },
  destroyed() {
    this.$store.dispatch('toc/clearFilter');
  },
  methods: {
    ...mapActions('toc', {
      expandAll: 'openAllNodes',
      collapseAll: 'closeAllNodes'
    }),
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
    }
  }
};
</script>

<style lang="scss">
@import './common/base';

.toc {
  width: 100%;
}

.toc__inner {
  padding: 10px;
  position: fixed;
  overflow: hidden;
  //@include box-shadow(0px 3px 3px $shadow-color);
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
  font-size: 1.1rem;
}

.toc__filter {
  margin-top: -5px;
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
</style>
