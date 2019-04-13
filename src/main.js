// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import 'babel-polyfill';
import './libs';
import App from './components/App';
import store from './store';
import './services/fontSvc';
import config from './config';
import $ from 'jquery';

Vue.config.productionTip = false;

/* eslint-disable no-new */
$(document).ready(() => {
  new Vue({
    el: '#wiki-addons',
    store,
    render: h => h(App),
    mounted() {
      // inject fontawesome icons into page
      const fontAwesome = document.createElement('link');
      fontAwesome.rel = 'stylesheet';
      fontAwesome.href = 'https://use.fontawesome.com/releases/v5.7.2/css/all.css';
      fontAwesome.integrity =
        'sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr';
      fontAwesome.crossOrigin = 'anonymous';
      document.head.appendChild(fontAwesome);
      /* move element to bottom of body to prevent
       * unwanted submit actions fired in the pages' form element */
      document.body.appendChild(this.$el);
      document
        .getElementById(config.elements.workspaceElementId)
        .classList.add(config.cssClasses.workspaceAddonsLoadedClass);
    }
  });
});
