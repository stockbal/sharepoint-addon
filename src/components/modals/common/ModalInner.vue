<template>
  <div class="modal__inner-1" role="dialog">
    <div class="modal__inner-2">
      <div class="modal__title flex flex--row flex--align-center">
        <div class="modal__title-icon">
          <slot name="title-icon"></slot>
        </div>
        <slot name="title"></slot>
      </div>
      <button class="modal__close-button button not-tabbable" @click="config.reject()" title="Close modal">
        <icon icon="times" />
      </button>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters('modal', ['config'])
  }
};
</script>

<style lang="scss">
@import '../../common/base';

.modal__title {
  background: $primary-color;
  height: 60px;
  user-select: none;
  border-radius: 5px 5px 0 0;
  margin: -40px -50px 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  border-bottom: 0.5px solid white;

  h1,
  h2,
  h3,
  h4 {
    margin: 0 0 0 20px;
    font-weight: bold;
    color: opacify(white, 0.5);
  }

  h2 {
    font-size: 1.5 * $font-size-base;
  }
}

.modal__title-icon {
  text-align: center;
  color: opacify(white, 0.5);
  svg {
    margin: 0 0 0 20px;
  }
}

.modal__inner-1 {
  margin: 0 auto;
  width: 100%;
  min-width: 320px;
  max-width: 480px;
  transition: 0.3s ease all;
}

.modal__inner-2 {
  margin: 40px 10px 100px;
  background-color: #f8f8f8;
  padding: 40px 50px 30px;
  border-radius: 5px;
  position: relative;
  overflow: hidden;
}

.modal__close-button {
  position: absolute;
  top: 14px;
  right: 8px;
  color: opacify(white, 0.5);
  width: 30px;
  height: 30px;
  padding: 2px;

  &:active,
  &:focus,
  &:hover {
    color: white;
  }
}
</style>
