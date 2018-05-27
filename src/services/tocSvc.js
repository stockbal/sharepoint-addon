import config from '../config';
import $ from 'jquery';
import store from '../store';
import Logger from 'js-logger';
import _ from 'lodash';
import eventProxy from '../util/eventProxy';

const logger = Logger.get('Toc Service'); // eslint-disable-line no-unused-vars

class FlatNode {
  constructor(id, depth = 1, headingId = '', name = '-Missing-', parentId = 0) {
    this.id = id;
    this.headingId = headingId;
    this.name = name;
    this.parentId = parentId;
    this.depth = depth;
    this.hasChildren = false;
  }
}

const getParentNode = (closureTable, currentLevel, lastLevel) => {
  let parentId = 0;
  if (currentLevel >= lastLevel) {
    let lastNode = closureTable[closureTable.length - 1];
    if (lastNode) {
      parentId =
        lastLevel === currentLevel || lastLevel > currentLevel ? lastNode.parentId : lastNode.id;
    }
  } else {
    let lastNodeWithSameDepth = _.findLast(closureTable, node => node.depth === currentLevel - 1);
    if (lastNodeWithSameDepth) {
      parentId = lastNodeWithSameDepth.parentId;
    }
  }
  return parentId;
};

const buildTocClosureTable = () => {
  const closureTable = [];
  let lastHeadingLevel = 0;
  let nodeId = 1;

  const selectors = 'h1 h2 h3 h4'
    .split(' ')
    .map(value => `[class*="${config.elements.sharePointEditorAreaRead}"] ${value}`)
    .join(',');

  $(selectors).each((i, heading) => {
    const $heading = $(heading);

    if ($heading.closest(`.${config.elements.webPartContainerClass}`).length) {
      return;
    }

    // check if heading resides inside table
    const $possibleTableParent = $heading.closest('table');
    if ($possibleTableParent.length && !$possibleTableParent.attr('id')) {
      return;
    }

    const headingText = $heading.text().trim();
    if (headingText === '') {
      return; // empty headings will be ignored
    }

    const headingLevel = parseInt(/H(\d)/.exec(heading.tagName)[1]);
    const depth = headingLevel - 1;

    // build heading id for heading tag
    let newHeadingId = headingText.replace(/[^\w]/g, '_');
    newHeadingId = encodeURIComponent(newHeadingId);

    $(heading).attr('id', newHeadingId);

    /* create anchor element inside heading element only if wiki page
     * resides in read-only mode
     */
    if (store.state.editMode) {
      $(heading).text(headingText);
    } else {
      // update heading element with new anchor tag
      const anchor = document.createElement('a');
      anchor.classList.add('heading-anchor');
      anchor.innerHTML =
        '<svg class="header-anchor" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>';
      anchor.onclick = () => {
        eventProxy.$trigger('navigateToHeading', `#${newHeadingId}`);
      };

      $(heading)
        .html(anchor)
        .append(document.createTextNode(headingText));
    }

    // create a new node for the current heading
    if (headingLevel === 1) {
      // create a new top node for this heading
      closureTable.push(new FlatNode(nodeId++, depth, newHeadingId, headingText));
    } else {
      let parentId = getParentNode(closureTable, headingLevel, lastHeadingLevel);

      if (parentId) {
        closureTable.push(new FlatNode(nodeId++, depth, newHeadingId, headingText, parentId));
        // set flag to signal parent is folder
        closureTable[parentId - 1].hasChildren = true;
      } else {
        // no node was inserted yet
        closureTable.push(new FlatNode(nodeId++, depth, newHeadingId, headingText));
      }
    }

    lastHeadingLevel = headingLevel;
  });

  return closureTable;
};

export default {
  /**
   * Updates the root node in the table of contents
   * store
   */
  synchronizeTableOfContents() {
    Promise.resolve()
      .then(() => {
        store.dispatch('toc/updateClosureTable', buildTocClosureTable());
      })
      .then(() => {
        // check if toc nodes should be expanded at start of application
        if (!store.state.settings.tocCollapsedInitially) {
          store.dispatch('toc/openAllNodes');
        }
      });
  },
  /**
   * Updates the active element in the table of contents
   */
  updateActiveElement: () => {
    const $workspace = $(`#${config.elements.workspaceElementId}`);
    const top = $workspace.offset().top + 1;

    // get all available toc nodes
    const tocNodes = store.getters['toc/nodeMap'];
    if (!tocNodes) {
      return;
    }
    let activeNodeId = 0;

    for (let [, node] of Object.entries(tocNodes)) {
      let $link = $(`#${node.item.headingId}`);

      /* for some reason the heading for the link no longer
       * exists in the wiki page
       */
      if (!$link.length) {
        continue;
      }

      if ($link.offset().top > top) {
        if (!activeNodeId) {
          activeNodeId = node.id;
        }
        break;
      } else {
        activeNodeId = node.id;
      }
    }
    if (activeNodeId) {
      store.dispatch('toc/updateActiveNode', activeNodeId);
    }
  },
  /**
   * Starts the event listener for the workspace scroll event
   * to update the active toc element
   */
  startScrollListener() {
    $(`#${config.elements.workspaceElementId}`).scroll(this.updateActiveElement);
  }
};
