/* eslint-disable no-unused-vars */
import $ from 'jquery';
import Logger from 'js-logger';
import store from '../../store/index';
import config from '../../config/index';
import { CODING_SELECTOR } from '../../config/constants';
import browser from '../browser';
import { ContextMenuItemCreator } from './contextMenuItemCreator';
import selectionSvc from '../selectionSvc';

const logger = Logger.get('ContextMenuListener');

const isKeyBoardEvent = evt => {
  if (browser.isIE()) {
    if (evt.pointerType !== undefined) {
      return evt.pointerType === '';
    } else {
      return !evt.button;
    }
  } else if (browser.isEdge()) {
    return evt.pointerType === '';
  } else if (browser.isFirefox()) {
    return evt.button === 0;
  } else if (browser.isChrome()) {
    return evt.button === 0;
  } else {
    return false;
  }
};

const menuItemCreator = new ContextMenuItemCreator();

const getContextMenuEventTargetData = evt => {
  const eventData = {};
  const keyBoardEvent = isKeyBoardEvent(evt);

  if (browser.isChrome() || !keyBoardEvent) {
    eventData.$target = $(evt.target);
    eventData.coordinates = { top: evt.clientY, left: evt.clientX };
  } else {
    // get target by reading the current selection data
    let $containerElement = $(store.state.selectionData.containerElement);
    if ($containerElement.is(`.${config.elements.sharePointEditorArea}`)) {
      $containerElement = $(store.state.selectionData.sel.anchorNode.parentNode);
    }
    eventData.$target = $containerElement;

    // calculate the offset data
    let top = evt.clientY > 0 ? evt.clientY : 0;
    let left = evt.clientX > 0 ? evt.clientX : 0;

    if (!top || !left) {
      let offset = { top: 0, left: 0 };
      offset = $containerElement.offset() || offset;
      top = offset.top + 20;
      left = offset.left + 40;
    }
    eventData.coordinates = { top, left };
  }
  return eventData;
};

/**
 * Context menu listener for <code>coding</code> elements
 */
export default {
  async _listener(evt) {
    if (evt.ctrlKey) {
      return;
    }

    // event was not fired inside editorial area
    if (!$(evt.target).closest(`.${config.elements.sharePointEditorArea}`).length) {
      return;
    }

    evt.preventDefault();
    await store.dispatch('updateSelection', selectionSvc.getSelection());

    const { $target, coordinates } = getContextMenuEventTargetData(evt);

    let $coding = $target;
    if (!$target.is(CODING_SELECTOR)) {
      $coding = $target.closest(CODING_SELECTOR);
    }
    if ($coding.length) {
      try {
        await store.dispatch('quickMenu/open', {
          coordinates,
          items: menuItemCreator.createItemsForCoding($coding),
          title: 'Properties'
        });
      } catch (e) {
        logger.error(e);
      }
    } else {
      // check if right mouse click was fired inside editor
      try {
        (await store.dispatch('contextMenu/open', {
          coordinates,
          items: menuItemCreator.createItemsForNormalContent()
        })).perform();
      } catch (e) {
        logger.error(e);
      }
    }
  },

  /**
   * starts the context menu event listener
   */
  start() {
    document.addEventListener('contextmenu', this._listener);
  },

  /**
   * stops the context menu event listener
   */
  stop() {
    document.removeEventListener('contextmenu', this._listener);
  }
};
