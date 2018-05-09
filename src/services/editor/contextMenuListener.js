/* eslint-disable no-unused-vars */
import $ from 'jquery';
import Logger from 'js-logger';
import store from '../../store';
import config from '../../config';
import { CODING_SELECTOR, ZERO_WIDTH } from '../../config/constants';
import eventProxy from '../../util/eventProxy';

const logger = Logger.get('ContextMenuListener');

const command = id => () => {
  document.execCommand(id);
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
            eventProxy.$trigger('paste');
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
      createItem('Edit', 'edit', async () => eventProxy.$trigger('openEditorWith', $coding)),
      createItem('Convert to Text', '', () => eventProxy.$trigger('convertToText', $coding)),
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
          eventProxy.$trigger('removeFormatting', 'background')
        ),
        createItem('Remove foreground color', '', () =>
          eventProxy.$trigger('removeFormatting', 'foreground')
        ),
        createItem('Remove custom style', '', () =>
          eventProxy.$trigger('removeFormatting', 'style')
        ),
        createItem('Reset font style', '', () => eventProxy.$trigger('removeFormatting', 'font')),
        separator,
        createItem('Remove all text formatting', 'trash', () =>
          eventProxy.$trigger('removeFormatting', 'all')
        )
      ]
    });

    items.push(separator);

    items.push();
    items.push({
      type: 'item',
      name: 'Create alert',
      icon: 'info-circle',
      perform: () => eventProxy.$trigger('alert', 'info'),
      items: [
        createItem('Success', 'check-circle', () => eventProxy.$trigger('alert', 'success')),
        createItem('Warning', 'exclamation-triangle', () =>
          eventProxy.$trigger('alert', 'warning')
        ),
        createItem('Danger', 'exclamation-circle', () => eventProxy.$trigger('alert', 'danger'))
      ]
    });

    if (!store.state.settings.codeEditorDisabled) {
      items.push(separator);
      items.push(
        createItem('Create Block Coding', 'code', () => eventProxy.$trigger('createCode'))
      );
      if (store.getters.hasSelection(true)) {
        items.push(
          createItem('Create Inline Coding', 'terminal', () =>
            eventProxy.$trigger('createInlineCode')
          )
        );
      }
    }

    return items;
  }
}

const menuItemCreator = new MenuItemCreator();

/**
 * Context menu listener for <code>coding</code> elements
 */
export default {
  async _listener(evt) {
    if (evt.ctrlKey) {
      return;
    }

    let $target = $(evt.target);

    let $coding = $target;
    if (!$target.is(CODING_SELECTOR)) {
      $coding = $target.closest(CODING_SELECTOR);
    }
    if ($coding.length && !store.state.settings.codeEditorDisabled) {
      evt.preventDefault();

      try {
        (await store.dispatch('contextMenu/open', {
          coordinates: { left: evt.clientX, top: evt.clientY },
          items: menuItemCreator.createItemsForCoding($coding)
        })).perform();
      } catch (e) {
        logger.error(e);
      }
    } else {
      // check if right mouse click was fired inside editor
      if ($target.closest(`.${config.elements.sharePointEditorArea}`).length) {
        evt.preventDefault();
        let top = evt.clientY > 0 ? evt.clientY : 0;
        let left = evt.clientX > 0 ? evt.clientX : 0;

        if (!top || !left) {
          let offset = { top: 0, left: 0 };
          const selectionData = store.state.selectionData;

          if (selectionData && selectionData.containerElement) {
            let $containerElement = $(selectionData.containerElement);
            if ($containerElement.is(`.${config.elements.sharePointEditorArea}`)) {
              $containerElement = $(selectionData.sel.anchorNode.parentNode);
            }
            const containerOffset = $containerElement.offset();
            offset = containerOffset || offset;
          }
          top = offset.top + 20;
          left = offset.left + 40;
        }
        try {
          (await store.dispatch('contextMenu/open', {
            coordinates: { left, top },
            items: menuItemCreator.createItemsForNormalContent()
          })).perform();
        } catch (e) {
          logger.error(e);
        }
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
