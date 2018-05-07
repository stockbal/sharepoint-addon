<template>
  <div class="select-menu" @keydown.esc="onEsc">
    <button class="select-menu__button flex flex--row flex--align-center" @click="toggleMenu"
            :accesskey="accesskey">
      <span class="select-menu__button-text flex flex--column">{{selectedItem}}</span>
      <span class="select-menu__button-icon flex flex--column">
        <icon icon="caret-down" fixed-width focusable="false"/>
      </span>
    </button>
    <div class="select-menu__menu" v-if="menuVisible" :style="{width: menuWidth}">
      <ul tabindex="0" role="listbox" @keydown="onItemKeyDown">
        <li v-for="(value, key) in items" :value="key" :key="key" @click="chooseItem(key)" tabindex="-1" role="option"
            :class="{'select-menu__menu-item--selected': value === selectedItem}">{{value}}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import utils from '../services/utils';
import KeyStrokes from '../services/keystrokes';
// import $ from 'jquery';

export default {
  name: 'select-menu',
  props: ['selected', 'items', 'accesskey'],
  data: () => ({
    menuVisible: false,
    selectedItem: null,
    menuWidth: 'inherit',
    uid: utils.uid()
  }),
  created() {},
  beforeMount() {
    this.selectedItem = this.items[this.selected];
    if (this.selectedItem === undefined) {
      let [key, value] = Object.entries(this.items)[0];
      this.selectedItem = value;

      // trigger event to update parent to first element in menu
      this.$emit('change', key);
    }
  },
  mounted() {
    this.$el.addEventListener('focusout', e => {
      if (!e.relatedTarget) {
        this.menuVisible = false;
      }
    });
    this.menuWidth = this.$el.clientWidth + 'px';
    this.$refs.button = this.$el.querySelector('button');

    this.$refs.button.addEventListener('click', () => {
      this.$refs.button.focus();
    });
  },
  methods: {
    onItemKeyDown(evt) {
      if (evt.keyCode === KeyStrokes.ArrowDown || evt.keyCode === KeyStrokes.ArrowUp) {
        evt.preventDefault();
      }
    },
    chooseItem(itemKey) {
      this.selectedItem = this.items[itemKey];
      this.menuVisible = false;
      this.$refs.button.focus();
      this.$emit('change', itemKey);
    },
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
      // if (this.menuVisible) {
      //   setTimeout(() => {
      //     document.querySelector('.select-menu__menu ul li:first-child').focus();
      //   }, 2);
      // }
    },
    onEsc() {
      this.menuVisible = false;
    }
  }
};
</script>

<style lang="scss">
@import './common/base';

.select-menu {
  width: 100%;
  outline: none;

  ul,
  li {
    margin: 0;
    padding: 0;
    list-style-type: none;
    outline: none;
  }

  button {
    margin: 0;
    &,
    &:hover,
    &:focus {
      background: white;
    }
  }
}

.select-menu__button {
  background: white;
  border: none;
  text-align: left;
  cursor: pointer;
  outline: none;
  width: 100%;
  @include border-radius($border-radius-base);
  padding: 2px 5px;
}

.select-menu__button-text {
  width: 100%;
  outline: none;
  border: none;
  cursor: pointer;
  flex: 1;
}

.select-menu__button-icon {
  color: black;
  display: block;
  text-align: right;
}

.select-menu__menu {
  position: fixed;
  background: $primary-color;
  max-height: 300px;
  overflow: auto;
  z-index: 3000;
  border: 1px solid $dark-grey;
  @include box-shadow(0px 8px 13px $shadow-color);

  li {
    color: white;
    padding: 3px 8px;
    @include no-selection;
    cursor: pointer;

    &:hover,
    &:active,
    &:focus {
      background: $darker-primary-color;
    }
  }
}

.select-menu__menu-item--selected {
  background: $darker-primary-color;
}
</style>
