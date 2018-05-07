<template>
  <div class="editor-toolbar flex flex--row flex--align-center" :style="{top: top, left: left, width: toolbarWidth}">
    <div class="editor-toolbar__title">
      <div class="editor-toolbar__title--text">Editor-Actions</div>
    </div>
    <div class="editor-toolbar__inner editor-toolbar__inner--edit-buttons flex flex--align-center">
      <button v-if="!isCodeEditorDisabled" class="editor-toolbar__button button" @click.prevent="addCoding"
              :disabled="!hasSelection(false)">
        <icon icon="plus"/>
        Add Coding
      </button>
      <button v-if="!isCodeEditorDisabled" class="editor-toolbar__button button" :disabled="!hasSelection(true)"
              @click="makeInline()">
        <icon icon="code"/>
        Inline default
      </button>
      <drop-down-button v-if="!isCodeEditorDisabled" class="editor-toolbar__button" :disabled="!hasSelection(true)" :items="prismLanguages"
                        @itemChosen="makeInline">
        <icon icon="code"/>
        Inline specific
      </drop-down-button>
      <button class="editor-toolbar__button button" title="Create a blockquote" :disabled="!hasSelection(false)"
              @click="createBlockQuote">
        <icon icon="quote-right"/>
      </button>
    </div>
  </div>
</template>

<script>
import Logger from 'js-logger';
import { mapState, mapGetters } from 'vuex';
import DropDownButton from './DropDownButton';
import editorSvc from '../services/editorSvc';
import selectionSvc from '../services/selectionSvc';
import config from '../config';

const logger = Logger.get('EditorToolbar');

export default {
  components: {
    DropDownButton
  },
  data: () => ({
    prismLanguages: config.prism.languages
  }),
  computed: {
    ...mapGetters('layout', ['constants']),
    ...mapGetters(['hasSelection']),
    ...mapState('settings', {
      isCodeEditorDisabled: 'codeEditorDisabled'
    }),
    top() {
      return this.$store.getters['layout/styles'].distanceFromTop;
    },
    left() {
      return this.$store.state.layoutSettings.sideBarOpen
        ? this.constants.sideBarOpenWidth
        : this.constants.sideBarClosedWidth;
    },
    toolbarWidth() {
      return `calc(100% - ${this.left})`;
    }
  },
  methods: {
    async addCoding() {
      try {
        await selectionSvc.selectionListener.stop();
        editorSvc.createCode(await this.$store.dispatch('modal/open', 'editor'));
      } catch (e) {
        if (e) {
          logger.error(e);
        }
      }
      return selectionSvc.selectionListener.start();
    },
    makeInline(language) {
      editorSvc.createCode({
        inline: true,
        text: this.$store.state.selectionData.text,
        language,
        fromSelection: true
      });
    },
    _createBlockQuote() {
      editorSvc._createBlockQuote();
    }
  }
};
</script>

<style lang="scss">
@import './common/base';

.editor-toolbar {
  position: fixed;
  height: $toolbar-height;
  background: white;
  overflow: hidden;
  color: $secondary-color;
  @include no-selection;
  @include box-shadow(2px 2px 4px $shadow-color);
}

.editor-toolbar__title {
  line-height: $toolbar-height;
  @include no-selection;
  display: inline-block;
  background: darken($secondary-color, 10%);
  color: white;
  padding: 0 4px;
  flex: none;
  float: left;
}

.editor-toolbar__title--text {
  text-transform: uppercase;
  text-overflow: ellipsis;
  padding: 0 5px;
  overflow: hidden;
  white-space: nowrap;
}

.editor-toolbar__inner {
  /*padding-top: 4px;*/
}

.editor-toolbar__button {
  display: inline-block;
  text-transform: none;

  &.button {
    padding: 8px 12px;
    margin-top: 1px;
  }
}
</style>
