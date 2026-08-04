import conversions from "webidl-conversions";
import * as utils from "./utils.js";

export const convert = (globalObject, value, { context = "The provided value" } = {}) => {
  if (typeof value !== "function") {
    throw new globalObject.TypeError(context + " is not a function");
  }

  function invokeTheCallbackFunction() {
    const thisArg = utils.tryWrapperForImpl(this);
    let callResult;

    callResult = Reflect.apply(value, thisArg, []);
  }

  invokeTheCallbackFunction.construct = () => {
    let callResult = Reflect.construct(value, []);
  };

  invokeTheCallbackFunction[utils.wrapperSymbol] = value;
  invokeTheCallbackFunction.objectReference = value;

  return invokeTheCallbackFunction;
};

export default { convert };
