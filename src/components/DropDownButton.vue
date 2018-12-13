<template>
  <a
    class="dropdown-button"
    v-on:mouseenter="showMenu"
    v-on:mouseleave="menuVisible = false"
    :class="{ 'dropdown-button--disabled': disabled }"
  >
    <div class="dropdown-button__title"><slot /></div>
    <div class="dropdown-button__menu" v-if="menuVisible">
      <a
        v-for="(value, key) in items"
        class="dropdown-button__menu-item"
        :key="key"
        @click="chooseItem(key)"
        >{{ value }}</a
      >
    </div>
  </a>
</template>

<script>
export default {
  props: ['items', 'disabled'],
  data: () => ({
    menuVisible: false
  }),
  methods: {
    showMenu() {
      this.menuVisible = !this.disabled;
    },
    chooseItem(itemId) {
      this.$emit('itemChosen', itemId);
      this.menuVisible = false;
    }
  }
};
</script>

<style lang="scss">
@import './common/base';

.dropdown-button {
  position: relative;
  display: inline-block;
  cursor: pointer;
  @include no-selection;

  &:hover {
    .dropdown-button__title {
      background-color: $button-hover-bg;
    }
  }
}

.dropdown-button--disabled {
  .dropdown-button__title {
    &,
    &:hover {
      @include disabled;
    }
  }
}

.dropdown-button__title {
  line-height: initial;
  padding: 10px 12px;
  border: 0;
  color: #333;
}

.dropdown-button__menu {
  background: $primary-color;
  position: fixed;
  z-index: 1080;
  min-width: 160px;
  color: white;
  overflow: auto;
  font-size: 12px;
  max-height: 300px;
  border-radius: 0 0 $border-radius-base $border-radius-base;
  @include box-shadow(2px 2px 5px $shadow-color);
}

.dropdown-button__menu-item {
  display: block;
  padding: 2px 12px;
  color: white;

  &:hover {
    background-color: $darker-primary-color;
  }
}
</style>
