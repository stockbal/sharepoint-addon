/* eslint-disable no-unused-vars */
import $ from 'jquery';
import Logger from 'js-logger';
import store from '../../store';
import editorUtilsSvc from '../editorUtilsSvc';
import config from '../../config';
import { CODING_SELECTOR, ZERO_WIDTH } from '../../config/constants';
import browser from '../browser';

const logger = Logger.get('ContextMenuListener');

const command = id => () => {
  document.execCommand(id);
};

const isKeyBoardEvent = evt => {
  if (browser.isIE() || browser.isEdge()) {
    return evt.pointerType === '';
  } else if (browser.isFirefox()) {
    return evt.button === 0;
  } else if (browser.isChrome()) {
    return evt.button === 0;
  } else {
    return false;
  }
};

const createItem = (name, icon, cb) => ({
  type: 'item',
  name,
  icon,
  perform: cb
});

const createActionItem = (icon, tooltip, cb, space = 0) => ({
  type: 'action',
  icon,
  tooltip,
  space,
  perform: cb
});

const separator = { type: 'separator' };

class MenuItemCreator {
  /**
   * Creates the context actions for clipboard
   * interaction
   * @private
   */
  _createClipBoardActions($codingElement) {
    let actions = [];

    if ($codingElement) {
      const copyCoding = () => {
        store.commit('setClipboardData', { content: $codingElement[0], type: 'code' });
      };
      actions.push(
        createItem('Cut', 'cut', () => {
          copyCoding();
          $codingElement.remove();
        })
      );
      actions.push(
        createItem('Copy', 'copy', () => {
          copyCoding();
        })
      );
    } else {
      const copyContent = (extract = false) => () => {
        const selectionData = store.state.selectionData;
        const range = selectionData.range;
        const content = range.cloneContents();

        if (extract) {
          range.deleteContents();
        }

        store.commit('setClipboardData', { content, type: 'content' });
      };

      if (store.getters.hasSelection(true)) {
        actions.push(createItem('Cut', 'cut', copyContent(true)));
        actions.push(createItem('Copy', 'copy', copyContent()));
      }
      if (store.getters.hasClipboardData) {
        actions.push(
          createItem('Paste', 'paste', () => {
            editorUtilsSvc.$trigger('paste');
          })
        );
      }
    }

    if (actions.length > 0) {
      actions.push(separator);
    }

    return actions;
  }

  /**
   * Creates the menu items for a coding
   * block
   * @param $coding
   * @returns {*[]}
   */
  createItemsForCoding($coding) {
    return [
      ...this._createClipBoardActions($coding),
      createItem('Edit', 'edit', async () => editorUtilsSvc.$trigger('openEditorWith', $coding)),
      createItem('Convert to Text', '', () => editorUtilsSvc.$trigger('convertToText', $coding)),
      createItem('Delete', 'trash', () => $coding.remove()),
      separator,
      {
        type: 'item',
        name: 'Insert',
        items: [
          createItem('Paragraph before', '', () => {
            $coding.before(`<p>${ZERO_WIDTH}</p>`);
          }),
          createItem('Paragraph after', '', () => {
            $coding.after(`<p>${ZERO_WIDTH}</p>`);
          })
        ]
      }
    ];
  }

  /**
   * Creates the menu items for normal text content
   * in the editor
   * @returns {*[]}
   */
  createItemsForNormalContent() {
    let clipBoardActions = this._createClipBoardActions();
    if (clipBoardActions.length) {
      clipBoardActions = [separator, ...clipBoardActions];
    } else {
      clipBoardActions.push(separator);
    }

    const items = [
      {
        type: 'actions',
        actions: [
          createActionItem('bold', 'Make Selection bold', command('bold')),
          createActionItem('italic', 'Make Selection Italic', command('italic')),
          createActionItem('underline', 'Underline text', command('underline')),
          createActionItem('strikethrough', 'Strike through text', command('strikethrough')),
          createActionItem('eraser', 'Remove all formats', command('removeFormat'), 3)
        ]
      },
      {
        type: 'actions',
        actions: [
          createActionItem('indent', 'Indent selection', command('indent')),
          createActionItem('outdent', 'Outdent selection', command('outdent')),
          createActionItem('list-ol', 'Insert ordered list', command('insertOrderedList'), 3),
          createActionItem('list-ul', 'Insert unordered list', command('insertUnorderedList'))
        ]
      },
      ...clipBoardActions
    ];

    items.push({
      type: 'item',
      icon: 'font',
      name: 'Special Formatting',
      items: [
        createItem('Remove background color', '', () =>
          editorUtilsSvc.$trigger('removeFormatting', 'background')
        ),
        createItem('Remove foreground color', '', () =>
          editorUtilsSvc.$trigger('removeFormatting', 'foreground')
        ),
        createItem('Reset font size', '', () =>
          editorUtilsSvc.$trigger('removeFormatting', 'fontsize')
        ),
        separator,
        createItem('Remove all text formatting', 'trash', () =>
          editorUtilsSvc.$trigger('removeFormatting', 'all')
        )
      ]
    });

    items.push(separator);

    items.push(
      createItem('Create Blockquote', 'quote-right', () => editorUtilsSvc.$trigger('blockquote'))
    );
    items.push({
      type: 'item',
      name: 'Create alert',
      icon: 'info-circle',
      perform: () => editorUtilsSvc.$trigger('alert', 'info'),
      items: [
        createItem('Success', 'check-circle', () => editorUtilsSvc.$trigger('alert', 'success')),
        createItem('Warning', 'exclamation-triangle', () =>
          editorUtilsSvc.$trigger('alert', 'warning')
        ),
        createItem('Danger', 'exclamation-circle', () => editorUtilsSvc.$trigger('alert', 'danger'))
      ]
    });

    if (!store.state.settings.codeEditorDisabled) {
      items.push(separator);
      items.push(
        createItem('Create Block Coding', 'code', () => editorUtilsSvc.$trigger('createCode'))
      );
      if (store.getters.hasSelection(true)) {
        items.push(
          createItem('Create Inline Coding', 'terminal', () =>
            editorUtilsSvc.$trigger('createInlineCode')
          )
        );
      }
    }

    return items;
  }
}

const menuItemCreator = new MenuItemCreator();

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

    const { $target, coordinates } = getContextMenuEventTargetData(evt);

    let $coding = $target;
    if (!$target.is(CODING_SELECTOR)) {
      $coding = $target.closest(CODING_SELECTOR);
    }
    if ($coding.length && !store.state.settings.codeEditorDisabled) {
      evt.preventDefault();

      try {
        (await store.dispatch('contextMenu/open', {
          coordinates,
          items: menuItemCreator.createItemsForCoding($coding)
        })).perform();
      } catch (e) {
        logger.error(e);
      }
    } else {
      // check if right mouse click was fired inside editor
      evt.preventDefault();
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
