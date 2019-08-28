import prism from './prismConfig';

export default {
  elements: {
    webPartContainerClass: 'ms-rte-wpbox',
    sharePointEditorAreaRead: 'ms-rte-layoutszone-inner',
    sharePointEditorArea: 'ms-rte-layoutszone-inner-editable',
    rangeStart: 'ms-rterangecursor-start',
    rangeEnd: 'ms-rterangecursor-end',
    editorContentElementId: 'contentBox',
    sideNavBoxElementId: 'sideNavBox',
    workspaceElementId: 's4-workspace',
    ribbonRowElementId: 's4-ribbonrow',
    titleRowElementId: 's4-titlerow',
    saveEditButtonId: 'ctl00_PageStateActionButton',
    checkinCheckoutButton: 'Ribbon.EditingTools.CPEditTab.EditAndCheckout.Checkout-SelectedItem',
    editSourceCodeButtonId: 'Ribbon.EditingTools.CPEditTab.Markup.Html.Menu.Html.EditSource-Large',
    fullScreeModeButtonId: 'ctl00_fullscreenmodeBtn',
    exitFullScreenModeButtonId: 'ctl00_exitfullscreenmodeBtn',
    fullScreenModeElementId: 'fullscreenmode',
    editingToolsRibbonContainer: 'Ribbon.EditingTools.CPEditTab.EditAndCheckout',
    pageRibbonContainer: 'Ribbon.WikiPageTab.EditAndCheckout'
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
  selectors: {
    editingToolsTab: {
      menuTitleLink: '#Ribbon\\.EditingTools\\.CPEditTab-title',
      saveAndStayMenu:
        'a[aria-describedby="Ribbon.EditingTools.CPEditTab.EditAndCheckout.SaveEdit.Menu.SaveEdit.Save_ToolTip"]',
      stopEditingButton:
        'a[aria-describedby="Ribbon.EditingTools.CPEditTab.EditAndCheckout.SaveEdit.Menu.SaveEdit.StopEditing_ToolTip"]',
      saveEditButtonLarge:
        '#Ribbon\\.EditingTools\\.CPEditTab\\.EditAndCheckout\\.SaveEdit-Large > a'
    },
    pageTab: {
      menuTitleLink: '#Ribbon\\.WikiPageTab-title',
      saveAndStayMenu:
        'a[aria-describedby="Ribbon.WikiPageTab.EditAndCheckout.SaveEdit.Menu.SaveEdit.Save_ToolTip"]',
      stopEditingButton:
        'a[aria-describedby="Ribbon.WikiPageTab.EditAndCheckout.SaveEdit.Menu.SaveEdit.StopEditing_ToolTip"]',
      saveEditButtonLarge: '#Ribbon\\.WikiPageTab\\.EditAndCheckout\\.SaveEdit-Large > a'
    }
  },
  prism: prism,
  /**
   * FontAwesomeIcon Families
   */
  iconFamilies: {
    far: 'Regular',
    fas: 'Solid',
    fab: 'Brand'
  }
};
