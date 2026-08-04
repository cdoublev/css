import conversions from "webidl-conversions";
import * as utils from "./utils.js";

export const _convertInherit = (globalObject, obj, ret, { context = "The provided value" } = {}) => {
  {
    const key = "defaultValue";
    let value = obj === undefined || obj === null ? undefined : obj[key];
    if (value !== undefined) {
      value = conversions["DOMString"](value, {
        context: context + " has member 'defaultValue' that",
        globals: globalObject
      });

      ret[key] = value;
    }
  }

  {
    const key = "name";
    let value = obj === undefined || obj === null ? undefined : obj[key];
    if (value !== undefined) {
      value = conversions["DOMString"](value, { context: context + " has member 'name' that", globals: globalObject });

      ret[key] = value;
    } else {
      throw new globalObject.TypeError("name is required in 'FunctionParameter'");
    }
  }

  {
    const key = "type";
    let value = obj === undefined || obj === null ? undefined : obj[key];
    if (value !== undefined) {
      value = conversions["DOMString"](value, { context: context + " has member 'type' that", globals: globalObject });

      ret[key] = value;
    } else {
      throw new globalObject.TypeError("type is required in 'FunctionParameter'");
    }
  }
};

export const convert = (globalObject, obj, { context = "The provided value" } = {}) => {
  if (obj !== undefined && typeof obj !== "object" && typeof obj !== "function") {
    throw new globalObject.TypeError(`${context} is not an object.`);
  }

  const ret = Object.create(null);
  _convertInherit(globalObject, obj, ret, { context });
  return ret;
};

export default { _convertInherit, convert };
