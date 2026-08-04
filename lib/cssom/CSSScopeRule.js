import conversions from "webidl-conversions";
import * as utils from "./utils.js";
import Impl from "./CSSScopeRule-impl.js";

import CSSGroupingRule from "./CSSGroupingRule.js";

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const inheritance = "CSSGroupingRule";

const interfaceName = "CSSScopeRule";

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
  throw new globalObject.TypeError(`${context} is not of type 'CSSScopeRule'.`);
};

function makeWrapper(globalObject, newTarget) {
  let proto;
  if (newTarget !== undefined) {
    proto = newTarget.prototype;
  }

  if (!utils.isObject(proto)) {
    proto = globalObject[ctorRegistrySymbol]["CSSScopeRule"].prototype;
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
  CSSGroupingRule._internalSetup(wrapper, globalObject);
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
  class CSSScopeRule extends globalObject.CSSGroupingRule {
    constructor() {
      throw new globalObject.TypeError("Illegal constructor");
    }

    get end() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError("'get end' called on an object that is not a valid instance of CSSScopeRule.");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["end"]);
    }

    get start() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get start' called on an object that is not a valid instance of CSSScopeRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["start"]);
    }
  }
  Object.defineProperties(CSSScopeRule.prototype, {
    end: { enumerable: true },
    start: { enumerable: true },
    [Symbol.toStringTag]: { value: "CSSScopeRule", configurable: true }
  });
  ctorRegistry[interfaceName] = CSSScopeRule;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: CSSScopeRule
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
