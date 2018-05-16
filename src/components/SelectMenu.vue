<template>
  <div class="select-menu" @keydown.esc="onEsc">
    <button class="select-menu__button flex flex--row flex--align-center" @click="toggleMenu"
            :accesskey="accesskey">
      <span class="select-menu__button-text flex flex--column">{{selectedItem}}</span>
      <span class="select-menu__button-icon flex flex--column">
        <icon icon="caret-down" fixed-width focusable="false"/>
      </span>
    </button>
    <div class="select-menu__menu" v-show="menuVisible" ref="menu" @contextmenu.prevent="toggleMenu"
         :style="{width: `${menuWidth}px`, top: `${top}px`, left: `${left}px`}">
      <ul @keydown="onItemKeyDown">
        <li v-for="(value, key) in items" :value="key" :key="key" @click="chooseItem(key)"
            :class="{'select-menu__menu-item--selected': value === selectedItem}">{{value}}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import utils from '../services/utils';
import KeyStrokes from '../services/keystrokes';
import $ from 'jquery';

export default {
  name: 'select-menu',
  props: ['selected', 'items', 'accesskey'],
  data: () => ({
    menuVisible: false,
    selectedItem: null,
    menuWidth: 'inherit',
    uid: utils.uid(),
    top: 0,
    left: 0
  }),
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
    this.$refs.button = this.$el.querySelector('button');
    this.menuWidth = this.$refs.button.offsetWidth;
    document.addEventListener('mousedown', this.mouseListener);
    // move select menu to body
    const selectMenu = this.$el.querySelector('.select-menu__menu');
    document.body.appendChild(selectMenu);
  },
  beforeDestroy() {
    document.removeEventListener('mousedown', this.mouseListener);
    document.body.removeChild(this.$refs.menu);
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
      if (!this.menuVisible) {
        this.setPosition();
      }
      this.menuVisible = !this.menuVisible;
    },
    setPosition() {
      const button = this.$el.firstElementChild;
      const buttonBoundRect = button.getBoundingClientRect();

      this.top = button.offsetHeight + pageYOffset + buttonBoundRect.top;
      this.left = buttonBoundRect.left + pageXOffset;

      const availableSizeData = utils.calcOffset(
        button.offsetWidth,
        300,
        document.body,
        this.top,
        this.left
      );

      if (availableSizeData.topOffset < 0) {
        availableSizeData.topOffset -= button.offsetHeight;
      }

      this.top += availableSizeData.topOffset;
    },
    onEsc() {
      this.menuVisible = false;
    },
    mouseListener(evt) {
      if (!$(evt.target).closest('.select-menu, .select-menu__menu').length) {
        this.menuVisible = false;
      }
    }
  }
};
</script>

<style lang="scss">
@import './common/base';

.select-menu {
  width: 100%;
  outline: none;

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
  position: absolute;
  left: 0;
  top: 0;
  background-color: $primary-color;
  max-height: 300px;
  overflow: auto;
  z-index: 9999;
  border: 1px solid $dark-grey;
  box-shadow: 0 8px 13px $shadow-color;

  ul,
  li {
    margin: 0;
    padding: 0;
    list-style-type: none;
    outline: none;
  }

  li {
    color: white;
    padding: 3px 8px;
    user-select: none;
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
