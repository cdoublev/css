
import * as cssom from './lib/cssom/index.js'

/**
 * @param {DocumentOrShadowRoot} globalObject
 */
function install(globalObject = globalThis) {
    const entries = Object.entries(cssom)
    while (0 < entries.length) {
        const entry = entries.pop()
        const [, wrapper] = entry
        const { inheritance } = wrapper
        if (inheritance && entries.find(entry => entry[0] === inheritance)) {
            entries.unshift(entry)
            continue
        }
        wrapper.install(globalObject, ['Window'])
    }
    globalObject.CSS = cssom.CSS.create(globalObject)
}

export { CSSStyleProperties, CSSStyleSheet, StyleSheetList } from './lib/cssom/index.js'
export { parseGrammar, parseGrammarList } from './lib/parse/parser.js'
export { install }
