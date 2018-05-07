import Logger from 'js-logger';
import _ from 'lodash';

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
  }
};
