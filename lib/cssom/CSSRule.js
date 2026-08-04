import conversions from "webidl-conversions";
import * as utils from "./utils.js";
import Impl from "./CSSRule-impl.js";

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;

const interfaceName = "CSSRule";

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
  throw new globalObject.TypeError(`${context} is not of type 'CSSRule'.`);
};

function makeWrapper(globalObject, newTarget) {
  let proto;
  if (newTarget !== undefined) {
    proto = newTarget.prototype;
  }

  if (!utils.isObject(proto)) {
    proto = globalObject[ctorRegistrySymbol]["CSSRule"].prototype;
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
  class CSSRule {
    constructor() {
      throw new globalObject.TypeError("Illegal constructor");
    }

    get cssText() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError("'get cssText' called on an object that is not a valid instance of CSSRule.");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["cssText"]);
    }

    get parentRule() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get parentRule' called on an object that is not a valid instance of CSSRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["parentRule"]);
    }

    get parentStyleSheet() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get parentStyleSheet' called on an object that is not a valid instance of CSSRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["parentStyleSheet"]);
    }

    get type() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError("'get type' called on an object that is not a valid instance of CSSRule.");
      }

      return esValue[implSymbol]["type"];
    }
  }
  Object.defineProperties(CSSRule.prototype, {
    cssText: { enumerable: true },
    parentRule: { enumerable: true },
    parentStyleSheet: { enumerable: true },
    type: { enumerable: true },
    [Symbol.toStringTag]: { value: "CSSRule", configurable: true },
    STYLE_RULE: { value: 1, enumerable: true },
    CHARSET_RULE: { value: 2, enumerable: true },
    IMPORT_RULE: { value: 3, enumerable: true },
    MEDIA_RULE: { value: 4, enumerable: true },
    FONT_FACE_RULE: { value: 5, enumerable: true },
    PAGE_RULE: { value: 6, enumerable: true },
    KEYFRAMES_RULE: { value: 7, enumerable: true },
    KEYFRAME_RULE: { value: 8, enumerable: true },
    MARGIN_RULE: { value: 9, enumerable: true },
    NAMESPACE_RULE: { value: 10, enumerable: true },
    COUNTER_STYLE_RULE: { value: 11, enumerable: true },
    SUPPORTS_RULE: { value: 12, enumerable: true },
    FONT_FEATURE_VALUES_RULE: { value: 14, enumerable: true }
  });
  Object.defineProperties(CSSRule, {
    STYLE_RULE: { value: 1, enumerable: true },
    CHARSET_RULE: { value: 2, enumerable: true },
    IMPORT_RULE: { value: 3, enumerable: true },
    MEDIA_RULE: { value: 4, enumerable: true },
    FONT_FACE_RULE: { value: 5, enumerable: true },
    PAGE_RULE: { value: 6, enumerable: true },
    KEYFRAMES_RULE: { value: 7, enumerable: true },
    KEYFRAME_RULE: { value: 8, enumerable: true },
    MARGIN_RULE: { value: 9, enumerable: true },
    NAMESPACE_RULE: { value: 10, enumerable: true },
    COUNTER_STYLE_RULE: { value: 11, enumerable: true },
    SUPPORTS_RULE: { value: 12, enumerable: true },
    FONT_FEATURE_VALUES_RULE: { value: 14, enumerable: true }
  });
  ctorRegistry[interfaceName] = CSSRule;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: CSSRule
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
