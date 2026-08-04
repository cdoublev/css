import conversions from "webidl-conversions";
import * as utils from "./utils.js";
import Impl from "./StyleSheet-impl.js";

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;

const interfaceName = "StyleSheet";

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
  throw new globalObject.TypeError(`${context} is not of type 'StyleSheet'.`);
};

function makeWrapper(globalObject, newTarget) {
  let proto;
  if (newTarget !== undefined) {
    proto = newTarget.prototype;
  }

  if (!utils.isObject(proto)) {
    proto = globalObject[ctorRegistrySymbol]["StyleSheet"].prototype;
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
  class StyleSheet {
    constructor() {
      throw new globalObject.TypeError("Illegal constructor");
    }

    get disabled() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get disabled' called on an object that is not a valid instance of StyleSheet."
        );
      }

      return esValue[implSymbol]["disabled"];
    }

    set disabled(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set disabled' called on an object that is not a valid instance of StyleSheet."
        );
      }

      V = conversions["boolean"](V, {
        context: "Failed to set the 'disabled' property on 'StyleSheet': The provided value",
        globals: globalObject
      });

      esValue[implSymbol]["disabled"] = V;
    }

    get href() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError("'get href' called on an object that is not a valid instance of StyleSheet.");
      }

      return esValue[implSymbol]["href"];
    }

    get media() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError("'get media' called on an object that is not a valid instance of StyleSheet.");
      }

      return utils.getSameObject(this, "media", () => {
        return utils.tryWrapperForImpl(esValue[implSymbol]["media"]);
      });
    }

    set media(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError("'set media' called on an object that is not a valid instance of StyleSheet.");
      }

      const Q = esValue["media"];
      if (!utils.isObject(Q)) {
        throw new globalObject.TypeError("Property 'media' is not an object");
      }
      Reflect.set(Q, "mediaText", V);
    }

    get ownerNode() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get ownerNode' called on an object that is not a valid instance of StyleSheet."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["ownerNode"]);
    }

    get parentStyleSheet() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get parentStyleSheet' called on an object that is not a valid instance of StyleSheet."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["parentStyleSheet"]);
    }

    get title() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError("'get title' called on an object that is not a valid instance of StyleSheet.");
      }

      return esValue[implSymbol]["title"];
    }

    get type() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError("'get type' called on an object that is not a valid instance of StyleSheet.");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["type"]);
    }
  }
  Object.defineProperties(StyleSheet.prototype, {
    disabled: { enumerable: true },
    href: { enumerable: true },
    media: { enumerable: true },
    ownerNode: { enumerable: true },
    parentStyleSheet: { enumerable: true },
    title: { enumerable: true },
    type: { enumerable: true },
    [Symbol.toStringTag]: { value: "StyleSheet", configurable: true }
  });
  ctorRegistry[interfaceName] = StyleSheet;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: StyleSheet
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
