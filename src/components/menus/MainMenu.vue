<template lang="html">
  <div class="side-bar__panel side-bar__panel--menu">
    <menu-entry @click.native="setPanel('toc')">
      <icon icon="list" slot="icon"/>
      <div>Table of contents</div>
    </menu-entry>
    <hr/>
    <menu-entry @click.native="setPanel('config')">
      <icon icon="cog" slot="icon"/>
      <div>Quick Configuration</div>
      <span>Configure the Add-On</span>
    </menu-entry>
    <menu-entry @click.native="customStyle">
      <icon :icon="['fab', 'css3-alt']" slot="icon" size="lg"/>
      <div>Configure Styling</div>
      <span>Configure the styling for the editor and the add on</span>
    </menu-entry>
    <hr/>
    <menu-entry @click.native="openWiki()">
      <icon icon="book" slot="icon" />
      <div>Wiki</div>
      <span>Documentation of the Add-On</span>
    </menu-entry>
    <menu-entry @click.native="about()" class="about flex--end">
      <icon icon="question-circle" slot="icon"/>
      <div>About the Add-On</div>
    </menu-entry>
  </div>
</template>

<script>
import MenuEntry from './common/MenuEntry';
import Logger from 'js-logger';
import { mapActions } from 'vuex';
import eventProxy from '../../util/eventProxy';

const logger = Logger.get('MainMenu');

export default {
  components: {
    MenuEntry
  },
  methods: {
    ...mapActions('layoutSettings', {
      setPanel: 'setSideBarPanel'
    }),
    async about() {
      try {
        await this.$store.dispatch('modal/open', 'about');
      } catch (e) {}
    },
    openWiki() {
      window.open(`${REPOSITORY}/wiki`, 'Google', 'width=1080,height=950');
    },
    async customStyle() {
      try {
        const customStyle = await this.$store.dispatch('modal/open', 'editorStyle');
        await this.$store.dispatch('settings/updateSetting', {
          id: 'editorCustomStyle',
          value: customStyle
        });
        eventProxy.$trigger('setCustomStyle');
      } catch (e) {
        if (e) {
          logger.error(e.message);
        }
      }
    }
  }
};
</script>

<style lang="scss">

</style>
