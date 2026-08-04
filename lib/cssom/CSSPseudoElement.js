import conversions from "webidl-conversions";
import * as utils from "./utils.js";
import Impl from "./CSSPseudoElement-impl.js";

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;

const interfaceName = "CSSPseudoElement";

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
  throw new globalObject.TypeError(`${context} is not of type 'CSSPseudoElement'.`);
};

function makeWrapper(globalObject, newTarget) {
  let proto;
  if (newTarget !== undefined) {
    proto = newTarget.prototype;
  }

  if (!utils.isObject(proto)) {
    proto = globalObject[ctorRegistrySymbol]["CSSPseudoElement"].prototype;
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

const _internalSetup = (wrapper, globalObject) => {};

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
  class CSSPseudoElement {
    constructor() {
      throw new globalObject.TypeError("Illegal constructor");
    }

    pseudo(type) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'pseudo' called on an object that is not a valid instance of CSSPseudoElement."
        );
      }

      if (arguments.length < 1) {
        throw new globalObject.TypeError(
          `Failed to execute 'pseudo' on 'CSSPseudoElement': 1 argument required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'pseudo' on 'CSSPseudoElement': parameter 1",
          globals: globalObject
        });
        args.push(curArg);
      }
      return utils.tryWrapperForImpl(esValue[implSymbol].pseudo(...args));
    }

    get type() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get type' called on an object that is not a valid instance of CSSPseudoElement."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["type"]);
    }

    get element() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get element' called on an object that is not a valid instance of CSSPseudoElement."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["element"]);
    }

    get parent() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get parent' called on an object that is not a valid instance of CSSPseudoElement."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["parent"]);
    }

    get selectorText() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get selectorText' called on an object that is not a valid instance of CSSPseudoElement."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["selectorText"]);
    }
  }
  Object.defineProperties(CSSPseudoElement.prototype, {
    pseudo: { enumerable: true },
    type: { enumerable: true },
    element: { enumerable: true },
    parent: { enumerable: true },
    selectorText: { enumerable: true },
    [Symbol.toStringTag]: { value: "CSSPseudoElement", configurable: true }
  });
  ctorRegistry[interfaceName] = CSSPseudoElement;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: CSSPseudoElement
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
  setup
};
