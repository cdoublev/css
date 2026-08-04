import conversions from "webidl-conversions";
import * as utils from "./utils.js";

import MediaList from "./MediaList.js";

export const _convertInherit = (globalObject, obj, ret, { context = "The provided value" } = {}) => {
  {
    const key = "baseURL";
    let value = obj === undefined || obj === null ? undefined : obj[key];
    if (value !== undefined) {
      if (value === null || value === undefined) {
        value = null;
      } else {
        value = conversions["DOMString"](value, {
          context: context + " has member 'baseURL' that",
          globals: globalObject
        });
      }
      ret[key] = value;
    } else {
      ret[key] = null;
    }
  }

  {
    const key = "disabled";
    let value = obj === undefined || obj === null ? undefined : obj[key];
    if (value !== undefined) {
      value = conversions["boolean"](value, {
        context: context + " has member 'disabled' that",
        globals: globalObject
      });

      ret[key] = value;
    } else {
      ret[key] = false;
    }
  }

  {
    const key = "media";
    let value = obj === undefined || obj === null ? undefined : obj[key];
    if (value !== undefined) {
      if (MediaList.is(value)) {
        value = utils.implForWrapper(value);
      } else {
        value = conversions["DOMString"](value, {
          context: context + " has member 'media' that",
          globals: globalObject
        });
      }
      ret[key] = value;
    } else {
      ret[key] = "";
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
