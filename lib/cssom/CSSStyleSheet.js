import conversions from "webidl-conversions";
import * as utils from "./utils.js";
import Impl from "./CSSStyleSheet-impl.js";

import CSSStyleSheetInit from "./CSSStyleSheetInit.js";
import StyleSheet from "./StyleSheet.js";

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const inheritance = "StyleSheet";

const interfaceName = "CSSStyleSheet";

const is = value => {
  return utils.isObject(value) && Object.hasOwn(value, implSymbol) && value[implSymbol] instanceof Impl;
};
const isImpl = value => {
  return utils.isObject(value) && value instanceof Impl;
};
const convert = (globalObject, value, { context = "The provided value" } = {}) => {
  if (is(value)) {
    return utils.implForWrapper(value);
  }
  throw new globalObject.TypeError(`${context} is not of type 'CSSStyleSheet'.`);
};

function makeWrapper(globalObject, newTarget) {
  let proto;
  if (newTarget !== undefined) {
    proto = newTarget.prototype;
  }

  if (!utils.isObject(proto)) {
    proto = globalObject[ctorRegistrySymbol]["CSSStyleSheet"].prototype;
  }

  return Object.create(proto);
}

const create = (globalObject, constructorArgs, privateData) => {
  const wrapper = makeWrapper(globalObject);
  return setup(wrapper, globalObject, constructorArgs, privateData);
};

const createImpl = (globalObject, constructorArgs, privateData) => {
  const wrapper = create(globalObject, constructorArgs, privateData);
  return utils.implForWrapper(wrapper);
};

const _internalSetup = (wrapper, globalObject) => {
  StyleSheet._internalSetup(wrapper, globalObject);
};

const setup = (wrapper, globalObject, constructorArgs = [], privateData = {}) => {
  privateData.wrapper = wrapper;

  _internalSetup(wrapper, globalObject);
  Object.defineProperty(wrapper, implSymbol, {
    value: new Impl(globalObject, constructorArgs, privateData),
    configurable: true
  });

  wrapper[implSymbol][utils.wrapperSymbol] = wrapper;
  if (Impl.init) {
    Impl.init(wrapper[implSymbol]);
  }
  return wrapper;
};

const createNew = (globalObject, newTarget) => {
  const wrapper = makeWrapper(globalObject, newTarget);

  _internalSetup(wrapper, globalObject);
  Object.defineProperty(wrapper, implSymbol, {
    value: Object.create(Impl.prototype),
    configurable: true
  });

  wrapper[implSymbol][utils.wrapperSymbol] = wrapper;
  if (Impl.init) {
    Impl.init(wrapper[implSymbol]);
  }
  return wrapper[implSymbol];
};

const exposed = new Set(["Window"]);

