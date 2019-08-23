<template>
  <div class="quick-menu" @contextmenu.prevent="close()">
    <div
      class="quick-menu__inner flex flex--column"
      :style="{ left: left + 'px', top: top + 'px' }"
    >
      <div class="quick-menu__title-bar flex flex--row flex--align-center">
        <span class="flex flex--column">{{ title }}</span>
        <button class="button flex flex--column flex--end" @click="close()">
          <icon icon="times" fixed-width></icon>
        </button>
      </div>
      <div class="quick-menu__items">
        <div class="quick-menu__item" v-for="(item, idx) in items" :key="idx">
          <!-- Display Select menu for type 'select' -->
          <form-entry v-if="item.type === 'select'" :label="item.label">
            <select-menu
              slot="field"
              v-form-el-focus
              :selected="item.value"
              :items="item.options"
              @change="item.action($event)"
            />
          </form-entry>
          <form-entry v-else-if="item.type === 'text'" :label="item.label">
            <text-input
              slot="field"
              v-form-el-focus
              :value="item.value"
              @change="item.action($event)"
            />
          </form-entry>
          <!-- Display Slider for type 'check' -->
          <Slider
            v-else-if="item.type === 'check'"
            :label="item.label"
            :active="item.value"
            @change="item.action($event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Slider from './Slider';
import FormEntry from './FormEntry';
import SelectMenu from './SelectMenu';
import $ from 'jquery';
import utils from '../services/utils';

import keystrokes from '../services/keystrokes';
import TextInput from './TextInput';

export default {
  name: 'QuickMenu',
  components: {
    TextInput,
    Slider,
    FormEntry,
    SelectMenu
  },
  data: () => ({
    sizeData: {}
  }),
  computed: {
    ...mapState('quickMenu', ['items', 'coordinates', 'title']),
    top() {
      return this.coordinates.top + this.sizeData.topOffset;
    },
    left() {
      return this.coordinates.left + this.sizeData.leftOffset;
    }
  },
  methods: {
    close() {
      this.$store.dispatch('quickMenu/close');
    },
    keyListener(evt) {
      if (evt.keyCode === keystrokes.Escape) {
        evt.preventDefault();
        this.close();
      }
    },
    mouseListener(evt) {
      if (!$(evt.target).closest('.quick-menu__inner, .select-menu__menu').length) {
        evt.preventDefault();
        this.close();
      }
    },
    sendTextValue(item, evt) {
      console.log(evt);
      item.action(evt.target.value);
    }
  },
  mounted() {
    document.addEventListener('mousedown', this.mouseListener);
    document.addEventListener('keydown', this.keyListener);

    this.sizeData = utils.calcOffsetForElement(
      this.$el.querySelector('.quick-menu__inner'),
      document.body,
      this.coordinates.top,
      this.coordinates.left
    );
  },
  beforeDestroy() {
    document.removeEventListener('mousedown', this.mouseListener);
    document.removeEventListener('keydown', this.keyListener);
  }
};
</script>

<style lang="scss">
@import './common/base';

.quick-menu {
  position: absolute;
  font-size: 13px;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.quick-menu__text-type {
  background-color: #fff;
  border: none;
  font-family: inherit;
  font-weight: 400;
  padding: 0 0.6rem;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  color: inherit;
  height: 26px;
}

.quick-menu__inner {
  position: absolute;
  min-width: 200px;
  background: $light-gray;
  user-select: none;

  border-radius: $border-radius-base + 2px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
}

.quick-menu__items {
  padding: 10px;
}

.quick-menu__title-bar {
  padding: 5px 10px;

  > span {
    width: 100%;
    flex: 1;
    text-transform: uppercase;
    font-weight: bold;
    color: $primary-color;
  }
  .button {
    /*text-align: right;*/
    flex: none;
    margin: 0;
  }
}
</style>
