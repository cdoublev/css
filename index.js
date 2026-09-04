
import * as cssom from './lib/cssom/index.js'
import { states } from './lib/state.js'

const defaultSharedState = {
    agent: {
        colorSchemes: ['light', 'dark'],
        navigation: ['back'],
        scripting: 'enabled',
        type: 'screen',
        viewport: {
            interfaces: {
                bottom: { expanded: false, value: 0 },
                left: { expanded: false, value: 0 },
                right: { expanded: false, value: 0 },
                top: { expanded: false, value: 0 },
            },
            overflow: ['scroll', 'scroll'],
            resizable: true,
            state: 'normal',
        },
    },
    system: {
        display: {
            blending: 'opaque',
            colorIndex: 0,
            graphicMode: true,
            hdr: false,
            interlaced: false,
            monochrome: 0,
            segments: [1, 1],
            shape: 'rect',
            update: 'fast',
        },
        pointers: [{ motionable: true, precision: 'fine' }],
    },
    user: {
        colorScheme: 'light',
        fontSize: 16,
        highContrast: false,
        invertedColors: false,
        reducedData: false,
        reducedMotion: false,
        reducedTransparency: false,
    },
}

/**
 * @param {Window} globalObject
 * @param {Map} [state]
 */
function install(globalObject = globalThis, state = defaultSharedState) {
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
    states.set(globalObject, {
        customProperties: new Map,
        environmentVariables: new Map,
        fontFaces: new Set,
        randomCacheNames: [],
        shared: state,
    })
}

export { CSSPseudoElement, CSSStyleProperties, CSSStyleSheet, StyleSheetList } from './lib/cssom/index.js'
export { matchElementAgainstSelectors, matchTreesAgainstSelectors } from './lib/match/selector.js'
export { parseGrammar, parseListGrammar } from './lib/parse/parser.js'
export { install }
