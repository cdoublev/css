import conversions from "webidl-conversions";
import * as utils from "./utils.js";
import Impl from "./CSSFontPaletteValuesRule-impl.js";

import CSSRule from "./CSSRule.js";

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const inheritance = "CSSRule";

const interfaceName = "CSSFontPaletteValuesRule";

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
  throw new globalObject.TypeError(`${context} is not of type 'CSSFontPaletteValuesRule'.`);
};

function makeWrapper(globalObject, newTarget) {
  let proto;
  if (newTarget !== undefined) {
    proto = newTarget.prototype;
  }

  if (!utils.isObject(proto)) {
    proto = globalObject[ctorRegistrySymbol]["CSSFontPaletteValuesRule"].prototype;
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
  CSSRule._internalSetup(wrapper, globalObject);
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
  class CSSFontPaletteValuesRule extends globalObject.CSSRule {
    constructor() {
      throw new globalObject.TypeError("Illegal constructor");
    }

    get basePalette() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get basePalette' called on an object that is not a valid instance of CSSFontPaletteValuesRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["basePalette"]);
    }

    get fontFamily() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontFamily' called on an object that is not a valid instance of CSSFontPaletteValuesRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["fontFamily"]);
    }

    get name() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get name' called on an object that is not a valid instance of CSSFontPaletteValuesRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["name"]);
    }

    get overrideColors() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get overrideColors' called on an object that is not a valid instance of CSSFontPaletteValuesRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["overrideColors"]);
    }
  }
  Object.defineProperties(CSSFontPaletteValuesRule.prototype, {
    basePalette: { enumerable: true },
    fontFamily: { enumerable: true },
    name: { enumerable: true },
    overrideColors: { enumerable: true },
    [Symbol.toStringTag]: { value: "CSSFontPaletteValuesRule", configurable: true }
  });
  ctorRegistry[interfaceName] = CSSFontPaletteValuesRule;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: CSSFontPaletteValuesRule
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
