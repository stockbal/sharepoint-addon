<template>
  <div class="toc-node">
    <div
      :id="`toc-item-${node.id}`"
      class="toc-node__item"
      v-if="!node.isRoot && !isFiltered"
      :class="{ 'toc-node__link--active': node.id === activeNode }"
    >
      <div class="toc-node__link flex flex--row">
        <div
          class="toc-node__link-expander flex flex--column flex--center"
          v-if="node.isFolder"
          @click="toggle(node.id)"
        >
          <icon v-if="isOpen" :icon="['far', 'minus-square']" fixed-width />
          <icon v-else :icon="['far', 'plus-square']" fixed-width />
        </div>
        <div class="toc-node__link-without-expander flex flex-column flex--center" v-else></div>
        <div class="toc-node__active-link-indicator flex flex--column flex--center"></div>
        <a
          class="toc-node__link-text flex flex--column"
          :class="tocLevelClass"
          :style="{ paddingLeft: leftPadding }"
          @click="navigate(node.item.headingId)"
        >
          {{ node.item.headingName }}
        </a>
      </div>
    </div>
    <div class="toc-node__children" v-if="node.isFolder && isOpen">
      <toc-node v-for="node in node.children" :key="node.id" :node="node"> </toc-node>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import $ from 'jquery';
import config from '../config';

export default {
  name: 'toc-node',
  props: ['node'],
  data: () => ({}),
  computed: {
    leftPadding() {
      return `${this.node.depth * 15}px`;
    },
    isOpen() {
      return this.$store.state.toc.openNodes[this.node.id] || this.node.isRoot;
    },
    isFiltered() {
      return this.$store.state.toc.filteredNodes[this.node.id];
    },
    activeNode() {
      return this.$store.state.toc.activeNode;
    },
    tocLevelClass() {
      return `toc-node__link-level${this.node.depth}`;
    }
  },
  methods: {
    ...mapActions('toc', {
      toggle: 'toggleOpenNode'
    }),
    navigate(id) {
      history.pushState({ headingId: `#${id}` }, 'TOC Nav', `#${id}`);
      const $workspace = $(`#${config.elements.workspaceElementId}`);

      $workspace.scrollTop(
        $(`#${id}`).offset().top - $workspace.offset().top + $workspace.scrollTop()
      );
    }
  }
};
</script>

<style lang="scss">
@import './common/base';

.toc-node__link {
  color: #333;
  padding: 6px 8px;
  font-weight: 400;
  line-height: 1.4;
  text-align: left;
  vertical-align: middle;
  @include no-selection;
  background: transparent none;
  border: 0;
  border-radius: $border-radius-base;
  text-decoration: none;

  &:active,
  &:focus,
  &:hover {
    color: $primary-color;
    background-color: rgba(0, 0, 0, 0.05);
    outline: 0;
    text-decoration: none;
  }
}

.toc-node__link-text {
  &,
  &:active,
  &:visited {
    color: #333;
    background-color: transparent;
    text-decoration: none;
    white-space: normal;
    width: 100%;
    flex: 1;
    cursor: pointer;
  }

  &:hover {
    color: $primary-color;
  }
}

.toc-node__link-expander {
  padding-right: 2px;
  cursor: pointer;
  float: left;
  &:hover {
    color: $primary-color;
  }
}

.toc-node__link-without-expander {
  padding-right: 5px;
  width: 21px;
}

.toc-node__link-level0 {
  font-weight: bold;
  font-size: 15px;
}

.toc-node__link-level1 {
  font-style: italic;
  font-size: 14px;
}

.toc-node__link-level2 {
  font-size: 12px;
}

.toc-node__link-level3 {
  font-size: 11px;
  text-decoration: underline !important;
}

/* styles for active link */
.toc-node__active-link-indicator {
  font-weight: bold;
  border-left: 2.5px solid transparent;
  padding-right: 4px;
  width: 1px;
  height: inherit;
}

.toc-node__link--active {
  .toc-node__link-text {
    color: $primary-color;
    font-weight: bold;
  }
  .toc-node__active-link-indicator {
    border-color: $primary-color;
  }
}
</style>
