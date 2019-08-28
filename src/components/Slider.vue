<template>
  <label
    class="range-slider flex flex--row flex--align-center"
    :class="{ 'slider--disabled': disable }"
    :tabindex="tabindex"
    @keydown.enter="onEnter"
  >
    <input
      type="checkbox"
      v-model="activeState"
      @change="$emit('change', activeState)"
      :disabled="disable"
    />
    <span class="slider__inner flex flex--column"></span>
    <span class="slider__label flex flex--column">{{ cleanLabel }}</span>
  </label>
</template>

<script>
export default {
  props: {
    active: Boolean,
    label: String,
    disable: Boolean,
    tabindex: {
      type: Number,
      default: 0
    }
  },
  data: () => ({
    activeState: false,
    cleanLabel: ''
  }),
  beforeMount() {
    this.activeState = this.active;
  },
  mounted() {
    // retrieve possible access key
    let accesskey = /_(\w)/.exec(this.label);
    this.cleanLabel = this.label.replace(/_/g, '');
    if (accesskey && accesskey[1]) {
      this.$el.accessKey = accesskey[1];
    }
  },
  methods: {
    onEnter() {
      this.activeState = !this.activeState;
      this.$emit('change', this.activeState);
    }
  }
};
</script>

<style lang="scss" scoped>
@import './common/base';

.range-slider {
  cursor: pointer;
  @include no-selection;

  &:focus {
    outline: none;

    .slider__label {
      color: $primary-color;
      outline: 1px dotted $primary-color;
    }
  }

  input[type='checkbox'] {
    display: none;
    &:checked + .slider__inner {
      background: $primary-color;

      &:after {
        left: 11px;
      }
    }
  }

  &.slider--disabled {
    cursor: not-allowed;

    .slider__label {
      color: lighten($dark-grey, 40%);
    }

    .slider__inner {
      background: #adadad !important;
    }
  }

  .slider__inner {
    position: relative;
    background: rgba(0, 0, 0, 0.1);
    display: inline-block;
    vertical-align: middle;
    border-radius: 14px;
    width: 24px;
    height: 14px;
    margin-right: 5px;
    transition: all 0.15s;

    &:after {
      content: '';
      border-radius: 12px;
      position: absolute;
      top: 1px;
      left: 1px;
      width: 12px;
      height: 12px;
      background: #fff;
      display: inline-block;
      transition: left 0.15s;
      @include box-shadow(0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 0 1px 0 rgba(0, 0, 0, 0.21));
    }
  }

  .slider__label {
    color: $dark-grey;
    vertical-align: middle;
  }
}
</style>
