/* eslint-disable no-undef */
export default {
  // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
  isOpera: () => window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,
  // Firefox 1.0+
  isFirefox: () => typeof InstallTrigger !== 'undefined',
  // Safari 3.0+
  isSafari: () =>
    /constructor/i.test(window.HTMLElement) ||
    (p => p.toString() === '[object SafariRemoteNotification]')(
      !window['safari'] || safari.pushNotification
    ),
  // Internet Explorer 6-11
  isIE: () => /* @cc_on!@ */ !!document.documentMode,
  // Edge 20+
  isEdge: () => !this.isIE && !!window.StyleMedia,
  // Chrome 1+
  isChrome: () => /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
  // Blink engine detection
  isBlink: () => (this.isChrome || this.isOpera) && !!window.CSS
};
