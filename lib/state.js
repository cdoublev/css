
import CSSStyleSheet from './cssom/CSSStyleSheet.js'

const defaultState = {
    agent: {
        colorSchemes: ['light', 'dark'],
        navigation: ['back'],
        scripting: 'enabled',
        styleSheet: '',
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
    document: {
        customProperties: new Map,
        environmentVariables: new Map,
        fontFaces: new Set,
        manifest: null,
        randomCacheNames: [],
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
        forcedColors: null,
        highContrast: false,
        invertedColors: false,
        reducedData: false,
        reducedMotion: false,
        reducedTransparency: false,
        styleSheet: '',
        visibleFocus: false,
    },
}

export const states = new WeakMap

/**
 * @param {Window} globalObject
 * @param {object} name
 * @returns {number}
 */
export function getRandomBaseValue(globalObject, { element, identifier, scope }) {
    const { document: { randomCacheNames } } = states.get(globalObject)
    const name = randomCacheNames.find(name =>
        (name.element === element || !element)
        && name.identifier === identifier
        && name.scope === scope)
    if (name) {
        return name.base
    }
    const base = Math.random()
    randomCacheNames.push({ base, element, identifier, scope })
    return base
}

/**
 * @param {object} state
 * @param {Window} globalObject
 * @returns {object}
 */
export function create(state, globalObject) {
    state = merge(state, defaultState, globalObject)
    states.set(globalObject, state)
    return state
}

/**
 * @param {object} partial
 * @param {object} initial
 * @param {Window} globalObject
 * @returns {object}
 */
export function merge(partial, initial, globalObject) {
    return Object.entries(initial).reduce(
        (state, [key, value]) => {
            const specified = partial?.[key]
            if (key === 'document') {
                value = { ...value, ...specified }
            } else if (key === 'styleSheet') {
                value = CSSStyleSheet.create(globalObject, undefined, { rules: specified ?? value })
            } else if (value && typeof value === 'object' && !Array.isArray(value)) {
                value = merge(specified, value, globalObject)
            } else {
                value = specified ?? value
            }
            return { ...state, [key]: value }
        },
        {})
}
