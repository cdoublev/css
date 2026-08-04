import conversions from "webidl-conversions";
import * as utils from "./utils.js";
import Impl from "./CSS-impl.js";

import PropertyDefinition from "./PropertyDefinition.js";

const namespaceName = "CSS";
const exposed = new Set(["Window"]);

export const install = (globalObject, globalNames) => {
  if (!globalNames.some(globalName => exposed.has(globalName))) {
    return;
  }

  const namespaceObject = Object.create(globalObject.Object.prototype);

  utils.define(namespaceObject, {
    escape(ident) {
      if (arguments.length < 1) {
        throw new globalObject.TypeError(
          `Failed to execute 'escape' on 'CSS': 1 argument required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'escape' on 'CSS': parameter 1",
          globals: globalObject
        });
        args.push(curArg);
      }
      return utils.tryWrapperForImpl(Impl.escape(...args));
    },
    registerProperty(definition) {
      if (arguments.length < 1) {
        throw new globalObject.TypeError(
          `Failed to execute 'registerProperty' on 'CSS': 1 argument required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = PropertyDefinition.convert(globalObject, curArg, {
          context: "Failed to execute 'registerProperty' on 'CSS': parameter 1"
        });
        args.push(curArg);
      }
      return Impl.registerProperty(globalObject, ...args);
    },
    supports(conditionText) {
      if (arguments.length < 1) {
        throw new globalObject.TypeError(
          `Failed to execute 'supports' on 'CSS': 1 argument required, but only ${arguments.length} present.`
        );
      }
      const args = [];
      switch (arguments.length) {
        case 1:
          {
            let curArg = arguments[0];
            curArg = conversions["DOMString"](curArg, {
              context: "Failed to execute 'supports' on 'CSS': parameter 1",
              globals: globalObject
            });
            args.push(curArg);
          }
          break;
        default:
          {
            let curArg = arguments[0];
            curArg = conversions["DOMString"](curArg, {
              context: "Failed to execute 'supports' on 'CSS': parameter 1",
              globals: globalObject
            });
            args.push(curArg);
          }
          {
            let curArg = arguments[1];
            curArg = conversions["DOMString"](curArg, {
              context: "Failed to execute 'supports' on 'CSS': parameter 2",
              globals: globalObject
            });
            args.push(curArg);
          }
      }
      return Impl.supports(globalObject, ...args);
    },
    get highlights() {
      return utils.tryWrapperForImpl(Impl["highlights"]);
    }
  });

  Object.defineProperties(namespaceObject, {
    [Symbol.toStringTag]: { value: "CSS", configurable: true }
  });

  Object.defineProperty(globalObject, namespaceName, {
    configurable: true,
    writable: true,
    value: namespaceObject
  });
};

export default { install };
