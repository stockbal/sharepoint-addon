<template>
  <modal-inner class="modal__inner-1--about-modal" aria-label="Editor">
    <div class="modal__content">
      <h2 class="modal__title">SharePoint Add-On</h2>
      <small>v{{version}} -- &copy; 2018 {{author}}</small>
      <hr/>
      <a class="link" target="_blank" :href="issueTracker">
        <icon icon="bug" slot="icon"/>
        Issue-Tracker
      </a>
      --
      <a class="link" target="_blank" :href="changelog">Changelog</a>
      <hr/>
      <div>Licensed under the <a href="https://opensource.org/licenses/MIT" target="_blank">MIT</a>-License</div>
      <div class="modal__button-bar">
        <button class="button" @click="config.resolve()" accesskey="c">Close</button>
      </div>
    </div>
  </modal-inner>
</template>

<script>
import ModalInner from './common/ModalInner';
import { mapGetters } from 'vuex';

export default {
  name: 'About',
  components: {
    ModalInner
  },
  data: () => ({
    version: VERSION,
    issueTracker: ISSUETRACKER,
    author: AUTHOR,
    changelog: `${REPOSITORY}/blob/master/CHANGELOG.md`
  }),
  computed: {
    ...mapGetters('modal', ['config'])
  }
};
</script>

<style lang="scss">
@import '../common/base';

.modal__inner-1--about-modal {
  text-align: center;

  a {
    color: $link-color;
    cursor: pointer;
    text-decoration: underline;
    text-decoration-skip: ink;

    &:hover {
      text-decoration: none;
    }

    &:focus {
      outline: 1px dotted $primary-color !important;
    }
  }

  h2 {
    text-align: center;
    font-size: 19.5px;
    font-weight: bold;
  }

  .logo-background {
    height: 75px;
    margin: 0.5rem 0;
  }

  .link {
    text-transform: none;
    text-decoration: underline;
  }

  small {
    font-size: 13px;
    display: block;
  }

  hr {
    width: 160px;
    max-width: 100%;
    margin: 1.5em auto;
  }
}
</style>
