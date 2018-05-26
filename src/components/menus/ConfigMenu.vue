<template>
  <div class="side-bar__panel side-bar__panel--menu">
    <settings-group title="Table of Contents" subtitle="Settings for TOC">
      <slider label="Show at start" :active="tocShowAtStart" @change="update('tocShowAtStart', $event)"/>
      <slider label="Show menus collapsed" :active="tocCollapsedInitially"
              @change="update('tocCollapsedInitially', $event)"/>
    </settings-group>
    <hr/>
    <settings-group title="Code Styling" subtitle="Configure Code Styling">
      <form-entry label="Theme">
        <select-menu slot="field" v-form-el-focus :selected="codeEditorTheme" :items="prismThemes"
                     @change="update('codeEditorTheme', $event)"/>
      </form-entry>
    </settings-group>
    <hr/>
    <settings-group title="Editor" subtitle="Settings for Editor">
      <slider label="Disa_ble" :active="editorDisabled" @change="update('editorDisabled', $event)"
              title="Disables the context menu of the editor"/>
      <slider label="Enable _Editor Theme" :active="editorCustomStyleActive" @change="update('editorCustomStyleActive', $event)"
              title="Activate a custom stylesheet for the wiki page content"/>
      <slider label="_Dark Theme" :active="editorCustomStyleDark" @change="update('editorCustomStyleDark', $event)"
              title="Activate the custom dark theme" :disable="darkThemeDisabled"/>
    </settings-group>
    <hr/>
  </div>

</template>

<script>
import MenuEntry from './common/MenuEntry';
import FormEntry from '../FormEntry';
import SelectMenu from '../SelectMenu';
import SettingsGroup from './common/SettingsGroup';
import Slider from '../Slider';
import config from '../../config';
import Logger from 'js-logger';
/* eslint-disable no-unused-vars */
import { mapState, mapGetters, mapActions } from 'vuex';

const logger = Logger.get('Config Menu');

export default {
  components: {
    MenuEntry,
    Slider,
    FormEntry,
    SettingsGroup,
    SelectMenu
  },
  data: () => ({
    prismThemes: config.prism.themes
  }),
  computed: {
    ...mapState('settings', [
      'tocShowAtStart',
      'tocCollapsedInitially',
      'codeEditorTheme',
      'editorCustomStyleActive',
      'editorCustomStyleDark',
      'editorDisabled'
    ]),
    ...mapGetters('settings', ['darkThemeDisabled'])
  },
  created() {},
  methods: {
    update(id, value) {
      this.$store.dispatch('settings/updateSetting', { id, value });
    }
  }
};
</script>

<style lang="scss">

</style>
