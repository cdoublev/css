import conversions from "webidl-conversions";
import * as utils from "./utils.js";
import Impl from "./CSSPageDescriptors-impl.js";

import CSSStyleDeclaration from "./CSSStyleDeclaration.js";

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const inheritance = "CSSStyleDeclaration";

const interfaceName = "CSSPageDescriptors";

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
  throw new globalObject.TypeError(`${context} is not of type 'CSSPageDescriptors'.`);
};

function makeWrapper(globalObject, newTarget) {
  let proto;
  if (newTarget !== undefined) {
    proto = newTarget.prototype;
  }

  if (!utils.isObject(proto)) {
    proto = globalObject[ctorRegistrySymbol]["CSSPageDescriptors"].prototype;
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
  class CSSPageDescriptors extends globalObject.CSSStyleDeclaration {
    constructor() {
      throw new globalObject.TypeError("Illegal constructor");
    }

    get bleed() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get bleed' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("bleed");
    }

    set bleed(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set bleed' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'bleed' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("bleed", V);
    }

    get marks() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get marks' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("marks");
    }

    set marks(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set marks' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'marks' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("marks", V);
    }

    get pageMarginSafety() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get pageMarginSafety' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("page-margin-safety");
    }

    set pageMarginSafety(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set pageMarginSafety' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'pageMarginSafety' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("page-margin-safety", V);
    }

    get "page-margin-safety"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get page-margin-safety' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("page-margin-safety");
    }

    set "page-margin-safety"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set page-margin-safety' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'page-margin-safety' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("page-margin-safety", V);
    }

    get pageOrientation() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get pageOrientation' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("page-orientation");
    }

    set pageOrientation(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set pageOrientation' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'pageOrientation' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("page-orientation", V);
    }

    get "page-orientation"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get page-orientation' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("page-orientation");
    }

    set "page-orientation"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set page-orientation' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'page-orientation' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("page-orientation", V);
    }

    get size() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get size' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("size");
    }

    set size(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set size' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'size' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("size", V);
    }

    get background() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get background' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("background");
    }

    set background(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set background' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'background' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("background", V);
    }

    get backgroundAttachment() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get backgroundAttachment' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("background-attachment");
    }

    set backgroundAttachment(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set backgroundAttachment' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'backgroundAttachment' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("background-attachment", V);
    }

    get "background-attachment"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get background-attachment' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("background-attachment");
    }

    set "background-attachment"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set background-attachment' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'background-attachment' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("background-attachment", V);
    }

    get backgroundColor() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get backgroundColor' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("background-color");
    }

    set backgroundColor(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set backgroundColor' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'backgroundColor' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("background-color", V);
    }

    get "background-color"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get background-color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("background-color");
    }

    set "background-color"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set background-color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'background-color' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("background-color", V);
    }

    get backgroundImage() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get backgroundImage' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("background-image");
    }

    set backgroundImage(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set backgroundImage' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'backgroundImage' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("background-image", V);
    }

    get "background-image"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get background-image' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("background-image");
    }

    set "background-image"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set background-image' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'background-image' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("background-image", V);
    }

    get backgroundPosition() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get backgroundPosition' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("background-position");
    }

    set backgroundPosition(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set backgroundPosition' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'backgroundPosition' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("background-position", V);
    }

    get "background-position"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get background-position' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("background-position");
    }

    set "background-position"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set background-position' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'background-position' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("background-position", V);
    }

    get backgroundRepeat() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get backgroundRepeat' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("background-repeat");
    }

    set backgroundRepeat(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set backgroundRepeat' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'backgroundRepeat' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("background-repeat", V);
    }

    get "background-repeat"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get background-repeat' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("background-repeat");
    }

    set "background-repeat"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set background-repeat' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'background-repeat' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("background-repeat", V);
    }

    get border() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border");
    }

    set border(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border", V);
    }

    get borderBottom() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderBottom' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-bottom");
    }

    set borderBottom(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderBottom' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderBottom' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-bottom", V);
    }

    get "border-bottom"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-bottom' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-bottom");
    }

    set "border-bottom"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-bottom' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-bottom' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-bottom", V);
    }

    get borderBottomColor() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderBottomColor' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-bottom-color");
    }

    set borderBottomColor(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderBottomColor' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderBottomColor' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-bottom-color", V);
    }

    get "border-bottom-color"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-bottom-color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-bottom-color");
    }

    set "border-bottom-color"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-bottom-color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-bottom-color' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-bottom-color", V);
    }

    get borderBottomStyle() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderBottomStyle' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-bottom-style");
    }

    set borderBottomStyle(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderBottomStyle' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderBottomStyle' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-bottom-style", V);
    }

    get "border-bottom-style"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-bottom-style' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-bottom-style");
    }

    set "border-bottom-style"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-bottom-style' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-bottom-style' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-bottom-style", V);
    }

    get borderBottomWidth() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderBottomWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-bottom-width");
    }

    set borderBottomWidth(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderBottomWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderBottomWidth' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-bottom-width", V);
    }

    get "border-bottom-width"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-bottom-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-bottom-width");
    }

    set "border-bottom-width"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-bottom-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-bottom-width' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-bottom-width", V);
    }

    get borderColor() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderColor' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-color");
    }

    set borderColor(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderColor' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderColor' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-color", V);
    }

    get "border-color"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-color");
    }

    set "border-color"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-color' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-color", V);
    }

    get borderLeft() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderLeft' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-left");
    }

    set borderLeft(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderLeft' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderLeft' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-left", V);
    }

    get "border-left"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-left' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-left");
    }

    set "border-left"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-left' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-left' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-left", V);
    }

    get borderLeftColor() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderLeftColor' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-left-color");
    }

    set borderLeftColor(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderLeftColor' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderLeftColor' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-left-color", V);
    }

    get "border-left-color"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-left-color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-left-color");
    }

    set "border-left-color"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-left-color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-left-color' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-left-color", V);
    }

    get borderLeftStyle() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderLeftStyle' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-left-style");
    }

    set borderLeftStyle(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderLeftStyle' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderLeftStyle' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-left-style", V);
    }

    get "border-left-style"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-left-style' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-left-style");
    }

    set "border-left-style"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-left-style' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-left-style' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-left-style", V);
    }

    get borderLeftWidth() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderLeftWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-left-width");
    }

    set borderLeftWidth(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderLeftWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderLeftWidth' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-left-width", V);
    }

    get "border-left-width"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-left-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-left-width");
    }

    set "border-left-width"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-left-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-left-width' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-left-width", V);
    }

    get borderRight() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderRight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-right");
    }

    set borderRight(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderRight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderRight' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-right", V);
    }

    get "border-right"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-right' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-right");
    }

    set "border-right"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-right' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-right' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-right", V);
    }

    get borderRightColor() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderRightColor' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-right-color");
    }

    set borderRightColor(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderRightColor' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderRightColor' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-right-color", V);
    }

    get "border-right-color"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-right-color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-right-color");
    }

    set "border-right-color"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-right-color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-right-color' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-right-color", V);
    }

    get borderRightStyle() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderRightStyle' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-right-style");
    }

    set borderRightStyle(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderRightStyle' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderRightStyle' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-right-style", V);
    }

    get "border-right-style"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-right-style' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-right-style");
    }

    set "border-right-style"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-right-style' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-right-style' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-right-style", V);
    }

    get borderRightWidth() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderRightWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-right-width");
    }

    set borderRightWidth(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderRightWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderRightWidth' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-right-width", V);
    }

    get "border-right-width"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-right-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-right-width");
    }

    set "border-right-width"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-right-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-right-width' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-right-width", V);
    }

    get borderShortStyle() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderShortStyle' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-short-style");
    }

    set borderShortStyle(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderShortStyle' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderShortStyle' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-short-style", V);
    }

    get "border-short-style"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-short-style' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-short-style");
    }

    set "border-short-style"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-short-style' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-short-style' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-short-style", V);
    }

    get borderTop() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderTop' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-top");
    }

    set borderTop(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderTop' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderTop' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-top", V);
    }

    get "border-top"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-top' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-top");
    }

    set "border-top"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-top' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-top' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-top", V);
    }

    get borderTopColor() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderTopColor' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-top-color");
    }

    set borderTopColor(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderTopColor' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderTopColor' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-top-color", V);
    }

    get "border-top-color"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-top-color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-top-color");
    }

    set "border-top-color"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-top-color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-top-color' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-top-color", V);
    }

    get borderTopStyle() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderTopStyle' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-top-style");
    }

    set borderTopStyle(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderTopStyle' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderTopStyle' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-top-style", V);
    }

    get "border-top-style"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-top-style' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-top-style");
    }

    set "border-top-style"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-top-style' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-top-style' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-top-style", V);
    }

    get borderTopWidth() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderTopWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-top-width");
    }

    set borderTopWidth(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderTopWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderTopWidth' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-top-width", V);
    }

    get "border-top-width"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-top-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-top-width");
    }

    set "border-top-width"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-top-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-top-width' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-top-width", V);
    }

    get borderWidth() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get borderWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-width");
    }

    set borderWidth(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set borderWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'borderWidth' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-width", V);
    }

    get "border-width"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get border-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("border-width");
    }

    set "border-width"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set border-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'border-width' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("border-width", V);
    }

    get color() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("color");
    }

    set color(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'color' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("color", V);
    }

    get counterIncrement() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get counterIncrement' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("counter-increment");
    }

    set counterIncrement(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set counterIncrement' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'counterIncrement' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("counter-increment", V);
    }

    get "counter-increment"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get counter-increment' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("counter-increment");
    }

    set "counter-increment"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set counter-increment' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'counter-increment' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("counter-increment", V);
    }

    get counterReset() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get counterReset' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("counter-reset");
    }

    set counterReset(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set counterReset' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'counterReset' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("counter-reset", V);
    }

    get "counter-reset"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get counter-reset' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("counter-reset");
    }

    set "counter-reset"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set counter-reset' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'counter-reset' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("counter-reset", V);
    }

    get direction() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get direction' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("direction");
    }

    set direction(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set direction' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'direction' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("direction", V);
    }

    get font() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font");
    }

    set font(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font", V);
    }

    get fontFamily() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontFamily' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-family");
    }

    set fontFamily(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontFamily' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontFamily' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-family", V);
    }

    get "font-family"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-family' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-family");
    }

    set "font-family"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-family' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-family' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-family", V);
    }

    get fontSize() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontSize' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-size");
    }

    set fontSize(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontSize' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontSize' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-size", V);
    }

    get "font-size"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-size' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-size");
    }

    set "font-size"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-size' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-size' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-size", V);
    }

    get fontStyle() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontStyle' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-style");
    }

    set fontStyle(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontStyle' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontStyle' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-style", V);
    }

    get "font-style"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-style' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-style");
    }

    set "font-style"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-style' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-style' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-style", V);
    }

    get fontVariant() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontVariant' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-variant");
    }

    set fontVariant(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontVariant' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontVariant' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-variant", V);
    }

    get "font-variant"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-variant' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-variant");
    }

    set "font-variant"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-variant' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-variant' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-variant", V);
    }

    get fontWeight() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontWeight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-weight");
    }

    set fontWeight(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontWeight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontWeight' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-weight", V);
    }

    get "font-weight"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-weight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-weight");
    }

    set "font-weight"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-weight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-weight' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-weight", V);
    }

    get height() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get height' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("height");
    }

    set height(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set height' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'height' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("height", V);
    }

    get letterSpacing() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get letterSpacing' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("letter-spacing");
    }

    set letterSpacing(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set letterSpacing' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'letterSpacing' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("letter-spacing", V);
    }

    get "letter-spacing"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get letter-spacing' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("letter-spacing");
    }

    set "letter-spacing"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set letter-spacing' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'letter-spacing' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("letter-spacing", V);
    }

    get lineHeight() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get lineHeight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("line-height");
    }

    set lineHeight(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set lineHeight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'lineHeight' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("line-height", V);
    }

    get "line-height"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get line-height' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("line-height");
    }

    set "line-height"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set line-height' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'line-height' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("line-height", V);
    }

    get margin() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin");
    }

    set margin(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin", V);
    }

    get marginBottom() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get marginBottom' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-bottom");
    }

    set marginBottom(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set marginBottom' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'marginBottom' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-bottom", V);
    }

    get "margin-bottom"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin-bottom' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-bottom");
    }

    set "margin-bottom"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin-bottom' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin-bottom' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-bottom", V);
    }

    get marginLeft() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get marginLeft' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-left");
    }

    set marginLeft(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set marginLeft' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'marginLeft' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-left", V);
    }

    get "margin-left"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin-left' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-left");
    }

    set "margin-left"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin-left' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin-left' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-left", V);
    }

    get marginRight() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get marginRight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-right");
    }

    set marginRight(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set marginRight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'marginRight' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-right", V);
    }

    get "margin-right"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin-right' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-right");
    }

    set "margin-right"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin-right' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin-right' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-right", V);
    }

    get marginTop() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get marginTop' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-top");
    }

    set marginTop(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set marginTop' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'marginTop' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-top", V);
    }

    get "margin-top"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get margin-top' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("margin-top");
    }

    set "margin-top"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set margin-top' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'margin-top' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("margin-top", V);
    }

    get maxHeight() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get maxHeight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("max-height");
    }

    set maxHeight(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set maxHeight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'maxHeight' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("max-height", V);
    }

    get "max-height"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get max-height' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("max-height");
    }

    set "max-height"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set max-height' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'max-height' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("max-height", V);
    }

    get maxWidth() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get maxWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("max-width");
    }

    set maxWidth(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set maxWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'maxWidth' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("max-width", V);
    }

    get "max-width"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get max-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("max-width");
    }

    set "max-width"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set max-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'max-width' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("max-width", V);
    }

    get minHeight() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get minHeight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("min-height");
    }

    set minHeight(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set minHeight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'minHeight' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("min-height", V);
    }

    get "min-height"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get min-height' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("min-height");
    }

    set "min-height"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set min-height' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'min-height' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("min-height", V);
    }

    get minWidth() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get minWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("min-width");
    }

    set minWidth(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set minWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'minWidth' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("min-width", V);
    }

    get "min-width"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get min-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("min-width");
    }

    set "min-width"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set min-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'min-width' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("min-width", V);
    }

    get outline() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get outline' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("outline");
    }

    set outline(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set outline' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'outline' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("outline", V);
    }

    get outlineColor() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get outlineColor' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("outline-color");
    }

    set outlineColor(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set outlineColor' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'outlineColor' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("outline-color", V);
    }

    get "outline-color"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get outline-color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("outline-color");
    }

    set "outline-color"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set outline-color' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'outline-color' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("outline-color", V);
    }

    get outlineStyle() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get outlineStyle' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("outline-style");
    }

    set outlineStyle(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set outlineStyle' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'outlineStyle' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("outline-style", V);
    }

    get "outline-style"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get outline-style' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("outline-style");
    }

    set "outline-style"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set outline-style' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'outline-style' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("outline-style", V);
    }

    get outlineWidth() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get outlineWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("outline-width");
    }

    set outlineWidth(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set outlineWidth' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'outlineWidth' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("outline-width", V);
    }

    get "outline-width"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get outline-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("outline-width");
    }

    set "outline-width"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set outline-width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'outline-width' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("outline-width", V);
    }

    get padding() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get padding' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("padding");
    }

    set padding(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set padding' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'padding' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("padding", V);
    }

    get paddingBottom() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get paddingBottom' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("padding-bottom");
    }

    set paddingBottom(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set paddingBottom' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'paddingBottom' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("padding-bottom", V);
    }

    get "padding-bottom"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get padding-bottom' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("padding-bottom");
    }

    set "padding-bottom"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set padding-bottom' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'padding-bottom' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("padding-bottom", V);
    }

    get paddingLeft() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get paddingLeft' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("padding-left");
    }

    set paddingLeft(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set paddingLeft' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'paddingLeft' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("padding-left", V);
    }

    get "padding-left"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get padding-left' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("padding-left");
    }

    set "padding-left"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set padding-left' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'padding-left' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("padding-left", V);
    }

    get paddingRight() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get paddingRight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("padding-right");
    }

    set paddingRight(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set paddingRight' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'paddingRight' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("padding-right", V);
    }

    get "padding-right"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get padding-right' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("padding-right");
    }

    set "padding-right"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set padding-right' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'padding-right' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("padding-right", V);
    }

    get paddingTop() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get paddingTop' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("padding-top");
    }

    set paddingTop(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set paddingTop' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'paddingTop' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("padding-top", V);
    }

    get "padding-top"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get padding-top' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("padding-top");
    }

    set "padding-top"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set padding-top' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'padding-top' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("padding-top", V);
    }

    get quotes() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get quotes' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("quotes");
    }

    set quotes(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set quotes' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'quotes' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("quotes", V);
    }

    get textAlign() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get textAlign' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("text-align");
    }

    set textAlign(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set textAlign' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'textAlign' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("text-align", V);
    }

    get "text-align"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get text-align' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("text-align");
    }

    set "text-align"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set text-align' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'text-align' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("text-align", V);
    }

    get textDecoration() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get textDecoration' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("text-decoration");
    }

    set textDecoration(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set textDecoration' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'textDecoration' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("text-decoration", V);
    }

    get "text-decoration"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get text-decoration' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("text-decoration");
    }

    set "text-decoration"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set text-decoration' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'text-decoration' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("text-decoration", V);
    }

    get textIndent() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get textIndent' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("text-indent");
    }

    set textIndent(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set textIndent' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'textIndent' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("text-indent", V);
    }

    get "text-indent"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get text-indent' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("text-indent");
    }

    set "text-indent"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set text-indent' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'text-indent' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("text-indent", V);
    }

    get textTransform() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get textTransform' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("text-transform");
    }

    set textTransform(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set textTransform' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'textTransform' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("text-transform", V);
    }

    get "text-transform"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get text-transform' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("text-transform");
    }

    set "text-transform"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set text-transform' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'text-transform' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("text-transform", V);
    }

    get visibility() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get visibility' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("visibility");
    }

    set visibility(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set visibility' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'visibility' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("visibility", V);
    }

    get whiteSpace() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get whiteSpace' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("white-space");
    }

    set whiteSpace(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set whiteSpace' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'whiteSpace' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("white-space", V);
    }

    get "white-space"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get white-space' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("white-space");
    }

    set "white-space"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set white-space' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'white-space' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("white-space", V);
    }

    get width() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("width");
    }

    set width(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set width' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'width' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("width", V);
    }

    get wordSpacing() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get wordSpacing' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("word-spacing");
    }

    set wordSpacing(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set wordSpacing' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'wordSpacing' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("word-spacing", V);
    }

    get "word-spacing"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get word-spacing' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("word-spacing");
    }

    set "word-spacing"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set word-spacing' called on an object that is not a valid instance of CSSPageDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'word-spacing' property on 'CSSPageDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("word-spacing", V);
    }
  }
  Object.defineProperties(CSSPageDescriptors.prototype, {
    bleed: { enumerable: true },
    marks: { enumerable: true },
    pageMarginSafety: { enumerable: true },
    "page-margin-safety": { enumerable: true },
    pageOrientation: { enumerable: true },
    "page-orientation": { enumerable: true },
    size: { enumerable: true },
    background: { enumerable: true },
    backgroundAttachment: { enumerable: true },
    "background-attachment": { enumerable: true },
    backgroundColor: { enumerable: true },
    "background-color": { enumerable: true },
    backgroundImage: { enumerable: true },
    "background-image": { enumerable: true },
    backgroundPosition: { enumerable: true },
    "background-position": { enumerable: true },
    backgroundRepeat: { enumerable: true },
    "background-repeat": { enumerable: true },
    border: { enumerable: true },
    borderBottom: { enumerable: true },
    "border-bottom": { enumerable: true },
    borderBottomColor: { enumerable: true },
    "border-bottom-color": { enumerable: true },
    borderBottomStyle: { enumerable: true },
    "border-bottom-style": { enumerable: true },
    borderBottomWidth: { enumerable: true },
    "border-bottom-width": { enumerable: true },
    borderColor: { enumerable: true },
    "border-color": { enumerable: true },
    borderLeft: { enumerable: true },
    "border-left": { enumerable: true },
    borderLeftColor: { enumerable: true },
    "border-left-color": { enumerable: true },
    borderLeftStyle: { enumerable: true },
    "border-left-style": { enumerable: true },
    borderLeftWidth: { enumerable: true },
    "border-left-width": { enumerable: true },
    borderRight: { enumerable: true },
    "border-right": { enumerable: true },
    borderRightColor: { enumerable: true },
    "border-right-color": { enumerable: true },
    borderRightStyle: { enumerable: true },
    "border-right-style": { enumerable: true },
    borderRightWidth: { enumerable: true },
    "border-right-width": { enumerable: true },
    borderShortStyle: { enumerable: true },
    "border-short-style": { enumerable: true },
    borderTop: { enumerable: true },
    "border-top": { enumerable: true },
    borderTopColor: { enumerable: true },
    "border-top-color": { enumerable: true },
    borderTopStyle: { enumerable: true },
    "border-top-style": { enumerable: true },
    borderTopWidth: { enumerable: true },
    "border-top-width": { enumerable: true },
    borderWidth: { enumerable: true },
    "border-width": { enumerable: true },
    color: { enumerable: true },
    counterIncrement: { enumerable: true },
    "counter-increment": { enumerable: true },
    counterReset: { enumerable: true },
    "counter-reset": { enumerable: true },
    direction: { enumerable: true },
    font: { enumerable: true },
    fontFamily: { enumerable: true },
    "font-family": { enumerable: true },
    fontSize: { enumerable: true },
    "font-size": { enumerable: true },
    fontStyle: { enumerable: true },
    "font-style": { enumerable: true },
    fontVariant: { enumerable: true },
    "font-variant": { enumerable: true },
    fontWeight: { enumerable: true },
    "font-weight": { enumerable: true },
    height: { enumerable: true },
    letterSpacing: { enumerable: true },
    "letter-spacing": { enumerable: true },
    lineHeight: { enumerable: true },
    "line-height": { enumerable: true },
    margin: { enumerable: true },
    marginBottom: { enumerable: true },
    "margin-bottom": { enumerable: true },
    marginLeft: { enumerable: true },
    "margin-left": { enumerable: true },
    marginRight: { enumerable: true },
    "margin-right": { enumerable: true },
    marginTop: { enumerable: true },
    "margin-top": { enumerable: true },
    maxHeight: { enumerable: true },
    "max-height": { enumerable: true },
    maxWidth: { enumerable: true },
    "max-width": { enumerable: true },
    minHeight: { enumerable: true },
    "min-height": { enumerable: true },
    minWidth: { enumerable: true },
    "min-width": { enumerable: true },
    outline: { enumerable: true },
    outlineColor: { enumerable: true },
    "outline-color": { enumerable: true },
    outlineStyle: { enumerable: true },
    "outline-style": { enumerable: true },
    outlineWidth: { enumerable: true },
    "outline-width": { enumerable: true },
    padding: { enumerable: true },
    paddingBottom: { enumerable: true },
    "padding-bottom": { enumerable: true },
    paddingLeft: { enumerable: true },
    "padding-left": { enumerable: true },
    paddingRight: { enumerable: true },
    "padding-right": { enumerable: true },
    paddingTop: { enumerable: true },
    "padding-top": { enumerable: true },
    quotes: { enumerable: true },
    textAlign: { enumerable: true },
    "text-align": { enumerable: true },
    textDecoration: { enumerable: true },
    "text-decoration": { enumerable: true },
    textIndent: { enumerable: true },
    "text-indent": { enumerable: true },
    textTransform: { enumerable: true },
    "text-transform": { enumerable: true },
    visibility: { enumerable: true },
    whiteSpace: { enumerable: true },
    "white-space": { enumerable: true },
    width: { enumerable: true },
    wordSpacing: { enumerable: true },
    "word-spacing": { enumerable: true },
    [Symbol.toStringTag]: { value: "CSSPageDescriptors", configurable: true },
    [Symbol.iterator]: { value: globalObject.Array.prototype[Symbol.iterator], configurable: true, writable: true }
  });
  ctorRegistry[interfaceName] = CSSPageDescriptors;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: CSSPageDescriptors
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
