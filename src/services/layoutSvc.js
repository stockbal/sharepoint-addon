import $ from 'jquery';
import config from '../config';
import mutationSvc from './mutationSvc';
import store from '../store';

export default {
  toggleAddonStyleDark(dark) {
    if (dark) {
      document.body.classList.remove(config.cssClasses.addonStyleLight);
      document.body.classList.add(config.cssClasses.addonStyleDark);
    } else {
      document.body.classList.remove(config.cssClasses.addonStyleDark);
      document.body.classList.add(config.cssClasses.addonStyleLight);
    }
  },
  deactivateAddonStyleTheme() {
    document.body.classList.remove(config.cssClasses.addonStyleDark);
    document.body.classList.remove(config.cssClasses.addonStyleLight);
  },
  activateAddonStyle() {
    document.body.classList.add(config.cssClasses.addonStyleGeneric);
    this.toggleAddonStyleDark(store.state.settings.editorCustomStyleDark);
  },
  deactivateAddonStyle() {
    document.body.classList.remove(config.cssClasses.addonStyleGeneric);
    this.deactivateAddonStyleTheme();
  },
  showSideBar() {
    document
      .getElementById(config.elements.workspaceElementId)
      .classList.add(config.cssClasses.workspaceAddonsSideBarPinnedClass);
  },
  hideSideBar() {
    document
      .getElementById(config.elements.workspaceElementId)
      .classList.remove(config.cssClasses.workspaceAddonsSideBarPinnedClass);
  },
  startObservingChanges() {
    this.updateDistanceFromTop(document.getElementById(config.elements.ribbonRowElementId));

    return Promise.resolve().then(() => {
      mutationSvc.observe(
        'ribbon',
        document.getElementById(config.elements.ribbonRowElementId),
        {
          attributes: true,
          attributeFilter: ['style']
        },
        mutations => {
          this.updateDistanceFromTop();
        }
      );
      mutationSvc.observe('body-add', document.body, { childList: true }, mutations => {
        this.updateDistanceFromTop();
      });
    });
  },
  /**
   * Calculates the height to from the first child of the
   * document body to the sharepoint form element
   * @return {Number} the height before the sharepoint form
   */
  calculateHeightToForm() {
    let startElement = document.body.firstElementChild;
    const lastElement = document.querySelector('form');

    let heightBeforeForm = 0;
    while (startElement !== lastElement) {
      if (startElement.getClientRects) {
        // check if position fixed style is active
        if (startElement.style.position && startElement.style.position === 'fixed') {
          continue;
        }
        const clientRects = startElement.getClientRects();
        if (clientRects && clientRects.length) {
          heightBeforeForm += clientRects[0].height;
        }
      }
      startElement = startElement.nextElementSibling;
    }
    return heightBeforeForm;
  },
  /**
   * Calculate element height starting from first form element to
   * the s4 workspace element
   * @return {number}
   */
  calculateHeightInFormToWorkspace() {
    let startElement = document.querySelector('form').firstElementChild;
    const lastElement = document.getElementById(config.elements.workspaceElementId);

    let heightBeforeWorkspace = 0;
    while (startElement !== lastElement) {
      if (startElement.tagName !== 'SCRIPT' && startElement.getClientRects) {
        const clientRects = startElement.getClientRects()[0];
        if (clientRects) {
          if (clientRects.height && clientRects.width) {
            heightBeforeWorkspace += clientRects.height;
          }
        }
      }
      startElement = startElement.nextElementSibling;
    }
    return heightBeforeWorkspace;
  },
  updateDistanceFromTop() {
    let distanceFromTop = this.calculateHeightToForm() + this.calculateHeightInFormToWorkspace();
    // update the layout store
    store.dispatch('layout/updateDistanceFromTop', `${parseInt(distanceFromTop, 10)}px`);
  },
  enableCodingSelection() {
    $(`#${config.elements.editorContentElementId}`).removeClass(
      config.cssClasses.disableCodingBlockSelection
    );
  },
  disableCodingSelection() {
    $(`#${config.elements.editorContentElementId}`).addClass(
      config.cssClasses.disableCodingBlockSelection
    );
  },
  setWorkspaceToEditMode() {
    $(`#${config.elements.workspaceElementId}`).addClass(
      config.cssClasses.workspaceAddonsEditModeClass
    );
  },
  setWorkspaceToReadOnlyMode() {
    $(`#${config.elements.workspaceElementId}`).removeClass(
      config.cssClasses.workspaceAddonsEditModeClass
    );
  },
  stopObservingChanges: () => mutationSvc.disconnectObserver('ribbon')
};
