export const QuickMenuType = {
  Select: 'select',
  Check: 'check',
  Text: 'text'
};

export class QuickMenuAction {
  /**
   * Creates new action for a QuickMenu
   * @param name {String} the name of the action
   * @param icon {String} the icon of the action
   * @param actionCallback {Function} callback function for action
   */
  constructor(name, icon, actionCallback) {
    this.name = name;
    this.icon = icon;
    this.action = actionCallback;
  }
}

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

export class QuickMenuRangeItem extends QuickMenuItem {
  /**
   * Creates new QuickMenuItem of type Range
   * @param label {String} the label
   * @param value {Object} the value
   * @param min {Number} the minimum value of the range
   * @param max {Number} the maximum value of the range
   * @param actionCallback {Function} the callback if a change occurs
   */
  constructor(label, value, min, max, actionCallback) {
    super('range', label, parseInt(value), actionCallback);
    this.min = min;
    this.max = max;
  }
}
