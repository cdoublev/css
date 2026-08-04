import conversions from "webidl-conversions";
import * as utils from "./utils.js";
import Impl from "./CSSStyleDeclaration-impl.js";

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;

const interfaceName = "CSSStyleDeclaration";

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
  throw new globalObject.TypeError(`${context} is not of type 'CSSStyleDeclaration'.`);
};

function makeWrapper(globalObject, newTarget) {
  let proto;
  if (newTarget !== undefined) {
    proto = newTarget.prototype;
  }

  if (!utils.isObject(proto)) {
    proto = globalObject[ctorRegistrySymbol]["CSSStyleDeclaration"].prototype;
  }

  return Object.create(proto);
}

function makeProxy(wrapper, globalObject) {
  let proxyHandler = proxyHandlerCache.get(globalObject);
  if (proxyHandler === undefined) {
    proxyHandler = new ProxyHandler(globalObject);
    proxyHandlerCache.set(globalObject, proxyHandler);
  }
  return new Proxy(wrapper, proxyHandler);
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

  wrapper = makeProxy(wrapper, globalObject);

  wrapper[implSymbol][utils.wrapperSymbol] = wrapper;
  if (Impl.init) {
    Impl.init(wrapper[implSymbol]);
  }
  return wrapper;
};

const createNew = (globalObject, newTarget) => {
  let wrapper = makeWrapper(globalObject, newTarget);

  _internalSetup(wrapper, globalObject);
  Object.defineProperty(wrapper, implSymbol, {
    value: Object.create(Impl.prototype),
    configurable: true
  });

  wrapper = makeProxy(wrapper, globalObject);

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
  class CSSStyleDeclaration {
    constructor() {
      throw new globalObject.TypeError("Illegal constructor");
    }

    getPropertyPriority(property) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'getPropertyPriority' called on an object that is not a valid instance of CSSStyleDeclaration."
        );
      }

      if (arguments.length < 1) {
        throw new globalObject.TypeError(
          `Failed to execute 'getPropertyPriority' on 'CSSStyleDeclaration': 1 argument required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'getPropertyPriority' on 'CSSStyleDeclaration': parameter 1",
          globals: globalObject
        });
        args.push(curArg);
      }
      return utils.tryWrapperForImpl(esValue[implSymbol].getPropertyPriority(...args));
    }

    getPropertyValue(property) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'getPropertyValue' called on an object that is not a valid instance of CSSStyleDeclaration."
        );
      }

      if (arguments.length < 1) {
        throw new globalObject.TypeError(
          `Failed to execute 'getPropertyValue' on 'CSSStyleDeclaration': 1 argument required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'getPropertyValue' on 'CSSStyleDeclaration': parameter 1",
          globals: globalObject
        });
        args.push(curArg);
      }
      return utils.tryWrapperForImpl(esValue[implSymbol].getPropertyValue(...args));
    }

    item(index) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'item' called on an object that is not a valid instance of CSSStyleDeclaration."
        );
      }

      if (arguments.length < 1) {
        throw new globalObject.TypeError(
          `Failed to execute 'item' on 'CSSStyleDeclaration': 1 argument required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["unsigned long"](curArg, {
          context: "Failed to execute 'item' on 'CSSStyleDeclaration': parameter 1",
          globals: globalObject
        });
        args.push(curArg);
      }
      return utils.tryWrapperForImpl(esValue[implSymbol].item(...args));
    }

    removeProperty(property) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'removeProperty' called on an object that is not a valid instance of CSSStyleDeclaration."
        );
      }

      if (arguments.length < 1) {
        throw new globalObject.TypeError(
          `Failed to execute 'removeProperty' on 'CSSStyleDeclaration': 1 argument required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'removeProperty' on 'CSSStyleDeclaration': parameter 1",
          globals: globalObject
        });
        args.push(curArg);
      }
      return utils.tryWrapperForImpl(esValue[implSymbol].removeProperty(...args));
    }

    setProperty(property, value) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'setProperty' called on an object that is not a valid instance of CSSStyleDeclaration."
        );
      }

      if (arguments.length < 2) {
        throw new globalObject.TypeError(
          `Failed to execute 'setProperty' on 'CSSStyleDeclaration': 2 arguments required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'setProperty' on 'CSSStyleDeclaration': parameter 1",
          globals: globalObject
        });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'setProperty' on 'CSSStyleDeclaration': parameter 2",
          globals: globalObject,
          treatNullAsEmptyString: true
        });
        args.push(curArg);
      }
      {
        let curArg = arguments[2];
        if (curArg !== undefined) {
          curArg = conversions["DOMString"](curArg, {
            context: "Failed to execute 'setProperty' on 'CSSStyleDeclaration': parameter 3",
            globals: globalObject,
            treatNullAsEmptyString: true
          });
        } else {
          curArg = "";
        }
        args.push(curArg);
      }
      return esValue[implSymbol].setProperty(...args);
    }

    get cssFloat() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get cssFloat' called on an object that is not a valid instance of CSSStyleDeclaration."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["cssFloat"]);
    }

    set cssFloat(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set cssFloat' called on an object that is not a valid instance of CSSStyleDeclaration."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'cssFloat' property on 'CSSStyleDeclaration': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol]["cssFloat"] = V;
    }

    get cssText() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get cssText' called on an object that is not a valid instance of CSSStyleDeclaration."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["cssText"]);
    }

    set cssText(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set cssText' called on an object that is not a valid instance of CSSStyleDeclaration."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'cssText' property on 'CSSStyleDeclaration': The provided value",
        globals: globalObject
      });

      esValue[implSymbol]["cssText"] = V;
    }

    get length() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get length' called on an object that is not a valid instance of CSSStyleDeclaration."
        );
      }

      return esValue[implSymbol]["length"];
    }

    get parentRule() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get parentRule' called on an object that is not a valid instance of CSSStyleDeclaration."
        );
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["parentRule"]);
    }
  }
  Object.defineProperties(CSSStyleDeclaration.prototype, {
    getPropertyPriority: { enumerable: true },
    getPropertyValue: { enumerable: true },
    item: { enumerable: true },
    removeProperty: { enumerable: true },
    setProperty: { enumerable: true },
    cssFloat: { enumerable: true },
    cssText: { enumerable: true },
    length: { enumerable: true },
    parentRule: { enumerable: true },
    [Symbol.toStringTag]: { value: "CSSStyleDeclaration", configurable: true },
    [Symbol.iterator]: { value: globalObject.Array.prototype[Symbol.iterator], configurable: true, writable: true }
  });
  ctorRegistry[interfaceName] = CSSStyleDeclaration;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: CSSStyleDeclaration
  });
};

const proxyHandlerCache = new WeakMap();
class ProxyHandler {
  constructor(globalObject) {
    this._globalObject = globalObject;
  }

  get(target, P, receiver) {
    if (typeof P === "symbol") {
      return Reflect.get(target, P, receiver);
    }
    const desc = this.getOwnPropertyDescriptor(target, P);
    if (desc === undefined) {
      const parent = Object.getPrototypeOf(target);
      if (parent === null) {
        return undefined;
      }
      return Reflect.get(target, P, receiver);
    }
    if (!desc.get && !desc.set) {
      return desc.value;
    }
    const getter = desc.get;
    if (getter === undefined) {
      return undefined;
    }
    return Reflect.apply(getter, receiver, []);
  }

  has(target, P) {
    if (typeof P === "symbol") {
      return Reflect.has(target, P);
    }
    const desc = this.getOwnPropertyDescriptor(target, P);
    if (desc !== undefined) {
      return true;
    }
    const parent = Object.getPrototypeOf(target);
    if (parent !== null) {
      return Reflect.has(parent, P);
    }
    return false;
  }

  ownKeys(target) {
    const keys = new Set();

    for (const key of target[implSymbol][utils.supportedPropertyIndices]) {
      keys.add(`${key}`);
    }

    for (const key of Reflect.ownKeys(target)) {
      keys.add(key);
    }
    return [...keys];
  }

  getOwnPropertyDescriptor(target, P) {
    if (typeof P === "symbol") {
      return Reflect.getOwnPropertyDescriptor(target, P);
    }
    let ignoreNamedProps = false;

    if (utils.isArrayIndexPropName(P)) {
      const index = P >>> 0;

      if (target[implSymbol][utils.supportsPropertyIndex](index)) {
        const indexedValue = target[implSymbol].item(index);
        return {
          writable: false,
          enumerable: true,
          configurable: true,
          value: utils.tryWrapperForImpl(indexedValue)
        };
      }
      ignoreNamedProps = true;
    }

    return Reflect.getOwnPropertyDescriptor(target, P);
  }

  set(target, P, V, receiver) {
    if (typeof P === "symbol") {
      return Reflect.set(target, P, V, receiver);
    }
    // The `receiver` argument refers to the Proxy exotic object or an object
    // that inherits from it, whereas `target` refers to the Proxy target:
    if (target[implSymbol][utils.wrapperSymbol] === receiver) {
      const globalObject = this._globalObject;
    }
    let ownDesc;

    if (utils.isArrayIndexPropName(P)) {
      const index = P >>> 0;

      if (target[implSymbol][utils.supportsPropertyIndex](index)) {
        const indexedValue = target[implSymbol].item(index);
        ownDesc = {
          writable: false,
          enumerable: true,
          configurable: true,
          value: utils.tryWrapperForImpl(indexedValue)
        };
      }
    }

    if (ownDesc === undefined) {
      ownDesc = Reflect.getOwnPropertyDescriptor(target, P);
    }
    return utils.ordinarySetWithOwnDescriptor(target, P, V, receiver, ownDesc);
  }

  defineProperty(target, P, desc) {
    if (typeof P === "symbol") {
      return Reflect.defineProperty(target, P, desc);
    }

    const globalObject = this._globalObject;

    if (utils.isArrayIndexPropName(P)) {
      return false;
    }

    return Reflect.defineProperty(target, P, desc);
  }

  deleteProperty(target, P) {
    if (typeof P === "symbol") {
      return Reflect.deleteProperty(target, P);
    }

    const globalObject = this._globalObject;

    if (utils.isArrayIndexPropName(P)) {
      const index = P >>> 0;
      return !target[implSymbol][utils.supportsPropertyIndex](index);
    }

    return Reflect.deleteProperty(target, P);
  }

  preventExtensions() {
    return false;
  }
}

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
