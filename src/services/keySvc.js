export default {
  /**
   * Triggers a KeyEvent for the given key (as char) and
   * meta keys
   * @param key
   * @param alt
   * @param shift
   * @param ctrl
   */
  triggerKeyEvent(key, { shift = false, alt = false, ctrl = false }) {
    var e = new Event('keydown');
    e.key = key; // just enter the char you want to send
    e.keyCode = e.key.charCodeAt(0);
    e.which = e.keyCode;
    e.altKey = alt;
    e.ctrlKey = ctrl;
    e.shiftKey = shift;
    e.metaKey = false;
  }
};