const install = (globalObject, globalNames) => {
  if (!globalNames.some(globalName => exposed.has(globalName))) {
    return;
  }

  const ctorRegistry = utils.initCtorRegistry(globalObject);
  class CSSStyleSheet extends globalObject.StyleSheet {
    constructor() {
      const args = [];
      {
        let curArg = arguments[0];
        curArg = CSSStyleSheetInit.convert(globalObject, curArg, {
          context: "Failed to construct 'CSSStyleSheet': parameter 1"
        });
        args.push(curArg);
      }
      return setup(Object.create(new.target.prototype), globalObject, args);
    }

    addRule() {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'addRule' called on an object that is not a valid instance of CSSStyleSheet."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        if (curArg !== undefined) {
          curArg = conversions["DOMString"](curArg, {
            context: "Failed to execute 'addRule' on 'CSSStyleSheet': parameter 1",
            globals: globalObject
          });
        } else {
          curArg = "undefined";
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        if (curArg !== undefined) {
          curArg = conversions["DOMString"](curArg, {
            context: "Failed to execute 'addRule' on 'CSSStyleSheet': parameter 2",
            globals: globalObject
          });
        } else {
          curArg = "undefined";
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[2];
        if (curArg !== undefined) {
          curArg = conversions["unsigned long"](curArg, {
            context: "Failed to execute 'addRule' on 'CSSStyleSheet': parameter 3",
            globals: globalObject
          });
        }
        args.push(curArg);
      }
      return esValue[implSymbol].addRule(...args);
    }

    deleteRule(index) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'deleteRule' called on an object that is not a valid instance of CSSStyleSheet."
        );
      }

      if (arguments.length < 1) {
        throw new globalObject.TypeError(
          `Failed to execute 'deleteRule' on 'CSSStyleSheet': 1 argument required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["unsigned long"](curArg, {
          context: "Failed to execute 'deleteRule' on 'CSSStyleSheet': parameter 1",
          globals: globalObject
        });
        args.push(curArg);
      }
      return esValue[implSymbol].deleteRule(...args);
    }

    insertRule(rule) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'insertRule' called on an object that is not a valid instance of CSSStyleSheet."
        );
      }

      if (arguments.length < 1) {
        throw new globalObject.TypeError(
          `Failed to execute 'insertRule' on 'CSSStyleSheet': 1 argument required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'insertRule' on 'CSSStyleSheet': parameter 1",
          globals: globalObject
        });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        if (curArg !== undefined) {
          curArg = conversions["unsigned long"](curArg, {
            context: "Failed to execute 'insertRule' on 'CSSStyleSheet': parameter 2",
            globals: globalObject
          });
        } else {
          curArg = 0;
        }
        args.push(curArg);
      }
      return esValue[implSymbol].insertRule(...args);
    }

    removeRule() {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'removeRule' called on an object that is not a valid instance of CSSStyleSheet."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        if (curArg !== undefined) {
          curArg = conversions["unsigned long"](curArg, {
            context: "Failed to execute 'removeRule' on 'CSSStyleSheet': parameter 1",
            globals: globalObject
          });
        } else {
          curArg = 0;
        }
        args.push(curArg);
      }
      return esValue[implSymbol].removeRule(...args);
    }

    replace(text) {
      try {
        const esValue = this !== null && this !== undefined ? this : globalObject;
        if (!is(esValue)) {
          throw new globalObject.TypeError(
            "'replace' called on an object that is not a valid instance of CSSStyleSheet."
          );
        }

        if (arguments.length < 1) {
          throw new globalObject.TypeError(
            `Failed to execute 'replace' on 'CSSStyleSheet': 1 argument required, but only ${arguments.length} present.`
          );
        }
        const args = [];
        {
          let curArg = arguments[0];
          curArg = conversions["USVString"](curArg, {
            context: "Failed to execute 'replace' on 'CSSStyleSheet': parameter 1",
            globals: globalObject
          });
          args.push(curArg);
        }
        return utils.tryWrapperForImpl(esValue[implSymbol].replace(...args));
      } catch (e) {
        return globalObject.Promise.reject(e);
      }
    }

    replaceSync(text) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'replaceSync' called on an object that is not a valid instance of CSSStyleSheet."
        );
      }

      if (arguments.length < 1) {
        throw new globalObject.TypeError(
          `Failed to execute 'replaceSync' on 'CSSStyleSheet': 1 argument required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["USVString"](curArg, {
          context: "Failed to execute 'replaceSync' on 'CSSStyleSheet': parameter 1",
          globals: globalObject
        });
        args.push(curArg);
      }
      return esValue[implSymbol].replaceSync(...args);
    }

    get cssRules() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get cssRules' called on an object that is not a valid instance of CSSStyleSheet."
        );
      }

      return utils.getSameObject(this, "cssRules", () => {
        return utils.tryWrapperForImpl(esValue[implSymbol]["cssRules"]);
      });
    }

    get ownerRule() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get ownerRule' called on an object that is not a valid instance of CSSStyleSheet."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["ownerRule"]);
    }

    get rules() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get rules' called on an object that is not a valid instance of CSSStyleSheet."
        );
      }

      return utils.getSameObject(this, "rules", () => {
        return utils.tryWrapperForImpl(esValue[implSymbol]["rules"]);
      });
    }
  }
  Object.defineProperties(CSSStyleSheet.prototype, {
    addRule: { enumerable: true },
    deleteRule: { enumerable: true },
    insertRule: { enumerable: true },
    removeRule: { enumerable: true },
    replace: { enumerable: true },
    replaceSync: { enumerable: true },
    cssRules: { enumerable: true },
    ownerRule: { enumerable: true },
    rules: { enumerable: true },
    [Symbol.toStringTag]: { value: "CSSStyleSheet", configurable: true }
  });
  ctorRegistry[interfaceName] = CSSStyleSheet;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: CSSStyleSheet
  });
};

export default {
  _internalSetup,
  convert,
  create,
  new: createNew,
  createImpl,
  install,
  is,
  isImpl,
  setup,
  inheritance
};
