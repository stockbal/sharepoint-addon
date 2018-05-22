HTMLElement.prototype.getData = function(name) {
  let dataValue = this.getAttribute(`data-${name}`);
  if (dataValue) {
    if (dataValue === 'false' || dataValue === 'true') {
      return dataValue === 'true';
    } else {
      return dataValue;
    }
  } else {
    return null;
  }
};

HTMLElement.prototype.setData = function(name, value) {
  this.setAttribute(`data-${name}`, value);
};

HTMLElement.prototype.hasClass = function(pattern) {
  for (const className of this.classList) {
    if (pattern.test(className)) {
      return true;
    }
  }
  return false;
};

HTMLElement.prototype.removeClass = function(pattern) {
  for (const className of this.classList) {
    if (pattern.test(className)) {
      this.classList.remove(className);
    }
  }
};

HTMLElement.prototype.remove = function() {
  this.parentNode.removeChild(this);
};
