import conversions from "webidl-conversions";
import * as utils from "./utils.js";
import Impl from "./CSSFontFeatureValuesMap-impl.js";

import Function from "./Function.js";

const newObjectInRealm = utils.newObjectInRealm;
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;

const interfaceName = "CSSFontFeatureValuesMap";

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
  throw new globalObject.TypeError(`${context} is not of type 'CSSFontFeatureValuesMap'.`);
};

const createDefaultIterator = (globalObject, target, kind) => {
  const ctorRegistry = globalObject[ctorRegistrySymbol];
  const iteratorPrototype = ctorRegistry["CSSFontFeatureValuesMap Iterator"];
  const iterator = Object.create(iteratorPrototype);
  Object.defineProperty(iterator, utils.iterInternalSymbol, {
    value: { target, kind, index: 0 },
    configurable: true
  });
  return iterator;
};

function makeWrapper(globalObject, newTarget) {
  let proto;
  if (newTarget !== undefined) {
    proto = newTarget.prototype;
  }

  if (!utils.isObject(proto)) {
    proto = globalObject[ctorRegistrySymbol]["CSSFontFeatureValuesMap"].prototype;
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
  class CSSFontFeatureValuesMap {
    constructor() {
      throw new globalObject.TypeError("Illegal constructor");
    }

    clear() {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'clear' called on an object that is not a valid instance of CSSFontFeatureValuesMap."
        );
      }

      return esValue[implSymbol].clear();
    }

    delete(key) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'delete' called on an object that is not a valid instance of CSSFontFeatureValuesMap."
        );
      }

      if (arguments.length < 1) {
        throw new globalObject.TypeError(
          `Failed to execute 'delete' on 'CSSFontFeatureValuesMap': 1 argument required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'delete' on 'CSSFontFeatureValuesMap': parameter 1",
          globals: globalObject
        });
        args.push(curArg);
      }
      return esValue[implSymbol].delete(...args);
    }

    get(key) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get' called on an object that is not a valid instance of CSSFontFeatureValuesMap."
        );
      }

      if (arguments.length < 1) {
        throw new globalObject.TypeError(
          `Failed to execute 'get' on 'CSSFontFeatureValuesMap': 1 argument required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'get' on 'CSSFontFeatureValuesMap': parameter 1",
          globals: globalObject
        });
        args.push(curArg);
      }
      return utils.tryWrapperForImpl(esValue[implSymbol].get(...args));
    }

    has(key) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'has' called on an object that is not a valid instance of CSSFontFeatureValuesMap."
        );
      }

      if (arguments.length < 1) {
        throw new globalObject.TypeError(
          `Failed to execute 'has' on 'CSSFontFeatureValuesMap': 1 argument required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'has' on 'CSSFontFeatureValuesMap': parameter 1",
          globals: globalObject
        });
        args.push(curArg);
      }
      return esValue[implSymbol].has(...args);
    }

    set(key, values) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set' called on an object that is not a valid instance of CSSFontFeatureValuesMap."
        );
      }

      if (arguments.length < 2) {
        throw new globalObject.TypeError(
          `Failed to execute 'set' on 'CSSFontFeatureValuesMap': 2 arguments required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'set' on 'CSSFontFeatureValuesMap': parameter 1",
          globals: globalObject
        });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        if (utils.isObject(curArg)) {
          if (
            utils.getMethod(
              curArg,
              Symbol.iterator,
              "Failed to execute 'set' on 'CSSFontFeatureValuesMap': parameter 2"
            ) !== undefined
          ) {
            if (!utils.isObject(curArg)) {
              throw new globalObject.TypeError(
                "Failed to execute 'set' on 'CSSFontFeatureValuesMap': parameter 2" +
                  " sequence" +
                  " is not an iterable object."
              );
            } else {
              const V = [];
              const tmp = curArg;
              for (let nextItem of tmp) {
                nextItem = conversions["long"](nextItem, {
                  context:
                    "Failed to execute 'set' on 'CSSFontFeatureValuesMap': parameter 2" + " sequence" + "'s element",
                  globals: globalObject
                });

                V.push(nextItem);
              }
              curArg = V;
            }
          } else {
          }
        } else if (typeof curArg === "number") {
          curArg = conversions["long"](curArg, {
            context: "Failed to execute 'set' on 'CSSFontFeatureValuesMap': parameter 2",
            globals: globalObject
          });
        } else {
          curArg = conversions["long"](curArg, {
            context: "Failed to execute 'set' on 'CSSFontFeatureValuesMap': parameter 2",
            globals: globalObject
          });
        }
        args.push(curArg);
      }
      return esValue[implSymbol].set(...args);
    }

    keys() {
      if (!is(this)) {
        throw new globalObject.TypeError(
          "'keys' called on an object that is not a valid instance of CSSFontFeatureValuesMap."
        );
      }
      return createDefaultIterator(globalObject, this, "key");
    }

    values() {
      if (!is(this)) {
        throw new globalObject.TypeError(
          "'values' called on an object that is not a valid instance of CSSFontFeatureValuesMap."
        );
      }
      return createDefaultIterator(globalObject, this, "value");
    }

    entries() {
      if (!is(this)) {
        throw new globalObject.TypeError(
          "'entries' called on an object that is not a valid instance of CSSFontFeatureValuesMap."
        );
      }
      return createDefaultIterator(globalObject, this, "key+value");
    }

    forEach(callback) {
      if (!is(this)) {
        throw new globalObject.TypeError(
          "'forEach' called on an object that is not a valid instance of CSSFontFeatureValuesMap."
        );
      }
      if (arguments.length < 1) {
        throw new globalObject.TypeError(
          "Failed to execute 'forEach' on 'iterable': 1 argument required, but only 0 present."
        );
      }
      callback = Function.convert(globalObject, callback, {
        context: "Failed to execute 'forEach' on 'iterable': The callback provided as parameter 1"
      });
      const thisArg = arguments[1];
      let pairs = Array.from(this[implSymbol]);
      let i = 0;
      while (i < pairs.length) {
        const [key, value] = pairs[i].map(utils.tryWrapperForImpl);
        callback.call(thisArg, value, key, this);
        pairs = Array.from(this[implSymbol]);
        i++;
      }
    }

    get size() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get size' called on an object that is not a valid instance of CSSFontFeatureValuesMap."
        );
      }

      return esValue[implSymbol]["size"];
    }
  }
  Object.defineProperties(CSSFontFeatureValuesMap.prototype, {
    clear: { enumerable: true },
    delete: { enumerable: true },
    get: { enumerable: true },
    has: { enumerable: true },
    set: { enumerable: true },
    keys: { enumerable: true },
    values: { enumerable: true },
    entries: { enumerable: true },
    forEach: { enumerable: true },
    size: { enumerable: true },
    [Symbol.toStringTag]: { value: "CSSFontFeatureValuesMap", configurable: true },
    [Symbol.iterator]: { value: CSSFontFeatureValuesMap.prototype.entries, configurable: true, writable: true }
  });
  ctorRegistry[interfaceName] = CSSFontFeatureValuesMap;

  ctorRegistry["CSSFontFeatureValuesMap Iterator"] = Object.create(ctorRegistry["%IteratorPrototype%"], {
    [Symbol.toStringTag]: {
      configurable: true,
      value: "CSSFontFeatureValuesMap Iterator"
    }
  });
  utils.define(ctorRegistry["CSSFontFeatureValuesMap Iterator"], {
    next() {
      const internal = this && this[utils.iterInternalSymbol];
      if (!internal) {
        throw new globalObject.TypeError(
          "next() called on a value that is not a CSSFontFeatureValuesMap iterator object"
        );
      }

      const { target, kind, index } = internal;
      const values = Array.from(target[implSymbol]);
      const len = values.length;
      if (index >= len) {
        return newObjectInRealm(globalObject, { value: undefined, done: true });
      }

      const pair = values[index];
      internal.index = index + 1;
      return newObjectInRealm(globalObject, utils.iteratorResult(pair.map(utils.tryWrapperForImpl), kind));
    }
  });

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: CSSFontFeatureValuesMap
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
  createDefaultIterator
};
