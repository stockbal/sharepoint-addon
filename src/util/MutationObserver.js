export let MutationObserver = window.MutationObserver;

class Observer {
  constructor(cb) {
    this._cb = cb;
  }
  disconnect() {
    this._isConnected = false;
  }
  observe(target, { attributes = true, attributeFilter = [] }) {
    this._isConnected = true;

    // set up initial values
    let valueMap = new Map();
    for (let attribute of attributeFilter) {
      valueMap.set(attribute, undefined);
    }

    setInterval(() => {
      if (!this._isConnected) {
        return;
      }
      // check if there is a mutation
      let hasChanges = false;
      if (attributes) {
        for (let attribute of attributeFilter) {
          let newValue = target.attributes[attribute];
          newValue = newValue ? newValue.value : undefined;
          let oldValue = valueMap.get(attribute);

          if (oldValue !== newValue) {
            hasChanges = true;
            valueMap.set(attribute, newValue);
          }
        }
      }
      if (hasChanges) {
        this._cb([{ target }]);
      }
    }, 32);
  }
}

if (typeof window.MutationObserver === 'undefined') {
  MutationObserver = Observer;
}
