import $ from 'jquery';
import editorUtilsSvc from '../editorUtilsSvc';
import { CODING_SELECTOR } from '../../config/constants';

export default {
  _listener(evt) {
    const $target = $(evt.target);
    let $coding;
    if ($target.is(CODING_SELECTOR)) {
      $coding = $target;
    } else {
      $coding = $target.closest(CODING_SELECTOR);
    }

    if ($coding.length) {
      editorUtilsSvc.$trigger('openEditorWith', $coding);
      evt.preventDefault();
    }
  },
  start() {
    document.addEventListener('dblclick', this._listener);
  },
  stop() {
    document.removeEventListener('dblclick', this._listener);
  }
};
