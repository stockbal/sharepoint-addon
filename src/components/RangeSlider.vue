<template>
  <div class="range-slider flex flex--row flex--align-center">
    <button class="button" @click="decrease">
      <icon icon="minus"></icon>
    </button>
    <span class="range-slider__value">{{ internalValue }}</span>
    <button class="button" @click="increase">
      <icon icon="plus"></icon>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    value: Number,
    min: Number,
    max: Number
  },
  data: () => ({
    internalValue: 1
  }),
  beforeMount() {
    this.internalValue = this.value;
  },
  methods: {
    updateValue() {
      this.$emit('change', this.internalValue);
    },
    decrease() {
      if (this.internalValue > 1) {
        this.internalValue--;
        this.updateValue();
      }
    },
    increase() {
      if (this.internalValue < 10) {
        this.internalValue++;
        this.updateValue();
      }
    }
  }
};
</script>

<style scoped lang="scss">
@import './common/variables';
button {
  margin: 0;
}
.range-slider {
  background: white;

  .button {
    line-height: 1.2;
  }
}
.range-slider__value {
  flex: 1;
  margin: 0 50px;
  text-align: center;
  font-size: 14px;
}
</style>
