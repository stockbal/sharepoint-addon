import eventProxy from '../util/eventProxy';
import KeyStrokes from './keystrokes';
import { ZERO_WIDTH } from '../config/constants';

const editorUtilsSvc = {
  determineTabs(selection) {
    const anchorNode =
      selection.anchorNode.nodeType === Node.TEXT_NODE ? selection.anchorNode : selection.baseNode;
    if (!anchorNode) {
      return '';
    }
    // 1) check if previous element of anchor is a break
    let line = '';
    let tabs = '';
    if (anchorNode.previousElementSibling && anchorNode.previousElementSibling.tagName === 'BR') {
      line = anchorNode.wholeText;
    } else {
      const textBeforeBreak = anchorNode.textContent.substr(0, selection.anchorOffset);
      const lastBreak = textBeforeBreak.lastIndexOf('\n');

      if (lastBreak !== -1) {
        line = textBeforeBreak.substr(lastBreak + 1, selection.anchorOffset);
      }
    }

    if (line !== '') {
      const tabMatch = /\t*/.exec(line);
      if (tabMatch) {
        tabs = tabMatch[0];
      }
    }
    return tabs;
  },
  insertLineBreak(selection, range) {
    let tabs = this.determineTabs(selection);

    const lineBreak = document.createElement('br');
    // const lineBreak = document.createTextNode('\n');
    const zeroWidthSpace = document.createTextNode(ZERO_WIDTH);
    range.deleteContents();

    // insert the line break
    range.insertNode(lineBreak);
    range.setStartAfter(lineBreak);
    range.setEndAfter(lineBreak);

    if (tabs !== '') {
      const tabNode = document.createTextNode(tabs);
      range.insertNode(tabNode);
      range.setStartAfter(tabNode);
      range.setEndAfter(tabNode);
    }
    // insert the zero white space character to indicate word boundary
    range.insertNode(zeroWidthSpace);
    range.setStartBefore(zeroWidthSpace);
    range.setEndBefore(zeroWidthSpace);

    selection.removeAllRanges();
    selection.addRange(range);
  },
  insertTab(selection, range, useTabs) {
    const tab = document.createTextNode(useTabs ? '\t' : '  ');

    range.insertNode(tab);
    range.setStartAfter(tab);
    range.setEndAfter(tab);

    selection.removeAllRanges();
    selection.addRange(range);
  }
};

eventProxy.on('handleCodeEditorKeyDown', (evt, useTabs = true) => {
  if (evt.keyCode === KeyStrokes.Enter || evt.keyCode === KeyStrokes.Tab) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    if (evt.keyCode === KeyStrokes.Enter) {
      if (!evt.shiftKey && !evt.altKey && !evt.ctrlKey) {
        editorUtilsSvc.insertLineBreak(selection, range);
        evt.preventDefault();
      } else if (evt.ctrlKey && !evt.shiftKey && !evt.altKey) {
      }
    } else if (evt.keyCode === KeyStrokes.Tab && !evt.shiftKey && !evt.ctrlKey) {
      editorUtilsSvc.insertTab(selection, range, useTabs);
      evt.preventDefault();
    }
  }
});
