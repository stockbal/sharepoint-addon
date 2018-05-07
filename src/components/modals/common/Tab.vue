<template>
  <div class="tabs__tab flex flex--row" :class="{'tabs__tab--active': active}" role="tab">
    <a class="flex flex--column flex--center" @click="$emit('click')">
      <slot></slot>
    </a>
  </div>
</template>

<script>
export default {
  props: ['active']
};
</script>
