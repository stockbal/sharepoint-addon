import Logger from 'js-logger';
import { MutationObserver } from '../util/MutationObserver';

const logger = Logger.get('Mutation Service');

export default {
  observers: {},
  _createObserver(id, cb) {
    return (this.observers[id] = new MutationObserver(cb));
  },
  disconnectObserver(id) {
    let observer = this.observers[id];
    if (observer) {
      observer.disconnect();
      delete this.observers[id];
    }
  },
  observe(observerId, targetNode, options, cb) {
    if (!targetNode || targetNode === undefined) {
      logger.warn(`no 'targetNode' was supplied for observer ${observerId}`);
      return;
    }

    const observer = this._createObserver(observerId, cb);
    observer.observe(targetNode, options);
  }
};
