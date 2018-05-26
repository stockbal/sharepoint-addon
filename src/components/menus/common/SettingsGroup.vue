<template>
  <div class="settings-group">
    <a class="settings-group__link button flex flex--row flex--align-center" @click="opened = !opened">
      <div class="settings-group__icon flex flex--column flex--center">
        <icon :icon="icon" fixed-width />
      </div>
      <div class="settings-group__text flex flex--column">
        <div>{{title}}</div>
        <span>{{subtitle}}</span>
      </div>
    </a>
    <div class="settings-group__items" v-if="opened">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import faAngleDown from '@fortawesome/fontawesome-free-solid/faAngleDown';
import faAngleRight from '@fortawesome/fontawesome-free-solid/faAngleRight';

export default {
  props: ['title', 'subtitle'],
  data: () => ({
    opened: true
  }),
  computed: {
    icon() {
      return this.opened ? faAngleDown : faAngleRight;
    }
  }
};
</script>

<style lang="scss">
@import '../../common/base';

$background: darken($light-gray, 5%);
$foreground: $dark-grey;

.settings-group__link {
  text-align: left;
  padding: 10px;
  height: auto;
  font-size: 17px;
  line-height: 1.5;
  text-transform: none;
  white-space: normal;
  color: $foreground;
  background: $background;

  &:focus,
  &:active,
  &:visited,
  &:hover {
    color: $foreground;
    background: $background;
  }

  &:hover {
    background: darken($background, 5%);
  }

  div div {
    text-decoration: underline;
    color: $foreground;
  }

  span {
    display: inline-block;
    font-size: 11px;
    opacity: 0.8;
    color: $foreground;

    span {
      display: inline;
      opacity: 1;
    }
  }
}

.settings-group__icon {
  height: 20px;
  width: 20px;
  margin-right: 12px;
  color: $foreground;
  flex: none;
}

.settings-group__icon--disabled {
  opacity: 0.5;
}

.settings-group__icon--image {
  border-radius: $border-radius-base;
  overflow: hidden;
}

.settings-group__text {
  width: 100%;
  overflow: hidden;
}

.settings-group__items {
  padding: 5px 10px;
  font-size: 13.6px;

  > * {
    margin: 5px 0;
  }
}
</style>
