import conversions from "webidl-conversions";
import * as utils from "./utils.js";
import Impl from "./CSSPositionTryDescriptors-impl.js";

import CSSStyleDeclaration from "./CSSStyleDeclaration.js";

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const inheritance = "CSSStyleDeclaration";

const interfaceName = "CSSPositionTryDescriptors";

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
  throw new globalObject.TypeError(`${context} is not of type 'CSSPositionTryDescriptors'.`);
};

function makeWrapper(globalObject, newTarget) {
  let proto;
  if (newTarget !== undefined) {
    proto = newTarget.prototype;
  }

  if (!utils.isObject(proto)) {
    proto = globalObject[ctorRegistrySymbol]["CSSPositionTryDescriptors"].prototype;
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

const _internalSetup = (wrapper, globalObject) => {
  CSSStyleDeclaration._internalSetup(wrapper, globalObject);
};

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
  class CSSPositionTryDescriptors extends globalObject.CSSStyleDeclaration {
    constructor() {
      throw new globalObject.TypeError("Illegal constructor");
    }

    get positionAnchor() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get positionAnchor' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("position-anchor");
    }

    set positionAnchor(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set positionAnchor' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'positionAnchor' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("position-anchor", V);
    }

    get "position-anchor"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get position-anchor' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("position-anchor");
    }

    set "position-anchor"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set position-anchor' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'position-anchor' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("position-anchor", V);
    }

    get positionArea() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get positionArea' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("position-area");
    }

    set positionArea(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set positionArea' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'positionArea' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("position-area", V);
    }

    get "position-area"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get position-area' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("position-area");
    }

    set "position-area"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set position-area' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'position-area' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("position-area", V);
    }

    get alignSelf() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get alignSelf' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("align-self");
    }

    set alignSelf(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set alignSelf' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'alignSelf' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("align-self", V);
    }

    get "align-self"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get align-self' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("align-self");
    }

    set "align-self"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set align-self' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'align-self' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("align-self", V);
    }

    get blockSize() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get blockSize' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("block-size");
    }

    set blockSize(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set blockSize' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'blockSize' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("block-size", V);
    }

    get "block-size"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get block-size' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("block-size");
    }

    set "block-size"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set block-size' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'block-size' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("block-size", V);
    }

    get bottom() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get bottom' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("bottom");
    }

    set bottom(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set bottom' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'bottom' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("bottom", V);
    }

    get height() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get height' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("height");
    }

    set height(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set height' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'height' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("height", V);
    }

    get inlineSize() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get inlineSize' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("inline-size");
    }

    set inlineSize(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set inlineSize' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'inlineSize' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("inline-size", V);
    }

    get "inline-size"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get inline-size' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("inline-size");
    }

    set "inline-size"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set inline-size' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'inline-size' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("inline-size", V);
    }

    get inset() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get inset' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("inset");
    }

    set inset(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set inset' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'inset' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("inset", V);
    }

    get insetBlock() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get insetBlock' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("inset-block");
    }

    set insetBlock(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set insetBlock' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'insetBlock' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("inset-block", V);
    }

    get "inset-block"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get inset-block' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("inset-block");
    }

    set "inset-block"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set inset-block' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'inset-block' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("inset-block", V);
    }

    get insetBlockEnd() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get insetBlockEnd' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("inset-block-end");
    }

    set insetBlockEnd(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set insetBlockEnd' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'insetBlockEnd' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("inset-block-end", V);
    }

    get "inset-block-end"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get inset-block-end' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("inset-block-end");
    }

    set "inset-block-end"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set inset-block-end' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'inset-block-end' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("inset-block-end", V);
    }

    get insetBlockStart() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get insetBlockStart' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("inset-block-start");
    }

    set insetBlockStart(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set insetBlockStart' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'insetBlockStart' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("inset-block-start", V);
    }

    get "inset-block-start"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get inset-block-start' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("inset-block-start");
    }

    set "inset-block-start"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set inset-block-start' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'inset-block-start' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("inset-block-start", V);
    }

    get insetInline() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get insetInline' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("inset-inline");
    }

    set insetInline(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set insetInline' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'insetInline' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("inset-inline", V);
    }

    get "inset-inline"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get inset-inline' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("inset-inline");
    }

    set "inset-inline"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set inset-inline' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'inset-inline' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("inset-inline", V);
    }

    get insetInlineEnd() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get insetInlineEnd' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("inset-inline-end");
    }

    set insetInlineEnd(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set insetInlineEnd' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'insetInlineEnd' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("inset-inline-end", V);
    }

    get "inset-inline-end"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get inset-inline-end' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("inset-inline-end");
    }

    set "inset-inline-end"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set inset-inline-end' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'inset-inline-end' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("inset-inline-end", V);
    }

    get insetInlineStart() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get insetInlineStart' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("inset-inline-start");
    }

    set insetInlineStart(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set insetInlineStart' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'insetInlineStart' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("inset-inline-start", V);
    }

    get "inset-inline-start"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get inset-inline-start' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("inset-inline-start");
    }

    set "inset-inline-start"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set inset-inline-start' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'inset-inline-start' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("inset-inline-start", V);
    }

    get justifySelf() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get justifySelf' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("justify-self");
    }

    set justifySelf(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set justifySelf' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'justifySelf' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("justify-self", V);
    }

    get "justify-self"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get justify-self' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("justify-self");
    }

    set "justify-self"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set justify-self' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'justify-self' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("justify-self", V);
    }

    get left() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get left' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("left");
    }

    set left(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set left' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'left' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("left", V);
    }

    get margin() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin");
    }

    set margin(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin", V);
    }

    get marginBlock() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get marginBlock' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-block");
    }

    set marginBlock(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set marginBlock' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'marginBlock' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-block", V);
    }

    get "margin-block"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin-block' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-block");
    }

    set "margin-block"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin-block' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin-block' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-block", V);
    }

    get marginBlockEnd() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get marginBlockEnd' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-block-end");
    }

    set marginBlockEnd(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set marginBlockEnd' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'marginBlockEnd' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-block-end", V);
    }

    get "margin-block-end"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin-block-end' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-block-end");
    }

    set "margin-block-end"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin-block-end' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin-block-end' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-block-end", V);
    }

    get marginBlockStart() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get marginBlockStart' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-block-start");
    }

    set marginBlockStart(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set marginBlockStart' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'marginBlockStart' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-block-start", V);
    }

    get "margin-block-start"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin-block-start' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-block-start");
    }

    set "margin-block-start"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin-block-start' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin-block-start' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-block-start", V);
    }

    get marginBottom() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get marginBottom' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-bottom");
    }

    set marginBottom(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set marginBottom' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'marginBottom' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-bottom", V);
    }

    get "margin-bottom"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin-bottom' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-bottom");
    }

    set "margin-bottom"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin-bottom' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin-bottom' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-bottom", V);
    }

    get marginInline() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get marginInline' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-inline");
    }

    set marginInline(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set marginInline' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'marginInline' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-inline", V);
    }

    get "margin-inline"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin-inline' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-inline");
    }

    set "margin-inline"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin-inline' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin-inline' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-inline", V);
    }

    get marginInlineEnd() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get marginInlineEnd' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-inline-end");
    }

    set marginInlineEnd(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set marginInlineEnd' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'marginInlineEnd' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-inline-end", V);
    }

    get "margin-inline-end"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin-inline-end' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-inline-end");
    }

    set "margin-inline-end"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin-inline-end' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin-inline-end' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-inline-end", V);
    }

    get marginInlineStart() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get marginInlineStart' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-inline-start");
    }

    set marginInlineStart(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set marginInlineStart' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'marginInlineStart' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-inline-start", V);
    }

    get "margin-inline-start"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin-inline-start' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-inline-start");
    }

    set "margin-inline-start"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin-inline-start' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin-inline-start' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-inline-start", V);
    }

    get marginLeft() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get marginLeft' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-left");
    }

    set marginLeft(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set marginLeft' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'marginLeft' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-left", V);
    }

    get "margin-left"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin-left' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-left");
    }

    set "margin-left"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin-left' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin-left' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-left", V);
    }

    get marginRight() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get marginRight' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-right");
    }

    set marginRight(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set marginRight' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'marginRight' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-right", V);
    }

    get "margin-right"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin-right' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-right");
    }

    set "margin-right"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin-right' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin-right' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-right", V);
    }

    get marginTop() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get marginTop' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-top");
    }

    set marginTop(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set marginTop' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'marginTop' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-top", V);
    }

    get "margin-top"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin-top' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-top");
    }

    set "margin-top"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin-top' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin-top' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-top", V);
    }

    get maxBlockSize() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get maxBlockSize' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("max-block-size");
    }

    set maxBlockSize(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set maxBlockSize' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'maxBlockSize' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("max-block-size", V);
    }

    get "max-block-size"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get max-block-size' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("max-block-size");
    }

    set "max-block-size"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set max-block-size' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'max-block-size' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("max-block-size", V);
    }

    get maxHeight() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get maxHeight' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("max-height");
    }

    set maxHeight(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set maxHeight' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'maxHeight' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("max-height", V);
    }

    get "max-height"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get max-height' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("max-height");
    }

    set "max-height"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set max-height' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'max-height' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("max-height", V);
    }

    get maxInlineSize() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get maxInlineSize' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("max-inline-size");
    }

    set maxInlineSize(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set maxInlineSize' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'maxInlineSize' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("max-inline-size", V);
    }

    get "max-inline-size"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get max-inline-size' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("max-inline-size");
    }

    set "max-inline-size"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set max-inline-size' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'max-inline-size' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("max-inline-size", V);
    }

    get maxWidth() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get maxWidth' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("max-width");
    }

    set maxWidth(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set maxWidth' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'maxWidth' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("max-width", V);
    }

    get "max-width"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get max-width' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("max-width");
    }

    set "max-width"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set max-width' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'max-width' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("max-width", V);
    }

    get minBlockSize() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get minBlockSize' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("min-block-size");
    }

    set minBlockSize(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set minBlockSize' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'minBlockSize' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("min-block-size", V);
    }

    get "min-block-size"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get min-block-size' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("min-block-size");
    }

    set "min-block-size"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set min-block-size' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'min-block-size' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("min-block-size", V);
    }

    get minHeight() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get minHeight' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("min-height");
    }

    set minHeight(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set minHeight' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'minHeight' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("min-height", V);
    }

    get "min-height"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get min-height' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("min-height");
    }

    set "min-height"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set min-height' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'min-height' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("min-height", V);
    }

    get minInlineSize() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get minInlineSize' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("min-inline-size");
    }

    set minInlineSize(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set minInlineSize' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'minInlineSize' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("min-inline-size", V);
    }

    get "min-inline-size"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get min-inline-size' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("min-inline-size");
    }

    set "min-inline-size"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set min-inline-size' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'min-inline-size' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("min-inline-size", V);
    }

    get minWidth() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get minWidth' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("min-width");
    }

    set minWidth(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set minWidth' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'minWidth' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("min-width", V);
    }

    get "min-width"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get min-width' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("min-width");
    }

    set "min-width"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set min-width' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'min-width' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("min-width", V);
    }

    get placeSelf() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get placeSelf' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("place-self");
    }

    set placeSelf(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set placeSelf' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'placeSelf' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("place-self", V);
    }

    get "place-self"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get place-self' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("place-self");
    }

    set "place-self"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set place-self' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'place-self' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("place-self", V);
    }

    get right() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get right' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("right");
    }

    set right(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set right' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'right' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("right", V);
    }

    get top() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get top' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("top");
    }

    set top(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set top' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'top' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("top", V);
    }

    get width() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get width' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("width");
    }

    set width(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set width' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'width' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("width", V);
    }

    get WebkitAlignSelf() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get WebkitAlignSelf' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("-webkit-align-self");
    }

    set WebkitAlignSelf(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set WebkitAlignSelf' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'WebkitAlignSelf' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("-webkit-align-self", V);
    }

    get webkitAlignSelf() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get webkitAlignSelf' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("-webkit-align-self");
    }

    set webkitAlignSelf(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set webkitAlignSelf' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'webkitAlignSelf' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("-webkit-align-self", V);
    }

    get "-webkit-align-self"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get -webkit-align-self' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("-webkit-align-self");
    }

    set "-webkit-align-self"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set -webkit-align-self' called on an object that is not a valid instance of CSSPositionTryDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the '-webkit-align-self' property on 'CSSPositionTryDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("-webkit-align-self", V);
    }
  }
  Object.defineProperties(CSSPositionTryDescriptors.prototype, {
    positionAnchor: { enumerable: true },
    "position-anchor": { enumerable: true },
    positionArea: { enumerable: true },
    "position-area": { enumerable: true },
    alignSelf: { enumerable: true },
    "align-self": { enumerable: true },
    blockSize: { enumerable: true },
    "block-size": { enumerable: true },
    bottom: { enumerable: true },
    height: { enumerable: true },
    inlineSize: { enumerable: true },
    "inline-size": { enumerable: true },
    inset: { enumerable: true },
    insetBlock: { enumerable: true },
    "inset-block": { enumerable: true },
    insetBlockEnd: { enumerable: true },
    "inset-block-end": { enumerable: true },
    insetBlockStart: { enumerable: true },
    "inset-block-start": { enumerable: true },
    insetInline: { enumerable: true },
    "inset-inline": { enumerable: true },
    insetInlineEnd: { enumerable: true },
    "inset-inline-end": { enumerable: true },
    insetInlineStart: { enumerable: true },
    "inset-inline-start": { enumerable: true },
    justifySelf: { enumerable: true },
    "justify-self": { enumerable: true },
    left: { enumerable: true },
    margin: { enumerable: true },
    marginBlock: { enumerable: true },
    "margin-block": { enumerable: true },
    marginBlockEnd: { enumerable: true },
    "margin-block-end": { enumerable: true },
    marginBlockStart: { enumerable: true },
    "margin-block-start": { enumerable: true },
    marginBottom: { enumerable: true },
    "margin-bottom": { enumerable: true },
    marginInline: { enumerable: true },
    "margin-inline": { enumerable: true },
    marginInlineEnd: { enumerable: true },
    "margin-inline-end": { enumerable: true },
    marginInlineStart: { enumerable: true },
    "margin-inline-start": { enumerable: true },
    marginLeft: { enumerable: true },
    "margin-left": { enumerable: true },
    marginRight: { enumerable: true },
    "margin-right": { enumerable: true },
    marginTop: { enumerable: true },
    "margin-top": { enumerable: true },
    maxBlockSize: { enumerable: true },
    "max-block-size": { enumerable: true },
    maxHeight: { enumerable: true },
    "max-height": { enumerable: true },
    maxInlineSize: { enumerable: true },
    "max-inline-size": { enumerable: true },
    maxWidth: { enumerable: true },
    "max-width": { enumerable: true },
    minBlockSize: { enumerable: true },
    "min-block-size": { enumerable: true },
    minHeight: { enumerable: true },
    "min-height": { enumerable: true },
    minInlineSize: { enumerable: true },
    "min-inline-size": { enumerable: true },
    minWidth: { enumerable: true },
    "min-width": { enumerable: true },
    placeSelf: { enumerable: true },
    "place-self": { enumerable: true },
    right: { enumerable: true },
    top: { enumerable: true },
    width: { enumerable: true },
    WebkitAlignSelf: { enumerable: true },
    webkitAlignSelf: { enumerable: true },
    "-webkit-align-self": { enumerable: true },
    [Symbol.toStringTag]: { value: "CSSPositionTryDescriptors", configurable: true },
    [Symbol.iterator]: { value: globalObject.Array.prototype[Symbol.iterator], configurable: true, writable: true }
  });
  ctorRegistry[interfaceName] = CSSPositionTryDescriptors;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: CSSPositionTryDescriptors
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
  setup,
  inheritance
};
