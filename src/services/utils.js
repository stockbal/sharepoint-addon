import Logger from 'js-logger';
import _ from 'lodash';
import $ from 'jquery';

// For utils.uid()
const uidLength = 16;
const crypto = window.crypto || window.msCrypto;
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const radix = alphabet.length;
const array = new Uint32Array(uidLength);

const logger = Logger.get('Service utils');

export default {
  localStorageDataIds: ['settings'], //, 'layoutSettings'],
  uid() {
    if (crypto) {
      crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < uidLength; i++) {
        array[i] = this.randomize(1000000000);
      }
    }
    return _.map(array, value => alphabet[value % radix]).join('');
  },
  escapeXML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\s/g, '&nbsp;');
  },
  createTabElement(size = 4) {
    const tab = document.createElement('span');
    tab.classList.add('tab');
    tab.innerHTML = '&nbsp;'.repeat(size);
    return tab;
  },
  randomize(value) {
    return Math.floor((1 + Math.random() * 0.2) * value);
  },
  setInterval(func, interval) {
    return setInterval(() => func(), this.randomize(interval));
  },
  /**
   * Enables passed object to trigger and receive events
   *
   * @param object {object}
   *            the object for which the event handling should
   *            be activated
   */
  createEventHooks: object => {
    const listenerMap = new Map();

    object.$trigger = (eventType, ...args) => {
      const listeners = listenerMap.get(eventType);
      if (listeners) {
        for (let listener of listeners) {
          try {
            listener.apply(object, args);
          } catch (e) {
            logger.error(e.message, e.stack);
          }
        }
      }
    };

    object.on = (eventType, listener) => {
      let listeners = listenerMap.get(eventType);
      if (!listeners) {
        listeners = [];
        listenerMap.set(eventType, listeners);
      }
      listeners.push(listener);
    };

    object.off = (eventType, listener) => {
      const listeners = listenerMap.get(eventType);
      if (listeners) {
        let index = listeners.indexOf(listener);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    };

    object.allOff = eventType => {};
  },
  /**
   *
   * @param $element
   * @param pattern
   * @returns {string}
   */
  queryClassByPattern($element, pattern) {
    let found = '';
    const classes = $element.attr('class');
    if (classes) {
      const matchResult = pattern.exec(classes);
      if (matchResult && matchResult.length > 0) {
        found = matchResult[1];
      }
    }
    return found;
  },
  includeProperties(target, source) {
    if (!source) {
      return target;
    }
    const sourceType = Object.prototype.toString.call(source);

    if (sourceType !== '[object Object]') {
      return source;
    }
    Object.keys(source).forEach(key => {
      if (!target.hasOwnProperty(key)) {
        target[key] = source[key];
      } else {
        target[key] = this.includeProperties(target[key], source[key]);
      }
    });
    return target;
  },
  calcOffset(width = 0, height = 0, container, top, left) {
    const sizeData = { topOffset: 0, spaceToBottom: 0, leftOffset: 0, spaceToRight: 0 };

    // calculate top offset
    let spaceForElement = container.offsetHeight - (top + height);

    if (height) {
      if (spaceForElement < 0) {
        sizeData.topOffset = height * -1;
        sizeData.spaceToBottom = container.offsetHeight - top;
      } else {
        sizeData.spaceToBottom = container.offsetHeight - top - height;
      }
    }

    // calculate right offset
    if (width) {
      spaceForElement = container.offsetWidth - (left + width);

      if (spaceForElement < 0) {
        sizeData.leftOffset = width * -1;
        sizeData.spaceToRight = container.offsetWidth - left;
      } else {
        sizeData.spaceToRight = container.offsetWidth - left - width;
      }
    }

    return sizeData;
  },
  calcOffsetForElement(element, container, top, left = 0) {
    return this.calcOffset(element.offsetWidth, element.offsetHeight, container, top, left);
  },
  overrideProperties(target, source) {
    if (!source) {
      return target;
    }
    const targetType = Object.prototype.toString.call(target);
    if (targetType !== '[object Object]') {
      return source;
    }
    Object.keys(target).forEach(key => {
      if (source.hasOwnProperty(key)) {
        target[key] = this.overrideProperties(target[key], source[key]);
      }
    });
    return target;
  },
  /**
   * Enables scrolling of an element in the given container
   * via mouse dragging
   *
   * @param container
   * @param draggableEl
   * @param scrollFactor
   */
  dragscroll(container, draggableEl, scrollFactor = 1) {
    const $container = $(container);
    const $draggableEl = $(draggableEl);

    let clicked = false;
    let clickY;
    let clickX;
    let left;
    let top;

    const updateScrollPos = (e, $el) => {
      $draggableEl.css('cursor', 'move');

      $el.scrollTop(top + (clickY - e.clientY) * scrollFactor);
      $el.scrollLeft(left + (clickX - e.clientX) * scrollFactor);
    };

    $draggableEl.on({
      mousemove: function(e) {
        clicked && updateScrollPos(e, $container);
      },
      mousedown: function(e) {
        e.preventDefault();
        clicked = true;
        clickY = e.clientY;
        clickX = e.clientX;
        left = $container.scrollLeft();
        top = $container.scrollTop();
      },
      mouseup: function() {
        clicked = false;
        $(draggableEl).css('cursor', 'pointer');
      }
    });
  }
};
