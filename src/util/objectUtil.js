import Logger from 'js-logger';
import _ from 'lodash';

var logger = Logger.get('ObjectUtil');

export default {
  /**
   * Copies each property value from the source object to the
   * target object
   * @param  {object} target
   *              the target object
   * @param  {object} source
   *              the source object
   * @author Ludwig Stockbauer-Muhr
   */
  assign: function(target, source) {
    if (typeof source !== 'object' && typeof target !== 'object') {
      logger.error('source and target have to be objects');
      return;
    }

    _.each(
      target,
      function(value, key) {
        if (!source.hasOwnProperty(key)) {
          return;
        }

        // if the value is an object start recursion
        if (typeof value === 'object') {
          this.assign(value, source[key]);
        } else {
          target[key] = source[key];
        }
      }.bind(this)
    );
  }
};
