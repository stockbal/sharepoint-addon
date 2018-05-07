<template>
  <pre class="code-editor textfield prism-default" :disabled="disabled"
       :contenteditable="!disabled" spellcheck="false"></pre>
</template>

<script>
import Prism from 'prismjs';
import editorUtilSvc from '../services/editorUtilsSvc';
import _ from 'lodash';

export default {
  props: ['value', 'lang', 'disabled'],
  data: () => ({
    prismClass: `language-${this.lang}`
  }),
  methods: {
    onKey(evt) {
      this.$emit('changed', this.$el.innerText);
    },
    onKeyDown(evt) {
      editorUtilSvc.$trigger('handleCodeEditorKeyDown', evt, false);
    },
    onPaste(evt) {
      let htmlContent = _.findIndex(evt.clipboardData.items, { type: 'text/html' });
      if (htmlContent !== -1) {
        delete evt.clipboardData.items[htmlContent];
      }
      setTimeout(() => {
        this.highlight();
      });
    },
    highlight() {
      Prism.highlightElement(this.$el);
    }
  },
  mounted() {
    this.$el.textContent = this.value;
    this.$el.classList.add(`language-${this.lang}`);
    Prism.highlightElement(this.$el);
    if (!this.disabled) {
      this.$el.addEventListener('keyup', this.onKey);
      this.$el.addEventListener('keydown', this.onKeyDown);
      this.$el.addEventListener('paste', this.onPaste);
    }
  }
};
</script>

<style lang="scss">
@import 'common/variables.scss';

.code-editor {
  margin: 0;
  font-family: $font-family-monospace;
  font-size: $font-size-monospace;
  font-variant-ligatures: no-common-ligatures;
  word-break: break-word;
  word-wrap: normal;
  height: auto;
  min-height: 160px;
  overflow: auto;
  padding: 0.2em 0.4em;
  tab-size: 2;

  * {
    line-height: $line-height-base;
    font-size: inherit !important;
    margin: 0;
  }
}
</style>
