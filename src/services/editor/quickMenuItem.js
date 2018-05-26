export const QuickMenuType = {
  Select: 'select',
  Check: 'check'
};

export class QuickMenuItem {
  /**
   * Creates a new item for a quickMenu
   * @param type
   * @param label the description/tooltip for the item
   * @param value the current value of the item
   * @param optionsMap? possible optionsMap if <code>type</code> is 'select'
   * @param actionCallback callback function to perform the item's action
   */
  constructor(type, label, value, actionCallback, optionsMap = null) {
    this.type = type;
    this.label = label;
    this.value = value;
    this.action = actionCallback;
    this.options = optionsMap;
  }
}
