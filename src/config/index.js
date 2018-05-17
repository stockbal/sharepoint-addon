import prism from './prismConfig';

export default {
  elements: {
    webPartContainerClass: 'ms-rte-wpbox',
    sharePointEditorAreaRead: 'ms-rte-layoutszone-inner',
    sharePointEditorArea: 'ms-rte-layoutszone-inner-editable',
    editorContentElementId: 'contentBox',
    sideNavBoxElementId: 'sideNavBox',
    workspaceElementId: 's4-workspace',
    ribbonRowElementId: 's4-ribbonrow',
    titleRowElementId: 's4-titlerow',
    saveEditButtonId: 'ctl00_PageStateActionButton',
    checkinCheckoutButton: 'Ribbon.EditingTools.CPEditTab.EditAndCheckout.Checkout-SelectedItem',
    editSourceCodeButtonId: 'Ribbon.EditingTools.CPEditTab.Markup.Html.Menu.Html.EditSource-Large'
  },
  cssClasses: {
    workspaceAddonsLoadedClass: 's4-workspace--addons-loaded',
    workspaceAddonsEditModeClass: 's4-workspace--edit-mode',
    sharePointReadOnlyClass: 'ms-wikicontent',
    workspaceAddonsSideBarPinnedClass: 's4-workspace--addons__sidebar--pinned',
    disableCodingBlockSelection: 'content-box--no-coding-selection',
    addonStyleGeneric: 'wiki-addon',
    addonStyleDark: 'wiki-addon--dark',
    addonStyleLight: 'wiki-addon--light',
    coreOverlay: 'ms-core-overlay'
  },
  prism: prism
};
