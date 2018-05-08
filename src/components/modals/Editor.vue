<template>
  <modal-inner class="modal__inner-1--editor" aria-label="Editor">
    <div class="modal__content">
      <div class="flex flex--column">
        <h2 class="modal__title">Code editor</h2>
        <form-entry class="editor__language" label="Language">
          <select-menu slot="field" v-form-el-focus :selected="code.language" :items="languages" :accesskey="'l'"
                       @change="code.language = $event"/>
        </form-entry>
        <form-entry class="editor__text" label="Code">
          <pre slot="field" contenteditable="true" spellcheck="false"
               @keydown="onKeydown" @keyup="onKeyUp"></pre>
        </form-entry>
        <slider label="_Print line numbers" :active="code.printLineNumbers" @change="togglePrintLineNumbers"
                :disable="code.inline"/>
        <slider label="Inl_ine coding" :active="code.inline" @change="toggleInline" :disable="code.printLineNumbers"/>
        <div class="modal__error modal__error--settings">{{error}}</div>
      </div>
      <div class="modal__button-bar">
        <button class="button" @click="config.reject()" accesskey="c">Cancel</button>
        <button class="button" @click="submit" accesskey="s" :disabled="!hasText">Save</button>
      </div>
    </div>
  </modal-inner>
</template>

<script>
import ModalInner from './common/ModalInner';
import ObjectUtil from '../../util/objectUtil';
import SelectMenu from '../SelectMenu';
import Slider from '../Slider';
import FormEntry from '../FormEntry';
import config from '../../config';
import { ZERO_WIDTH } from '../../config/constants';
import { mapGetters } from 'vuex';
import eventProxy from '../../util/eventProxy';

export default {
  components: {
    ModalInner,
    FormEntry,
    Slider,
    SelectMenu
  },
  data: () => ({
    code: {
      printLineNumbers: false,
      inline: false,
      text: '',
      language: ''
    },
    hasText: false,
    languages: config.prism.languages,
    error: null
  }),
  beforeMount() {
    ObjectUtil.assign(this.code, this.config);
  },
  mounted() {
    this.$refs.pre = document.querySelector('.editor__text pre');
    this.$refs.pre.textContent = this.code.text;
    this.checkHasText();
  },
  computed: {
    ...mapGetters('modal', ['config'])
  },
  methods: {
    checkHasText() {
      this.hasText =
        this.$refs.pre.textContent.length > 0 &&
        !this.$refs.pre.textContent.hasOwnProperty('notifyType'); // for IE compatibility when no content is there
    },
    onKeyUp() {
      this.checkHasText();
    },
    onKeydown(evt) {
      eventProxy.$trigger('handleCodeEditorKeyDown', evt);
    },
    togglePrintLineNumbers(value) {
      this.code.printLineNumbers = value;
      if (value) {
        this.code.inline = false;
      }
    },
    toggleInline(value) {
      this.code.inline = value;
      if (value) {
        this.code.printLineNumbers = false;
      }
    },
    submit() {
      // replace breaks with new line character
      this.code.text = this.$refs.pre.innerHTML.replace(/<br>/g, '\n').replace(ZERO_WIDTH, '');
      this.config.resolve(this.code);
    }
  }
};
</script>

<style lang="scss">
@import '../common/base';

.lf {
  display: inline;
}

.modal__inner-1--editor {
  max-width: 900px;
}

.editor__text {
  pre {
    font-family: $font-family-monospace;
    font-size: $font-size-monospace;
    line-height: 1.7;
    margin: 0;
    word-break: break-all;
    -ms-word-wrap: break-word;
    word-wrap: break-word;
    /*line-break: after-white-space;*/
    background: white;
    min-height: 200px;

    &:focus {
      outline: none;
    }
  }
}

.editor__language {
  max-width: 250px;
}
</style>
