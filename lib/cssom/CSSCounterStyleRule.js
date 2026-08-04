import conversions from "webidl-conversions";
import * as utils from "./utils.js";
import Impl from "./CSSCounterStyleRule-impl.js";

import CSSRule from "./CSSRule.js";

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const inheritance = "CSSRule";

const interfaceName = "CSSCounterStyleRule";

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
  throw new globalObject.TypeError(`${context} is not of type 'CSSCounterStyleRule'.`);
};

function makeWrapper(globalObject, newTarget) {
  let proto;
  if (newTarget !== undefined) {
    proto = newTarget.prototype;
  }

  if (!utils.isObject(proto)) {
    proto = globalObject[ctorRegistrySymbol]["CSSCounterStyleRule"].prototype;
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
  class CSSCounterStyleRule extends globalObject.CSSRule {
    constructor() {
      throw new globalObject.TypeError("Illegal constructor");
    }

    get additiveSymbols() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get additiveSymbols' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["additiveSymbols"]);
    }

    set additiveSymbols(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set additiveSymbols' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'additiveSymbols' property on 'CSSCounterStyleRule': The provided value",
        globals: globalObject
      });

      esValue[implSymbol]["additiveSymbols"] = V;
    }

    get fallback() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fallback' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["fallback"]);
    }

    set fallback(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fallback' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fallback' property on 'CSSCounterStyleRule': The provided value",
        globals: globalObject
      });

      esValue[implSymbol]["fallback"] = V;
    }

    get name() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get name' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["name"]);
    }

    set name(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set name' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'name' property on 'CSSCounterStyleRule': The provided value",
        globals: globalObject
      });

      esValue[implSymbol]["name"] = V;
    }

    get negative() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get negative' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["negative"]);
    }

    set negative(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set negative' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'negative' property on 'CSSCounterStyleRule': The provided value",
        globals: globalObject
      });

      esValue[implSymbol]["negative"] = V;
    }

    get pad() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get pad' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["pad"]);
    }

    set pad(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set pad' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'pad' property on 'CSSCounterStyleRule': The provided value",
        globals: globalObject
      });

      esValue[implSymbol]["pad"] = V;
    }

    get prefix() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get prefix' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["prefix"]);
    }

    set prefix(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set prefix' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'prefix' property on 'CSSCounterStyleRule': The provided value",
        globals: globalObject
      });

      esValue[implSymbol]["prefix"] = V;
    }

    get range() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get range' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["range"]);
    }

    set range(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set range' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'range' property on 'CSSCounterStyleRule': The provided value",
        globals: globalObject
      });

      esValue[implSymbol]["range"] = V;
    }

    get speakAs() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get speakAs' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["speakAs"]);
    }

    set speakAs(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set speakAs' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'speakAs' property on 'CSSCounterStyleRule': The provided value",
        globals: globalObject
      });

      esValue[implSymbol]["speakAs"] = V;
    }

    get suffix() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get suffix' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["suffix"]);
    }

    set suffix(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set suffix' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'suffix' property on 'CSSCounterStyleRule': The provided value",
        globals: globalObject
      });

      esValue[implSymbol]["suffix"] = V;
    }

    get symbols() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get symbols' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["symbols"]);
    }

    set symbols(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set symbols' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'symbols' property on 'CSSCounterStyleRule': The provided value",
        globals: globalObject
      });

      esValue[implSymbol]["symbols"] = V;
    }

    get system() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get system' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["system"]);
    }

    set system(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set system' called on an object that is not a valid instance of CSSCounterStyleRule."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'system' property on 'CSSCounterStyleRule': The provided value",
        globals: globalObject
      });

      esValue[implSymbol]["system"] = V;
    }
  }
  Object.defineProperties(CSSCounterStyleRule.prototype, {
    additiveSymbols: { enumerable: true },
    fallback: { enumerable: true },
    name: { enumerable: true },
    negative: { enumerable: true },
    pad: { enumerable: true },
    prefix: { enumerable: true },
    range: { enumerable: true },
    speakAs: { enumerable: true },
    suffix: { enumerable: true },
    symbols: { enumerable: true },
    system: { enumerable: true },
    [Symbol.toStringTag]: { value: "CSSCounterStyleRule", configurable: true }
  });
  ctorRegistry[interfaceName] = CSSCounterStyleRule;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: CSSCounterStyleRule
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
