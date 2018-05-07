import config from '../config';
import $ from 'jquery';
import store from '../store';
import Logger from 'js-logger';
import _ from 'lodash';

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
    .map(value => `[class*="${config.elements.sharePointEditorAreaRead}"] > ${value}`)
    .join(',');

  $(selectors).each((i, heading) => {
    const $heading = $(heading);

    if ($heading.parents(`.${config.elements.webPartContainerClass}`).length) {
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
        closureTable.push(new FlatNode(nodeId++, headingLevel, newHeadingId, headingText));
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
