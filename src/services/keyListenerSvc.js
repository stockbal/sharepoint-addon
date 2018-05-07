import Logger from 'js-logger';

const keyListener = evt => {
  keyListenerSvc.keyListener(evt);
};

const keyListenerSvc = {
  _logger: Logger.get('KeyService'),
  _keyStrokes: {},
  _listeningStarted: false,

  /**
   * Key listener for keyboard events
   *
   * @param {object} e
   *              keyboard event
   */
  keyListener(e) {
    // get the correct handler for the key stroke
    let keyStrokeId = this._buildKeyStrokeId(e.which || e.keyCode, {
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey
    });

    let keyHandler = this._keyStrokes[keyStrokeId];
    if (keyHandler && keyHandler.cb) {
      keyHandler.cb(e);
    }
  },
  /**
   * Builds a unique string id for a key
   * with an optional options object
   *
   * @param {Integer} keyCode
   *          the key
   * @param {object} [options]
   *          an optional object with key modifiers
   * @returns {string}
   *          a unique string identifying this key stroke
   */
  _buildKeyStrokeId(keyCode, options) {
    let keyStrokeId = `${keyCode}`;
    if (options && typeof options === 'object') {
      if (options.ctrl !== 'undefined' && options.ctrl) {
        keyStrokeId += '^';
      }
      if (options.shift !== 'undefined' && options.shift) {
        keyStrokeId += '+';
      }
      if (options.alt !== 'undefined' && options.alt) {
        keyStrokeId += '!';
      }
    }
    return keyStrokeId;
  },
  /**
   * Adds handler function for a specific key combination
   *
   * @param  {Integer} keyCode
   *              the key code to be registered
   * @param  {object} [options]
   *              optional map of options to be used
   * @param  {boolean} [options.shift]
   *              shift is to be considered during key press
   * @param  {boolean} [options.alt]
   *              shift is to be considered during key press
   * @param  {boolean} [options.ctrl]
   *              shift is to be considered during key press
   * @param  {boolean} [options.preventDefault]
   *              should the default action be prevented
   * @param  {function} handler
   *              handler if key stroke was recognized
   */
  addKeyListener(keyCode, options, handler) {
    // validate the passed options
    if (!handler) {
      this._logger.error("No handler function was passed to 'addKeyListener'");
      return;
    }

    let keyStrokeId = this._buildKeyStrokeId(keyCode, options);

    if (this._keyStrokes[keyStrokeId]) {
      this._logger.error('Key ' + keyCode + ' already registered');
      return;
    }

    // register the handler
    this._keyStrokes[keyStrokeId] = { cb: handler, options };
  },

  /**
   * Removes handler for a specific key stroke
   *
   * @param  {Integer} keyCode
   *              the key code to be registered
   * @param  {object} [options]
   *              optional map of options to be used
   * @param  {boolean} [options.shift]
   *              shift is to be considered during key press
   * @param  {boolean} [options.alt]
   *              shift is to be considered during key press
   * @param  {boolean} [options.ctrl]
   *              shift is to be considered during key press
   */
  removeKeyListener(keyCode, options) {
    let keyStrokeId = this._buildKeyStrokeId(keyCode, options);
    delete this._keyStrokes[keyStrokeId];
  },

  /**
   * Removes all registered key listeners
   */
  removeAllListeners() {
    this._keyStrokes = {};
  },

  startListening() {
    if (this._listeningStarted) {
      return;
    }
    document.addEventListener('keydown', keyListener);

    this._listeningStarted = true;
  },

  stopListening() {
    if (this._listeningStarted) {
      document.removeEventListener('keydown', keyListener);
      this._listeningStarted = false;
    }
  }
};

export default keyListenerSvc;
