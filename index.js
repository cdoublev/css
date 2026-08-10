
import * as cssom from './lib/cssom/index.js'
import { create as createState } from './lib/state.js'

/**
 * @param {Window} globalObject
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
    createState(globalObject)
}

export { CSSPseudoElement, CSSStyleProperties, CSSStyleSheet, StyleSheetList } from './lib/cssom/index.js'
export { matchElementAgainstSelectors, matchTreesAgainstSelectors } from './lib/match/selector.js'
export { parseGrammar, parseListGrammar } from './lib/parse/parser.js'
export { install }
