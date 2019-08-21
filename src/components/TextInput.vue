<template>
  <input
    class="text"
    slot="field"
    v-model="internalValue"
    @change="$emit('change', internalValue)"
  />
</template>

<script>
export default {
  props: {
    value: String
  },
  data: () => ({
    internalValue: ''
  }),
  beforeMount() {
    this.internalValue = this.value;
  }
};
</script>

<style scoped type="scss">
.text {
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
</style>
