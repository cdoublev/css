import conversions from "webidl-conversions";
import * as utils from "./utils.js";
import Impl from "./CSSImportRule-impl.js";

import CSSRule from "./CSSRule.js";

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const inheritance = "CSSRule";

const interfaceName = "CSSImportRule";

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
  throw new globalObject.TypeError(`${context} is not of type 'CSSImportRule'.`);
};

function makeWrapper(globalObject, newTarget) {
  let proto;
  if (newTarget !== undefined) {
    proto = newTarget.prototype;
  }

  if (!utils.isObject(proto)) {
    proto = globalObject[ctorRegistrySymbol]["CSSImportRule"].prototype;
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
  class CSSImportRule extends globalObject.CSSRule {
    constructor() {
      throw new globalObject.TypeError("Illegal constructor");
    }

    get href() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get href' called on an object that is not a valid instance of CSSImportRule."
        );
      }

      return esValue[implSymbol]["href"];
    }

    get layerName() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get layerName' called on an object that is not a valid instance of CSSImportRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["layerName"]);
    }

    get media() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get media' called on an object that is not a valid instance of CSSImportRule."
        );
      }

      return utils.getSameObject(this, "media", () => {
        return utils.tryWrapperForImpl(esValue[implSymbol]["media"]);
      });
    }

    set media(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set media' called on an object that is not a valid instance of CSSImportRule."
        );
      }

      const Q = esValue["media"];
      if (!utils.isObject(Q)) {
        throw new globalObject.TypeError("Property 'media' is not an object");
      }
      Reflect.set(Q, "mediaText", V);
    }

    get styleSheet() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get styleSheet' called on an object that is not a valid instance of CSSImportRule."
        );
      }

      return utils.getSameObject(this, "styleSheet", () => {
        return utils.tryWrapperForImpl(esValue[implSymbol]["styleSheet"]);
      });
    }

    get supportsText() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get supportsText' called on an object that is not a valid instance of CSSImportRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["supportsText"]);
    }
  }
  Object.defineProperties(CSSImportRule.prototype, {
    href: { enumerable: true },
    layerName: { enumerable: true },
    media: { enumerable: true },
    styleSheet: { enumerable: true },
    supportsText: { enumerable: true },
    [Symbol.toStringTag]: { value: "CSSImportRule", configurable: true }
  });
  ctorRegistry[interfaceName] = CSSImportRule;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: CSSImportRule
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
