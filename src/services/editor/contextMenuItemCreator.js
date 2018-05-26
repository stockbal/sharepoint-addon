import store from '../../store/index';
import eventProxy from '../../util/eventProxy';
import { QuickMenuItem, QuickMenuType } from './quickMenuItem';
import prismConfig from '../../config/prismConfig';

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

export class ContextMenuItemCreator {
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
   * Creates the quick menu items for a coding element
   * @param $coding
   * @returns {Array}
   */
  createItemsForCoding($coding) {
    let codingLanguage = $coding[0].getData('language');

    // create quick menu for coding item
    const quickMenuItems = [];

    if ($coding.prop('tagName') === 'DIV') {
      quickMenuItems.push(
        new QuickMenuItem(
          QuickMenuType.Check,
          'Print line numbers',
          $coding[0].getData('line-numbers'),
          newVal => {
            $coding[0].setData('line-numbers', newVal);
          }
        )
      );
    }
    quickMenuItems.push(
      new QuickMenuItem(
        QuickMenuType.Select,
        'Language',
        codingLanguage,
        newVal => {
          if (newVal !== codingLanguage) {
            $coding[0].setData('language', newVal);
            codingLanguage = newVal;
          }
        },
        prismConfig.languages
      )
    );

    return quickMenuItems;
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
        createItem('Reset font size', '', () =>
          eventProxy.$trigger('removeFormatting', 'fontsize')
        ),
        separator,
        createItem('Remove all text formatting', 'trash', () =>
          eventProxy.$trigger('removeFormatting', 'all')
        )
      ]
    });

    items.push(separator);

    items.push(
      createItem('Create Blockquote', 'quote-right', () => eventProxy.$trigger('blockquote'))
    );
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

    items.push(separator);
    items.push(createItem('Create Block Coding', 'code', () => eventProxy.$trigger('createCode')));
    if (store.getters.hasSelection(true)) {
      items.push(
        createItem('Create Inline Coding', 'terminal', () =>
          eventProxy.$trigger('createInlineCode')
        )
      );
    }

    return items;
  }
}
