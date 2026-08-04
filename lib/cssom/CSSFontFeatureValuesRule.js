import conversions from "webidl-conversions";
import * as utils from "./utils.js";
import Impl from "./CSSFontFeatureValuesRule-impl.js";

import CSSRule from "./CSSRule.js";

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const inheritance = "CSSRule";

const interfaceName = "CSSFontFeatureValuesRule";

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
  throw new globalObject.TypeError(`${context} is not of type 'CSSFontFeatureValuesRule'.`);
};

function makeWrapper(globalObject, newTarget) {
  let proto;
  if (newTarget !== undefined) {
    proto = newTarget.prototype;
  }

  if (!utils.isObject(proto)) {
    proto = globalObject[ctorRegistrySymbol]["CSSFontFeatureValuesRule"].prototype;
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
  class CSSFontFeatureValuesRule extends globalObject.CSSRule {
    constructor() {
      throw new globalObject.TypeError("Illegal constructor");
    }

    get annotation() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get annotation' called on an object that is not a valid instance of CSSFontFeatureValuesRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["annotation"]);
    }

    get characterVariant() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get characterVariant' called on an object that is not a valid instance of CSSFontFeatureValuesRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["characterVariant"]);
    }

    get fontFamily() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontFamily' called on an object that is not a valid instance of CSSFontFeatureValuesRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["fontFamily"]);
    }

    get ornaments() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get ornaments' called on an object that is not a valid instance of CSSFontFeatureValuesRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["ornaments"]);
    }

    get styleset() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get styleset' called on an object that is not a valid instance of CSSFontFeatureValuesRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["styleset"]);
    }

    get stylistic() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get stylistic' called on an object that is not a valid instance of CSSFontFeatureValuesRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["stylistic"]);
    }

    get swash() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get swash' called on an object that is not a valid instance of CSSFontFeatureValuesRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["swash"]);
    }
  }
  Object.defineProperties(CSSFontFeatureValuesRule.prototype, {
    annotation: { enumerable: true },
    characterVariant: { enumerable: true },
    fontFamily: { enumerable: true },
    ornaments: { enumerable: true },
    styleset: { enumerable: true },
    stylistic: { enumerable: true },
    swash: { enumerable: true },
    [Symbol.toStringTag]: { value: "CSSFontFeatureValuesRule", configurable: true }
  });
  ctorRegistry[interfaceName] = CSSFontFeatureValuesRule;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: CSSFontFeatureValuesRule
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
