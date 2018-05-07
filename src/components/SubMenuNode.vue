<template>
  <div class="menu-node__children menu-list" :style="{left: left + 'px', top: top + 'px'}">
    <menu-node v-for="(subitem, idx2) in item.items" :key="idx2" :item="subitem"/>
  </div>
</template>

<script>
export default {
  name: 'SubMenuNode',
  props: {
    item: Object,
    spaceToBottom: {
      type: Number,
      default: 0
    }
  },
  data: () => ({
    topOffset: 0,
    leftOffset: 0
  }),
  mounted() {
    const top = this.$el.parentElement.offsetTop;
    const height = this.$el.parentElement.offsetHeight;
    this.leftOffset = this.$el.parentElement.offsetWidth;

    let menuHeight = this.$el.offsetHeight;
    let spaceForMenu = this.spaceToBottom - menuHeight;

    if (spaceForMenu < 0) {
      this.topOffset = top - menuHeight + height;
    } else {
      this.topOffset = top;
    }
  },
  computed: {
    left() {
      return this.leftOffset;
    },
    top() {
      return this.topOffset;
    }
  }
};
</script>

<style scoped>

</style>
