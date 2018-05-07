<template>
  <div class="modal" @keyup.esc="onEscape" @keydown.tab="onTab">
    <editor v-if="config.type === 'editor'" />
    <about v-else-if="config.type === 'about'" />
    <style-settings-modal v-else-if="config.type === 'editorStyle'" />
    <modal-inner v-else aria-label="Dialog">
      <div class="modal__content" v-html="config.content"></div>
      <div class="modal__button-bar">
        <button class="button" v-if="config.rejectText" @click="config.reject()">{{config.rejectText}}</button>
        <button class="button" v-if="config.resolveText" @click="config.resolve()">{{config.resolveText}}</button>
      </div>
    </modal-inner>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ModalInner from './modals/common/ModalInner';
import Editor from './modals/Editor';
import About from './modals/About';
import StyleSettingsModal from './modals/StyleSettingsModal';
import _ from 'lodash';

const getTabbables = container => {
  let tabbables = container.querySelectorAll('a[href], button, .textfield, [data-control]');
  // Filter enabled and visible element
  return _.filter(
    tabbables,
    el => !el.disabled && el.offsetParent !== null && !el.classList.contains('not-tabbable')
  );
};

export default {
  components: {
    ModalInner,
    About,
    Editor,
    StyleSettingsModal
  },
  computed: mapGetters('modal', ['config']),
  methods: {
    onEscape() {
      this.config.reject();
    },
    onTab(evt) {
      const tabbables = getTabbables(this.$el);
      const firstTabbable = tabbables[0];
      const lastTabbable = tabbables[tabbables.length - 1];
      if (evt.shiftKey && firstTabbable === evt.target) {
        evt.preventDefault();
        lastTabbable.focus();
      } else if (!evt.shiftKey && lastTabbable === evt.target) {
        evt.preventDefault();
        firstTabbable.focus();
      }
    },
    onFocusInOut(evt) {
      const isFocusIn = evt.type === 'focusin';
      if (evt.target.parentNode && evt.target.parentNode.parentNode) {
        // Focus effect
        if (
          evt.target.parentNode.classList.contains('form-entry__field') &&
          evt.target.parentNode.parentNode.classList.contains('form-entry')
        ) {
          evt.target.parentNode.parentNode.classList.toggle('form-entry--focused', isFocusIn);
        }
      }
    }
  },
  mounted() {
    window.addEventListener('focusin', this.onFocusInOut);
    window.addEventListener('focusout', this.onFocusInOut);
    const tabbables = getTabbables(this.$el);
    tabbables[0].focus();
  },
  destroyed() {
    window.removeEventListener('focusin', this.onFocusInOut);
    window.removeEventListener('focusout', this.onFocusInOut);
  }
};
</script>

<style lang="scss">
@import 'common/variables.scss';

.modal {
  position: fixed;
  top: 0;
  z-index: 1090;
  width: 100%;
  height: 100%;
  background-color: rgba(160, 160, 160, 0.5);
  overflow: auto;

  hr {
    margin: 0.5em 0;
  }
  h1,
  h2,
  h3 {
    text-align: left;
    margin: 14px 0;
  }
}
.modal__title {
  text-transform: uppercase;
  color: $primary-color;
}

.modal__inner-1 {
  margin: 0 auto;
  width: 100%;
  min-width: 320px;
  max-width: 480px;
}

.modal__inner-2 {
  margin: 40px 10px 100px;
  background-color: #f8f8f8;
  padding: 40px 50px 30px;
  border-radius: $border-radius-base;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: $border-radius-base;
    width: 100%;
    background-color: $primary-color;
  }
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: $border-radius-base;
    width: 100%;
    background-color: $darker-primary-color;
  }
}

.modal__content > :first-child,
.modal__content > .modal__image:first-child + * {
  margin-top: 0;
}

.modal__image {
  float: left;
  width: 64px;
  height: 64px;
  margin: 1.5em 1.5em 0.5em 0;
  & + *::after {
    content: '';
    display: block;
    clear: both;
  }
}

.modal__error {
  color: #de2c00;
}

.modal__info {
  background-color: $info-bg;
  border-radius: $border-radius-base;
  margin: 1.2em 0;
  padding: 0.75em 1.25em;
}

.modal__button-bar {
  margin-top: 1.75rem;
  text-align: right;
}

[role='tabpanel'] {
  width: 100%;
}

.tabs {
  border-bottom: 1px solid $hr-color;
  margin: 1em 0 2em;
  &::after {
    content: '';
    display: block;
    clear: both;
  }
}

.tabs__tab {
  width: 50%;
  float: left;
  text-align: center;
  line-height: 1.4;
  font-weight: 400;
  font-size: 1.1em;
}

.tabs__tab > a {
  width: 100%;
  text-decoration: none;
  padding: 0.67em 0.33em;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  border-top-left-radius: $border-radius-base;
  border-top-right-radius: $border-radius-base;
  color: $link-color;
  &:hover,
  &:focus {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.tabs__tab--active > a {
  border-bottom: 2px solid $link-color;
  color: inherit;
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
