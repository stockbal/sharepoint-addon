<template>
  <modal-inner class="modal__inner-1--settings" aria-label="Style">
    <div class="modal__content">
      <div class="flex flex--row">
        <h2 class="modal__title">Style Settings</h2>
      </div>
      <div class="tabs flex flex--row">
        <tab :active="tab === 'custom'" @click="tab = 'custom'">
          Custom Style
        </tab>
        <tab :active="tab === 'default'" @click="tab = 'default'">
          Default Style
        </tab>
      </div>
      <div class="flex flex--row">
        <div class="form-entry" v-if="tab === 'default'" role="tabpanel" aria-label="Default Style">
          <form-entry class="editor__text" label="YAML:">
            <code-editor slot="field" lang="yaml" :value="defaultStyle" key="default-style"
                         disabled="true"></code-editor>
          </form-entry>
        </div>
        <div class="form-entry" v-else-if="tab === 'custom'" role="tabpanel" aria-label="Custom Style">
          <form-entry class="editor__text" label="YAML:">
            <code-editor lang="yaml" slot="field" :value="customStyle" key="custom-style"
                         @changed="setCustomStyle($event)"></code-editor>
          </form-entry>
        </div>
      </div>

      <div class="modal__error modal__error--settings">{{error}}</div>
    </div>
    <div class="modal__button-bar">
      <button class="button" @click="config.reject()">Cancel</button>
      <button class="button" @click="restoreDefault">Restore Default</button>
      <button class="button" @click="submit" accesskey="s">Save</button>
    </div>
  </modal-inner>
</template>

<script>
import yaml from 'js-yaml';
import { mapGetters } from 'vuex';
import ModalInner from './common/ModalInner';
import CodeEditor from '../CodeEditor';
import FormEntry from '../FormEntry';
import Tab from './common/Tab';
import defaultStyle from '../../data/defaultCustomEditorStyles.yml';
import { ZERO_WIDTH } from '../../config/constants';

const emptyStyle = `# Add your custom styling here to override the
# default styling

`;

export default {
  components: {
    ModalInner,
    Tab,
    FormEntry,
    CodeEditor
  },
  data: () => ({
    tab: 'custom',
    defaultStyle,
    customStyle: null,
    error: null
  }),
  computed: {
    ...mapGetters('modal', ['config']),
    strippedCustomStyle() {
      return this.customStyle === emptyStyle ? '' : this.customStyle;
    }
  },
  methods: {
    setCustomStyle(value) {
      this.customStyle = value.replace(ZERO_WIDTH, '');
      try {
        yaml.safeLoad(this.strippedCustomStyle);
        this.error = null;
      } catch (e) {
        this.error = e.message;
      }
    },
    submit() {
      if (!this.error) {
        this.config.resolve(this.strippedCustomStyle);
      }
    },
    restoreDefault() {
      this.config.resolve('');
    }
  },
  created() {
    const customStyle = this.$store.state.settings.editorCustomStyle;
    this.setCustomStyle(customStyle || emptyStyle);
  }
};
</script>

<style lang="scss">
@import '../common/variables';

.modal__inner-1--settings {
  max-width: 850px;
}

.modal__error--settings {
  white-space: pre-wrap;
  font-family: $font-family-monospace;
  font-size: $font-size-monospace;
}
</style>
