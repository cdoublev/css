import conversions from "webidl-conversions";
import * as utils from "./utils.js";
import Impl from "./CSSFontFaceDescriptors-impl.js";

import CSSStyleDeclaration from "./CSSStyleDeclaration.js";

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const inheritance = "CSSStyleDeclaration";

const interfaceName = "CSSFontFaceDescriptors";

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
  throw new globalObject.TypeError(`${context} is not of type 'CSSFontFaceDescriptors'.`);
};

function makeWrapper(globalObject, newTarget) {
  let proto;
  if (newTarget !== undefined) {
    proto = newTarget.prototype;
  }

  if (!utils.isObject(proto)) {
    proto = globalObject[ctorRegistrySymbol]["CSSFontFaceDescriptors"].prototype;
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
  class CSSFontFaceDescriptors extends globalObject.CSSStyleDeclaration {
    constructor() {
      throw new globalObject.TypeError("Illegal constructor");
    }

    get ascentOverride() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get ascentOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("ascent-override");
    }

    set ascentOverride(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set ascentOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'ascentOverride' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("ascent-override", V);
    }

    get "ascent-override"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get ascent-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("ascent-override");
    }

    set "ascent-override"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set ascent-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'ascent-override' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("ascent-override", V);
    }

    get descentOverride() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get descentOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("descent-override");
    }

    set descentOverride(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set descentOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'descentOverride' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("descent-override", V);
    }

    get "descent-override"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get descent-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("descent-override");
    }

    set "descent-override"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set descent-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'descent-override' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("descent-override", V);
    }

    get fontDisplay() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontDisplay' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-display");
    }

    set fontDisplay(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontDisplay' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontDisplay' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-display", V);
    }

    get "font-display"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-display' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-display");
    }

    set "font-display"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-display' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-display' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-display", V);
    }

    get fontFamily() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontFamily' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-family");
    }

    set fontFamily(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontFamily' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontFamily' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-family", V);
    }

    get "font-family"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-family' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-family");
    }

    set "font-family"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-family' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-family' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-family", V);
    }

    get fontFeatureSettings() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontFeatureSettings' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-feature-settings");
    }

    set fontFeatureSettings(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontFeatureSettings' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontFeatureSettings' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-feature-settings", V);
    }

    get "font-feature-settings"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-feature-settings' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-feature-settings");
    }

    set "font-feature-settings"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-feature-settings' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-feature-settings' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-feature-settings", V);
    }

    get fontLanguageOverride() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontLanguageOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-language-override");
    }

    set fontLanguageOverride(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontLanguageOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontLanguageOverride' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-language-override", V);
    }

    get "font-language-override"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-language-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-language-override");
    }

    set "font-language-override"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-language-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-language-override' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-language-override", V);
    }

    get fontNamedInstance() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontNamedInstance' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-named-instance");
    }

    set fontNamedInstance(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontNamedInstance' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontNamedInstance' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-named-instance", V);
    }

    get "font-named-instance"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-named-instance' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-named-instance");
    }

    set "font-named-instance"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-named-instance' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-named-instance' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-named-instance", V);
    }

    get fontSize() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontSize' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-size");
    }

    set fontSize(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontSize' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontSize' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-size", V);
    }

    get "font-size"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-size' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-size");
    }

    set "font-size"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-size' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-size' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-size", V);
    }

    get fontStyle() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontStyle' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-style");
    }

    set fontStyle(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontStyle' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontStyle' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-style", V);
    }

    get "font-style"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-style' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-style");
    }

    set "font-style"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-style' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-style' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-style", V);
    }

    get fontVariationSettings() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontVariationSettings' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-variation-settings");
    }

    set fontVariationSettings(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontVariationSettings' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontVariationSettings' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-variation-settings", V);
    }

    get "font-variation-settings"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-variation-settings' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-variation-settings");
    }

    set "font-variation-settings"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-variation-settings' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-variation-settings' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-variation-settings", V);
    }

    get fontWeight() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontWeight' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-weight");
    }

    set fontWeight(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontWeight' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontWeight' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-weight", V);
    }

    get "font-weight"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-weight' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-weight");
    }

    set "font-weight"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-weight' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-weight' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-weight", V);
    }

    get fontWidth() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontWidth' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-width");
    }

    set fontWidth(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontWidth' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontWidth' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-width", V);
    }

    get "font-width"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-width' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-width");
    }

    set "font-width"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-width' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-width' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-width", V);
    }

    get lineGapOverride() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get lineGapOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("line-gap-override");
    }

    set lineGapOverride(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set lineGapOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'lineGapOverride' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("line-gap-override", V);
    }

    get "line-gap-override"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get line-gap-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("line-gap-override");
    }

    set "line-gap-override"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set line-gap-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'line-gap-override' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("line-gap-override", V);
    }

    get sizeAdjust() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get sizeAdjust' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("size-adjust");
    }

    set sizeAdjust(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set sizeAdjust' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'sizeAdjust' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("size-adjust", V);
    }

    get "size-adjust"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get size-adjust' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("size-adjust");
    }

    set "size-adjust"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set size-adjust' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'size-adjust' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("size-adjust", V);
    }

    get src() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get src' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("src");
    }

    set src(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set src' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'src' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("src", V);
    }

    get subscriptPositionOverride() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get subscriptPositionOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("subscript-position-override");
    }

    set subscriptPositionOverride(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set subscriptPositionOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context:
          "Failed to set the 'subscriptPositionOverride' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("subscript-position-override", V);
    }

    get "subscript-position-override"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get subscript-position-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("subscript-position-override");
    }

    set "subscript-position-override"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set subscript-position-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context:
          "Failed to set the 'subscript-position-override' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("subscript-position-override", V);
    }

    get subscriptSizeOverride() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get subscriptSizeOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("subscript-size-override");
    }

    set subscriptSizeOverride(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set subscriptSizeOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'subscriptSizeOverride' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("subscript-size-override", V);
    }

    get "subscript-size-override"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get subscript-size-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("subscript-size-override");
    }

    set "subscript-size-override"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set subscript-size-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'subscript-size-override' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("subscript-size-override", V);
    }

    get superscriptPositionOverride() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get superscriptPositionOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("superscript-position-override");
    }

    set superscriptPositionOverride(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set superscriptPositionOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context:
          "Failed to set the 'superscriptPositionOverride' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("superscript-position-override", V);
    }

    get "superscript-position-override"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get superscript-position-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("superscript-position-override");
    }

    set "superscript-position-override"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set superscript-position-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context:
          "Failed to set the 'superscript-position-override' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("superscript-position-override", V);
    }

    get superscriptSizeOverride() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get superscriptSizeOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("superscript-size-override");
    }

    set superscriptSizeOverride(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set superscriptSizeOverride' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'superscriptSizeOverride' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("superscript-size-override", V);
    }

    get "superscript-size-override"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get superscript-size-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("superscript-size-override");
    }

    set "superscript-size-override"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set superscript-size-override' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context:
          "Failed to set the 'superscript-size-override' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("superscript-size-override", V);
    }

    get unicodeRange() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get unicodeRange' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("unicode-range");
    }

    set unicodeRange(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set unicodeRange' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'unicodeRange' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("unicode-range", V);
    }

    get "unicode-range"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get unicode-range' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("unicode-range");
    }

    set "unicode-range"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set unicode-range' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'unicode-range' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("unicode-range", V);
    }

    get fontStretch() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get fontStretch' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-stretch");
    }

    set fontStretch(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set fontStretch' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'fontStretch' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-stretch", V);
    }

    get "font-stretch"() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'get font-stretch' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      return esValue[implSymbol].getPropertyValue("font-stretch");
    }

    set "font-stretch"(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!is(esValue)) {
        throw new globalObject.TypeError(
          "'set font-stretch' called on an object that is not a valid instance of CSSFontFaceDescriptors."
        );
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'font-stretch' property on 'CSSFontFaceDescriptors': The provided value",
        globals: globalObject,
        treatNullAsEmptyString: true
      });

      esValue[implSymbol].setProperty("font-stretch", V);
    }
  }
  Object.defineProperties(CSSFontFaceDescriptors.prototype, {
    ascentOverride: { enumerable: true },
    "ascent-override": { enumerable: true },
    descentOverride: { enumerable: true },
    "descent-override": { enumerable: true },
    fontDisplay: { enumerable: true },
    "font-display": { enumerable: true },
    fontFamily: { enumerable: true },
    "font-family": { enumerable: true },
    fontFeatureSettings: { enumerable: true },
    "font-feature-settings": { enumerable: true },
    fontLanguageOverride: { enumerable: true },
    "font-language-override": { enumerable: true },
    fontNamedInstance: { enumerable: true },
    "font-named-instance": { enumerable: true },
    fontSize: { enumerable: true },
    "font-size": { enumerable: true },
    fontStyle: { enumerable: true },
    "font-style": { enumerable: true },
    fontVariationSettings: { enumerable: true },
    "font-variation-settings": { enumerable: true },
    fontWeight: { enumerable: true },
    "font-weight": { enumerable: true },
    fontWidth: { enumerable: true },
    "font-width": { enumerable: true },
    lineGapOverride: { enumerable: true },
    "line-gap-override": { enumerable: true },
    sizeAdjust: { enumerable: true },
    "size-adjust": { enumerable: true },
    src: { enumerable: true },
    subscriptPositionOverride: { enumerable: true },
    "subscript-position-override": { enumerable: true },
    subscriptSizeOverride: { enumerable: true },
    "subscript-size-override": { enumerable: true },
    superscriptPositionOverride: { enumerable: true },
    "superscript-position-override": { enumerable: true },
    superscriptSizeOverride: { enumerable: true },
    "superscript-size-override": { enumerable: true },
    unicodeRange: { enumerable: true },
    "unicode-range": { enumerable: true },
    fontStretch: { enumerable: true },
    "font-stretch": { enumerable: true },
    [Symbol.toStringTag]: { value: "CSSFontFaceDescriptors", configurable: true },
    [Symbol.iterator]: { value: globalObject.Array.prototype[Symbol.iterator], configurable: true, writable: true }
  });
  ctorRegistry[interfaceName] = CSSFontFaceDescriptors;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: CSSFontFaceDescriptors
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
