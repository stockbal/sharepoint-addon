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
    // document.body.classList.toggle(config.cssClasses.addonStyleDark, true);
    // document.body.classList.toggle(config.cssClasses.addonStyleLight, true);
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
          let mutation = mutations[0];

          if (mutation.target) {
            this.updateDistanceFromTop(mutation.target);
          }
        }
      );
      mutationSvc.observe('body-add', document.body, { childList: true }, mutations => {
        let mutation = mutations[0];
        if (mutation.target) {
          this.updateDistanceFromTop(mutation.target);
        }
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
        const clientRects = startElement.getClientRects();
        if (clientRects && clientRects.length) {
          heightBeforeForm += clientRects[0].height;
        }
      }
      startElement = startElement.nextElementSibling;
    }
    return heightBeforeForm;
  },
  updateDistanceFromTop(target) {
    let styleConstants = store.getters['layout/constants'];
    // get distance to form element

    let distanceFromTop = 0;
    const heightBeforeForm = this.calculateHeightToForm();

    if (target) {
      let ribbonRowHeight = parseInt(target.style.height);
      if (isNaN(ribbonRowHeight)) {
        distanceFromTop = styleConstants.panelHeightRibbonClosed;
      } else {
        if (ribbonRowHeight < 100) {
          distanceFromTop = styleConstants.panelHeightRibbonClosed;
        } else if (ribbonRowHeight < 400) {
          distanceFromTop = styleConstants.panelHeightRibbonOpen;
        } else {
          distanceFromTop = styleConstants.panelHeightRibbonWebPartOpen;
        }
      }
      distanceFromTop = `${parseInt(distanceFromTop, 10) + heightBeforeForm}px`;

      // update the layout store
      store.dispatch('layout/updateDistanceFromTop', distanceFromTop);
    }
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
