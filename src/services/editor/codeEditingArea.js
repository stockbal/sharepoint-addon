/* eslint-disable no-unused-vars */

class CodeEditingArea {
  constructor(createFromSelection, inline) {
    this.inline = inline;
    this.createFromSelection = createFromSelection;
  }
}

export default {
  createCodeAreaFromSelection(inline = false) {},
  createCodeEmptyCodeArea(inline = false) {}
};
