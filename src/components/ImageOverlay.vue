<template>
  <div class="overlay-image">
    <div class="overlay-image__inner flex flex--align-center">
      <img :height="imgHeight" :src="imgSrc" :alt="alt"
           :style="{'max-height': maxHeight, 'max-width': maxWidth}"
           />
    </div>
    <div class="overlay-image__top-area flex flex--row flex--align-center">
      <span class="overlay-image__title">{{alt}}</span>
      <button class="button overlay-image__zoom-button" @click="toggleZoom" :title="zoomedIn ? 'Zoom out' : 'Zoom in'">
        <icon :icon="zoomedIn ? 'search-minus' : 'search-plus'" fixed-width size="lg"></icon>
      </button>
      <button class="button overlay-image__close-button" @click="dispose">Close</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import keystrokes from '../services/keystrokes';
import utils from '../services/utils';

export default {
  name: 'ImageOverlay',
  data: () => ({
    zoomedIn: true,
    maxHeight: '',
    maxWidth: ''
  }),
  computed: {
    ...mapState('imagePreview', {
      imgSrc: 'source',
      alt: 'description',
      imgWidth: 'width',
      imgHeight: 'height',
      imgSizeRatio: 'sizeRatio'
    })
  },
  methods: {
    toggleZoom() {
      this.zoomedIn = !this.zoomedIn;
      this.calcSize();
    },
    calcSize() {
      const maxHeight = this.zoomedIn ? 0 : document.body.scrollHeight - 170;
      this.maxHeight = maxHeight > 0 ? maxHeight + 'px' : '';
      this.maxWidth = maxHeight > 0 ? maxHeight * this.imgSizeRatio + 'px' : '';
    },
    dispose() {
      this.$store.dispatch('imagePreview/close');
    },
    keyListener(evt) {
      if (evt.keyCode === keystrokes.Escape) {
        evt.preventDefault();
        this.dispose();
      }
    }
  },
  created() {
    this.calcSize();
  },
  mounted() {
    document.addEventListener('keydown', this.keyListener);
    window.addEventListener('resize', this.calcSize);
    utils.dragscroll(this.$el, this.$el.querySelector('img'), 1.5);
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.keyListener);
    window.removeEventListener('resize', this.calcSize);
  }
};
</script>

<style lang="scss">
@import './common/base';

.overlay-image {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  overflow: auto;
  padding: 40px;
  z-index: 10000000;

  img {
    margin: auto;
    cursor: pointer;
  }
}

.overlay-image__inner {
  margin-top: 50px;
}

.overlay-image__title {
  margin: 0 auto;
  color: white;
  padding: 20px;
  font-size: 18px;
}

.overlay-image__top-area {
  position: fixed;
  z-index: 3000;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background: rgba(0, 0, 0, 0.4);
}

.overlay-image__zoom-button,
.overlay-image__close-button {
  &,
  &:active,
  &:focus {
    position: fixed;
    background: #464646;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    cursor: pointer;
    top: 10px;
  }

  &:hover {
    box-shadow: 0px 0px 7px white;
    background: black;
    color: white;
  }
}

.overlay-image__zoom-button {
  right: 120px;
}

.overlay-image__close-button {
  right: 30px;
}
</style>
