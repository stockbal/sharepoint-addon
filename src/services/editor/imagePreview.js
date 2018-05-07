/* eslint-disable no-unused-vars */
import config from '../../config';
import store from '../../store';
import Logger from 'js-logger';

const logger = Logger.get('imagePreview');

export class ImagePreview {
  static createImgListeners() {
    const images = document.querySelectorAll(`.${config.cssClasses.sharePointReadOnlyClass} img`);

    for (const image of images) {
      image.addEventListener('click', evt => {
        try {
          store.dispatch('imagePreview/open', {
            source: image.src,
            description: image.alt,
            width: image.naturalWidth,
            height: image.naturalHeight
          });
        } catch (e) {
          logger.error(e);
        }
      });
    }
  }
}
