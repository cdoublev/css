
import * as colors from './values/colors.js'
import {
    CSSContainerRule,
    CSSImportRule,
    CSSLayerBlockRule,
    CSSLayerStatementRule,
    CSSMediaRule,
    CSSNamespaceRule,
    CSSNestedDeclarations,
    CSSPseudoElement,
    CSSScopeRule,
    CSSStyleRule,
    CSSSupportsRule,
} from './cssom/index.js'
import { delimiter, identifierToken, isDelimiter, isList, isNumeric, isOmitted, keyword, length, list, map, number, omitted } from './values/value.js'
import { findAncestor, getParent } from './utils/dom/element.js'
import { getRandomBaseValue, states } from './state.js'
import { matchElementAgainstSelectors, matchPseudoElementAgainstSelectors, matchTreesAgainstSelectors } from './match/selector.js'
import { ampersand } from './values/defaults.js'
import { clamp } from './utils/math.js'
import { getElementColorScheme } from './utils/color-scheme.js'
import { implForWrapper } from './cssom/utils.js'
import { indexOf } from './utils/dom/collection.js'
import { isMatchingImportConditions } from './cssom/CSSImportRule-impl.js'
import matchContainer from './match/container.js'
import { parseGrammar } from './parse/parser.js'
import properties from './properties/definitions.js'
import { serializeComponentValue } from './serialize.js'
import { simplifyCalculation } from './parse/simplify.js'

const USER_AGENT_ORIGIN = 1
const USER_ORIGIN = 2
const AUTHOR_ORIGIN = 3

const scopeSelector = list([delimiter(':'), identifierToken('scope')], ['<pseudo-class-selector>', '<subclass-selector>'])


// Filtering

/**
 * @param {*} selector
 * @returns {boolean}
 */
function isScopeSelector(selector) {
    return selector.types.includes('<pseudo-class-selector>')
        && selector.value[1].types === '<ident-token>'
        && selector.value[1].value === 'scope'
}

/**
 * @param {*[]} selector
 * @param {object} context
 * @returns {boolean}
 */
function isCompoundSelectorContainingNestingOrScopeSelector(selector, context) {
    if (selector.types.includes('<complex-selector-unit>')) {
        return isCompoundSelectorContainingNestingOrScopeSelector(selector[0], context)
    }
    const [type, subclasses] = selector
    return isDelimiter('&', type)
        || subclasses.some(subclass => isDelimiter('&', subclass) || (context.scopes && isScopeSelector(subclass)))
}

/**
 * @param {*[]} selector
 * @param {object} context
 * @returns {boolean}
 */
function isComplexSelectorContainingNestingOrScopeSelector([compound, tail], context) {
    return isCompoundSelectorContainingNestingOrScopeSelector(compound, context)
        || tail.some(([, compound]) => isCompoundSelectorContainingNestingOrScopeSelector(compound, context))
}

/**
 * @param {*[]} selectors
 * @param {object} context
 * @returns {*[]}
 */
function getAbsoluteSelectors(selectors, context) {
    const { anchors, scopes } = context
    // Assert: the selectors are absolute if no anchors and scopes are defined in the context
    if (!anchors && !scopes) {
        return selectors
    }
    // Normalize <relative-*-selector-list> to <complex-*-selector-list>
    const normalized = []
    for (const [combinator, complex] of selectors) {
        // The selector is absolute if the leading combinator is omitted and it includes & or :scope
        if (isOmitted(combinator) && isComplexSelectorContainingNestingOrScopeSelector(complex, context)) {
            normalized.push(complex)
            continue
        }
        // Absolutize the selector by appending & or :scope before the leading combinator
        const compound = anchors
            ? list([ampersand, list()], '', ['<compound-selector>'])
            : list([omitted, list([scopeSelector])], '', ['<compound-selector>'])
        const [head, tail] = complex
        if (complex.types.includes('<complex-selector-unit>')) {
            const unit = list([compound, list()], '', ['<complex-selector-unit>'])
            const chain = list([list([combinator, head]), ...tail])
            normalized.push(list([unit, chain], ' ', ['<complex-selector>']))
        } else {
            const chain = list([list([combinator, head]), ...tail])
            normalized.push(list([compound, chain], ' ', ['<complex-real-selector>']))
        }
    }
    return list(normalized, ',', [selectors.types.at(-1).replace('relative', 'complex')])
}

/**
 * @param {object} end
 * @param {object} context
 * @returns {Element[]}
 */
function findScopingLimits(end, context) {
    if (isOmitted(end)) {
        return []
    }
    return matchTreesAgainstSelectors([context.root], getAbsoluteSelectors(end[1].value, context), context)
}

/**
 * @param {object} start
 * @param {object} context
 * @param {CSSStyleSheetImpl}
 * @returns {Element}
 */
function findScopingRoots(start, context, parentStyleSheet) {
    if (isOmitted(start)) {
        return [parentStyleSheet.ownerNode]
    }
    return matchTreesAgainstSelectors([context.root], getAbsoluteSelectors(start.value, context), context)
}

/**
 * @param {string} name
 * @param {object} context
 * @returns {string}
 */
function registerLayer(name, { layer = '', layers }) {
    for (const segment of name.split('.')) {
        layer = `${layer}[${segment === '' ? layers.length : segment}]`
        if (!layers.includes(layer)) {
            layers.push(layer)
        }
    }
    return layer
}

/**
 * @param {string} property
 * @param {Element} element
 * @param {CSSRuleImpl} rule
 * @param {object} context
 * @returns {object[]}
 */
function getRuleDeclarations(property, element, rule, context) {

    if (CSSContainerRule.isImpl(rule)) {

        if (findAncestor(element, element => matchContainer(rule._condition, element))) {
            return getRuleListDeclarations(property, element, rule.cssRules, context)
        }

    } else if (CSSImportRule.isImpl(rule)) {

        if (rule.styleSheet && isMatchingImportConditions(rule)) {
            if (rule.layerName !== null) {
                context = { ...context, layer: registerLayer(rule.layerName, context) }
            }
            if (rule._scope) {
                const { _scope: [start, end], parentStyleSheet } = rule
                const roots = findScopingRoots(start, context, parentStyleSheet)
                const scopes = { inclusive: true, roots }
                context = { ...context, anchors: undefined, scopes, selectors: [] }
                const limits = findScopingLimits(end, context)
                context = { ...context, scopes: { ...scopes, limits } }
            }
            return getRuleListDeclarations(property, element, rule.styleSheet, context)
        }

    } else if (CSSLayerBlockRule.isImpl(rule)) {

        context = { ...context, layer: registerLayer(rule.name, context) }
        return getRuleListDeclarations(property, element, rule.cssRules, context)

    } else if (CSSLayerStatementRule.isImpl(rule)) {

        rule.nameList.forEach(name => registerLayer(name, context))

    } else if (CSSMediaRule.isImpl(rule)) {

        if (rule.matches) {
            return getRuleListDeclarations(property, element, rule.cssRules, context)
        }

    } else if (CSSNamespaceRule.isImpl(rule)) {

        const { namespaceURI, prefix } = rule
        context.namespaces.set(prefix, namespaceURI)

    } else if (CSSNestedDeclarations.isImpl(rule)) {

        if (context.anchors.includes(element)) {
            const declaration = rule.style._declarations.find(declaration => declaration.name === property)
            if (declaration) {
                return [{ ...declaration, context }]
            }
        }

    } else if (CSSScopeRule.isImpl(rule)) {

        const roots = findScopingRoots(rule._start, context)
        const scopes = { inclusive: true, roots }
        context = { ...context, anchors: undefined, scopes, selectors: [] }
        const limits = findScopingLimits(rule._end, context)
        context = { ...context, scopes: { ...scopes, limits } }

        return getRuleListDeclarations(property, element, rule.cssRules, context)

    } else if (CSSStyleRule.isImpl(rule)) {

        const { _selectors, cssRules, style } = rule
        const selectors = getAbsoluteSelectors(_selectors, context)

        // Pseudo-elements cannot match nested rule selectors at the moment
        if (CSSPseudoElement.isImpl(element)) {
            if (matchPseudoElementAgainstSelectors(element, selectors, context)) {
                const declaration = style._declarations.find(declaration => declaration.name === property)
                if (declaration) {
                    return [declaration]
                }
            }
            return []
        }

        const elements = matchTreesAgainstSelectors([context.root], selectors, context)

        if (0 < elements.length) {
            context = { ...context, selectors: [...context.selectors, selectors] }
            const declarations = []
            if (elements.includes(element)) {
                const declaration = style._declarations.find(declaration => declaration.name === property)
                if (declaration) {
                    declarations.push({ ...declaration, context })
                }
            }
            const nestedContext = { ...context, anchors: elements, scopes: undefined }
            declarations.push(getRuleListDeclarations(property, element, cssRules, nestedContext))
            return declarations
        }

    } else if (CSSSupportsRule.isImpl(rule)) {

        if (rule.matches) {
            return getRuleListDeclarations(property, element, rule.cssRules, context)
        }
    }

    return []
}

/**
 * @param {string} property
 * @param {Element} element
 * @param {CSSRuleListImpl|CSSStyleSheetImpl} list
 * @param {object} context
 * @returns {*[]}
 */
function getRuleListDeclarations(property, element, list, context) {
    return list._rules.map(rule => getRuleDeclarations(property, element, rule, context))
}

/**
 * @param {string} property
 * @param {Element} element
 * @param {CSSStyleSheet} styleSheet
 * @param {object} context
 * @returns {*[]}
 */
function getStyleSheetDeclarations(property, element, styleSheet, context) {
    return getRuleListDeclarations(property, element, implForWrapper(styleSheet), context)
}

/**
 * @param {string} property
 * @param {Element} element
 * @param {StyleSheetList|CSSStyleSheet[]} list
 * @param {object} context
 * @returns {object[]}
 */
function getStyleSheetListDeclarations(property, element, list, context) {
    const declarations = []
    for (const styleSheet of list) {
        declarations.push(getStyleSheetDeclarations(property, element, styleSheet, context))
    }
    return declarations
}

/**
 * @param {Document|ShadowRoot} root
 * @param {number} origin
 * @returns {object}
 */
function createContext(root, origin) {
    return {
        elementCache: new Map,
        layers: [],
        namespaces: new Map,
        origin,
        root,
        selectorCache: new Map,
        selectors: [],
    }
}

/**
 * @param {string} property
 * @param {Element} element
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#declared-value}
 */
function getDeclaredValues(property, element) {

    const { ownerDocument: { _userAgentStyleSheet, _userStyleSheet }, style } = element
    const root = element.getRootNode({ composed: true })
    const { adoptedStyleSheets = [], styleSheets } = root

    const declarations = [
        getStyleSheetDeclarations(property, element, _userAgentStyleSheet, createContext(root, USER_AGENT_ORIGIN)),
        getStyleSheetDeclarations(property, element, _userStyleSheet, createContext(root, USER_ORIGIN)),
        getStyleSheetListDeclarations(property, element, styleSheets, createContext(root, AUTHOR_ORIGIN)),
        getStyleSheetListDeclarations(property, element, adoptedStyleSheets, createContext(root, AUTHOR_ORIGIN)),
    ]
    const declaration = implForWrapper(style)?._declarations.find(declaration => declaration.name === property)
    if (declaration) {
        declarations.push({ ...declaration, context: { attached: true, origin: AUTHOR_ORIGIN } })
    }

    return declarations.flat(Infinity)
}


// Cascading

/**
 * @param {number[][]} specificities
 * @returns {number[]}
 */
function mergeSpecificities(...specificities) {
    return specificities.reduce((sum, specificity) => sum.map((value, index) => value + specificity[index]))
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function compareSpecificities(a, b) {
    for (const [index, an] of a.entries()) {
        const bn = b[index]
        if (an < bn) {
            return -1
        }
        if (bn < an) {
            return 1
        }
    }
    return 0
}

/**
 * @param {number[][]} specificities
 * @returns {number[]}
 */
function getHighestSpecificity(specificities) {
    return specificities.sort(compareSpecificities).at(-1)
}

/**
 * @param {object} selector
 * @returns {number[]}
 */
function getPseudoClassSelectorSpecificity({ name, value }) {
    switch (name) {
        case 'has':
        case 'not':
            return getHighestSpecificity(value.map(getSelectorSpecificity))
        case 'is':
            return getHighestSpecificity(value.filter(selector => 0 < selector.types.length).map(getSelectorSpecificity))
        case 'host':
        case 'host-context':
            return mergeSpecificities([0, 1, 0], getSelectorSpecificity(value))
        case 'nth-child':
        case 'nth-last-child':
            if (!isOmitted(value[1])) {
                return mergeSpecificities([0, 1, 0], getHighestSpecificity(value[1][1]))
            }
            break
        case 'where':
            return [0, 0, 0]
    }
    return [0, 1, 0]
}

/**
 * @param {object} selector
 * @returns {number[]}
 */
function getPseudoElementSelectorSpecificity({ name, value }) {
    switch (name) {
        case 'slotted':
            return mergeSpecificities([0, 1, 0], getSelectorSpecificity(value))
        case 'view-transition-group':
        case 'view-transition-group-children':
        case 'view-transition-image-pair':
        case 'view-transition-new':
        case 'view-transition-old':
            if (value.length === 0 || value[0].value === '*') {
                return [0, 0, 0]
            }
            break
    }
    return [0, 0, 1]
}

/**
 * @param {*[]} selector
 * @returns {number[]}
 */
function getSelectorSpecificity(selector) {
    if (isOmitted(selector) || isDelimiter('&', selector)) {
        return [0, 0, 0]
    }
    const { types } = selector
    for (let index = types.length - 1; 0 <= index; --index) {
        switch (types[index]) {
            case '<attribute-selector>':
            case '<class-selector>':
                return [0, 1, 0]
            case '<complex-real-selector>':
            case '<complex-selector>':
                return mergeSpecificities(
                    getSelectorSpecificity(selector[0]),
                    ...selector[1].map(right => getSelectorSpecificity(right[1])))
            case '<complex-selector-unit>':
            case '<compound-selector>':
            case '<pseudo-compound-selector>':
                return mergeSpecificities(
                    getSelectorSpecificity(selector[0]),
                    ...selector[1].map(getSelectorSpecificity))
            case '<id-selector>':
                return [1, 0, 0]
            case '<pseudo-class-selector>':
                return getPseudoClassSelectorSpecificity(selector[1])
            case '<pseudo-element-selector>':
                return getPseudoElementSelectorSpecificity(selector[2])
            case '<relative-real-selector>':
            case '<relative-selector>':
                return getSelectorSpecificity(selector[1])
            case '<type-selector>':
                return [0, 0, types.includes('<wq-name>') ? 1 : 0]
        }
    }
    throw RangeError('Unexpected selector type')
}

/**
 * @param {object} declaration
 * @param {Element} element
 * @returns {number[]}
 */
function getDeclarationSpecificity({ context }, element) {
    const [...selectors] = context.selectors
    const matches = matchElementAgainstSelectors(element, selectors.pop(), context, { all: true })
    return mergeSpecificities(
        // Highest specificity among complex selectors matching `element` in the innermost most style rule
        getHighestSpecificity(matches.map(getSelectorSpecificity)),
        // Highest specificities among the complex selector list of each ancestor style rule
        ...selectors.map(selectors => getHighestSpecificity(selectors.map(getSelectorSpecificity))))
}

/**
 * @param {object} declaration
 * @returns {number}
 */
function getDeclarationLayerIndex({ context: { layer, layers } }) {
    const index = layers.indexOf(layer)
    return index === -1 ? Infinity : index
}

/**
 * @param {string} property
 * @param {Element} element
 * @param {object[]} declarations
 * @returns {object|undefined}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#cascaded-value}
 */
function getCascadedValue(property, element, declarations = getDeclaredValues(property, element)) {
    declarations.sort((a, b) => {

        if (a.important && !b.important) {
            return 1
        }
        if (!a.important && b.important) {
            return -1
        }

        if (a.context.origin < b.context.origin) {
            return a.important ? 1 : -1
        }
        if (b.context.origin < a.context.origin) {
            return a.important ? -1 : 1
        }

        if (a.context.attached) {
            return 1
        }
        if (b.context.attached) {
            return -1
        }

        const layerA = getDeclarationLayerIndex(a)
        const layerB = getDeclarationLayerIndex(b)
        if (layerA < layerB) {
            return a.important ? 1 : -1
        }
        if (layerB < layerA) {
            return a.important ? -1 : 1
        }

        const specificityA = getDeclarationSpecificity(a, element)
        const specificityB = getDeclarationSpecificity(b, element)

        return compareSpecificities(specificityA, specificityB)
    })
    return declarations.at(-1)
}


// Defaulting

/**
 * @param {string} property
 * @param {Element} element
 * @returns {*}
 */
function getDefaultValue(property, element) {
    if (properties[property.startsWith('--') ? '--*' : property].inherited) {
        return getInheritedValue(property, element)
    }
    return getInitialValue(property)
}

/**
 * @param {string} property
 * @param {Element} element
 * @returns {*}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#inherited-value}
 */
function getInheritedValue(property, element) {
    const parent = getParent(element)
    if (parent) {
        return getComputedValue(property, parent)
    }
    return getInitialValue(property)
}

/**
 * @param {string} property
 * @returns {*}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#initial-value}
 */
function getInitialValue(property) {
    return properties[property.startsWith('--') ? '--*' : property].initial.parsed
}

/**
 * @param {string} property
 * @param {Element} element
 * @param {object} declaration
 * @param {object[]} declarations
 * @returns {*}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#valdef-all-revert}
 */
function getRevertedValue(property, element, declaration, declarations) {
    const { context: { origin } } = declaration
    if (origin === USER_AGENT_ORIGIN) {
        return getUnsetValue(property, element)
    }
    for (let index = declarations.indexOf(declaration) - 1; -1 < index; index--) {
        const { context, value } = declarations[index]
        if (context.origin !== origin) {
            return value
        }
    }
    return getDefaultValue(property, element)
}

/**
 * @param {string} property
 * @param {Element} element
 * @param {object} declaration
 * @param {object[]} declarations
 * @returns {*}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#valdef-all-revert-layer}
 */
function getRevertedLayerValue(property, element, declaration, declarations) {
    const { context: { origin, layer }, important } = declaration
    for (let index = declarations.indexOf(declaration) - 1; -1 < index; index--) {
        const { context, value } = declarations[index]
        if (context.layer !== layer || context.origin !== origin || (context.origin === origin && important)) {
            return value
        }
    }
    return getDefaultValue(property, element)
}

/**
 * @param {string} property
 * @param {Element} element
 * @param {object} declaration
 * @param {object[]} declarations
 * @returns {*}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#valdef-all-revert-rule}
 */
function getRevertedRuleValue(property, element, declaration, declarations) {
    return declarations[declarations.indexOf(declaration) - 1]?.value
        ?? getDefaultValue(property, element)
}

/**
 * @param {string} property
 * @param {Element} element
 * @returns {*}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#valdef-all-unset}
 */
function getUnsetValue(property, element) {
    return getDefaultValue(property, element)
}

/**
 * @param {string} property
 * @param {Element} element
 * @param {*} declared
 * @returns {*}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#specified-value}
 */
function getSpecifiedValue(property, element, declared = getDeclaredValues(property, element)) {

    const cascaded = getCascadedValue(property, element, declared)

    if (!cascaded) {
        return getDefaultValue(property, element)
    }

    const { value } = cascaded

    switch (value.value) {
        case 'initial':
            return getInitialValue(property)
        case 'inherit':
            return getInheritedValue(property, element)
        case 'unset':
            return getUnsetValue(property, element)
        case 'revert':
            return getRevertedValue(property, element, cascaded, declared)
        case 'revert-layer':
            return getRevertedLayerValue(property, element, cascaded, declared)
        case 'revert-rule':
            return getRevertedRuleValue(property, element, cascaded, declared)
        default:
            return value
    }
}


// Resolving the computed and used value

/**
 * @param {object} timeline
 * @param {Element} element
 * @returns {number}
 */
function getAnimationTimelineInterpolationProgress(timeline, element) {
    return number(0)
}

/**
 * @param {Element} element
 * @returns {object|object[]}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#first-available-font}
 */
function getFirstAvailableFontFamily(element) {
    const { defaultView } = element.ownerDocument ?? element
    const { fontFaces } = states.get(defaultView)
    const fontFamily = getSpecifiedValue('font-family', element)
    for (const family of fontFamily) {
        if (family.types.includes('<generic-font-family>')) {
            return family
        }
        const name = serializeComponentValue(family)
        const match = fontFaces.find(face =>
            face.src
            && face.familyName === name
            && !face._declarations.find(name => name === 'unicode-range')?.some(({ from, to }) => from <= 0x20 && 0x20 <= to))
        if (match) {
            return match
        }
    }
    return getInitialValue('font-family')[0]
}

/**
 * @param {object|object[]} family
 * @param {Element} element
 * @returns {number}
 */
function getFontFamilyMetrics(family, element) {
    return { ascent: 0.905, descent: 0.212, lineGap: 0.033 }
}

/**
 * @param {object|object[]} family
 * @param {object} size
 * @returns {number}
 */
function getNormalLineHeight(family, size) {
    const { ascent, descent, lineGap } = getFontFamilyMetrics(family)
    return (ascent + descent + lineGap) * size.value
}

/**
 * @param {Element} element
 * @returns {number}
 * @see {@link https://drafts.csswg.org/css2/#valdef-font-size-medium}
 */
function getUserPreferredFontSize(element) {
    return states.get(element.ownerDocument.defaultView).shared.userPreference.fontSize
}

/**
 * @param {object} size
 * @param {Element} element
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#typedef-absolute-size}
 */
function getComputedAbsoluteSize({ value }, element) {
    const userPreferredFontSize = getUserPreferredFontSize(element)
    switch (value) {
        case 'large':
            return length(userPreferredFontSize * 6 / 5, 'px')
        case 'medium':
            return length(userPreferredFontSize, 'px')
        case 'small':
            return length(userPreferredFontSize * 8 / 9, 'px')
        case 'x-large':
            return length(userPreferredFontSize * 3 / 2, 'px')
        case 'x-small':
            return length(userPreferredFontSize * 3 / 4, 'px')
        case 'xx-large':
            return length(userPreferredFontSize * 2, 'px')
        case 'xx-small':
            return length(userPreferredFontSize * 3 / 5, 'px')
        case 'xxx-large':
            return length(userPreferredFontSize * 3, 'px')
        default:
            throw RangeError('Unexpected absolute size')
    }
}

/**
 * @param {object} fn
 * @param {Element} element
 * @param {string} property
 * @returns {https://drafts.csswg.org/css-values-4/#calc-computed-value}
 */
function getComputedCalculationFunction(fn, element, property) {

    let { base, name, range, round, type, value } = fn
    const { ownerDocument: { defaultView } } = element

    switch (name) {
        case 'random': {
            if (base === undefined) {
                let { value: [[identifier,, scope]] } = value
                identifier = isOmitted(identifier) ? null : serializeComponentValue(identifier)
                scope = isOmitted(scope) ? null : serializeComponentValue(scope)
                base = getRandomBaseValue(defaultView, { element, identifier, scope })
                value = { ...value, base }
            }
            break
        }
        case 'sibling-count':
            return number(getParent(element)?.children.length ?? 1)
        case 'sibling-index': {
            const parent = getParent(element)
            const index = parent ? indexOf(parent.children, element) : 1
            return number(index + 1)
        }
    }

    const resolutionType = type.percentHint ? `<${type.percentHint}>` : null
    if (!isNumeric(value, { literal: true })) {
        value = simplifyCalculation(
            map(value, value => getComputedComponentValue(value, property, element)),
            resolutionType,
            defaultView.devicePixelRatio)
    }

    if (isNumeric(value, { resolutionType, resolved: true })) {
        let resolved = clamp(range.min, value.value, range.max)
        if (round) {
            resolved = Math.round(resolved)
        }
        return { ...value, value: resolved }
    }
    return { ...fn, value }
}

/**
 * @param {object} color
 * @param {Element} element
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-color-4/#resolving-color-values}
 */
function getComputedColor(color, element) {
    if (color.value === 'transparent') {
        return parseGrammar('rgb(0, 0, 0, 0)', '<color>', element)
    }
    if (color.types.includes('<deprecated-color>')) {
        return parseGrammar(colors.system[colors.deprecated[color.value]][getElementColorScheme(element)], '<color>', element)
    }
    if (color.types.includes('<light-dark-color>')) {
        return getComputedColor(color.value[getElementColorScheme(element) === 'light' ? 0 : 2], element)
    }
    if (color.types.includes('<named-color>')) {
        return parseGrammar(colors.named[color.value], '<color>', element)
    }
    if (color.types.includes('<system-color>')) {
        return parseGrammar(colors.system[color.value][getElementColorScheme(element)], '<color>', element)
    }
    return color
}

/**
 * @param {object} length
 * @param {Element} element
 * @param {string} property
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#length-value}
 */
function getComputedLength(value, element, property) {
    switch (value.unit) {
        case 'cap': {
            const firstAvailableFontFamily = getFirstAvailableFontFamily(element)
            const { ascent } = getFontFamilyMetrics(firstAvailableFontFamily)
            const fontSize = (property === 'font-size' ? getComputedInheritedValue : getComputedValue)('font-size', element)
            return length(value.value * ascent * fontSize.value, 'px')
        }
        case 'ch': {
            const writingMode = getComputedValue('writing-mode', element)
            const textOrientation = getComputedValue('text-orientation', element)
            const measure = (writingMode.value.startsWith('vertical') && textOrientation.value === 'upright') ? 1 : 0.5
            const fontSize = (property === 'font-size' ? getComputedInheritedValue : getComputedValue)('font-size', element)
            return length(value.value * measure * fontSize.value, 'px')
        }
        case 'cqb': {
            const container = findAncestor(element, element => getSpecifiedValue('container-type', element).value === 'size')
            if (container) {
                const writingMode = getComputedValue('writing-mode', element)
                const blockSize = getComputedValue(writingMode.value === 'horizontal-tb' ? 'height' : 'width', container)
                if (isNumeric(blockSize, { literal: true })) {
                    return length(value.value * blockSize.value, 'px')
                }
                return length(0, 'px')
            }
            const blockSize = element.ownerDocument.defaultView[writingMode === 'horizontal-tb' ? 'innerHeight' : 'innerWidth']
            return length(value.value * blockSize, 'px')
        }
        case 'cqh': {
            const writingMode = getComputedValue('writing-mode', element)
            const containerTypes = writingMode.value === 'horizintal-tb' ? ['size'] : ['inline-size', 'size']
            const container = findAncestor(element, element => containerTypes.includes(getSpecifiedValue('container-type', element)))
            if (container) {
                const height = getComputedValue('height', container)
                if (isNumeric(height, { literal: true })) {
                    return length(value.value * height.value, 'px')
                }
                return length(0, 'px')
            }
            const height = element.ownerDocument.defaultView.innerHeight
            return length(value.value * height.value, 'px')
        }
        case 'cqi': {
            const container = findAncestor(element, element => getSpecifiedValue('container-type', element).value.endsWith('size'))
            if (container) {
                const writingMode = getComputedValue('writing-mode', element)
                const inlineSize = getComputedValue(writingMode.value === 'horizontal-tb' ? 'width' : 'height', container)
                if (isNumeric(inlineSize, { literal: true })) {
                    return length(value.value * inlineSize.value, 'px')
                }
                return length(0, 'px')
            }
            const inlineSize = element.ownerDocument.defaultView[writingMode === 'horizontal-tb' ? 'innerWidth' : 'innerHeight']
            return length(value.value * inlineSize, 'px')
        }
        case 'cqmax': {
            const inlineSize = getComputedLength({ ...value, unit: 'cqi' }, element, property)
            const blockSize = getComputedLength({ ...value, unit: 'cqb' }, element, property)
            return inlineSize.value < blockSize.value ? blockSize : inlineSize
        }
        case 'cqmin': {
            const inlineSize = getComputedLength({ ...value, unit: 'cqi' }, element, property)
            const blockSize = getComputedLength({ ...value, unit: 'cqb' }, element, property)
            return inlineSize.value < blockSize.value ? inlineSize : blockSize
        }
        case 'cqw': {
            const writingMode = getComputedValue('writing-mode', element)
            const containerTypes = writingMode.value === 'horizintal-tb' ? ['inline-size', 'size'] : ['size']
            const container = findAncestor(element, element => containerTypes.includes(getSpecifiedValue('container-type', element)))
            if (container) {
                const width = getComputedValue('width', container)
                if (isNumeric(width, { literal: true })) {
                    return length(value.value * width.value, 'px')
                }
                return length(0, 'px')
            }
            const width = element.ownerDocument.defaultView.innerWidth
            return length(value.value * width, 'px')
        }
        case 'dvb': {
            const writingMode = getComputedValue('writing-mode', element)
            const unit = writingMode.value === 'horizontal-tb' ? 'dvh' : 'dvw'
            return getComputedLength({ ...value, unit })
        }
        case 'dvh': {
            const { ownerDocument: { defaultView } } = element
            const inset = states.get(defaultView).shared.get('viewport-ui')
            let { innerHeight } = defaultView
            if (inset.top.expanded) {
                innerHeight -= inset.top.value
            }
            if (inset.bottom.expanded) {
                innerHeight -= inset.bottom.value
            }
            return length(value.value * innerHeight / 100, 'px')
        }
        case 'dvi': {
            const writingMode = getComputedValue('writing-mode', element)
            const unit = writingMode.value === 'horizontal-tb' ? 'dvw' : 'dvh'
            return getComputedLength({ ...value, unit })
        }
        case 'dvmax': {
            const inlineSize = getComputedLength({ ...value, unit: 'dvi' }, element, property)
            const blockSize = getComputedLength({ ...value, unit: 'dvb' }, element, property)
            return inlineSize.value < blockSize.value ? blockSize : inlineSize
        }
        case 'dvmin': {
            const inlineSize = getComputedLength({ ...value, unit: 'dvi' }, element, property)
            const blockSize = getComputedLength({ ...value, unit: 'dvb' }, element, property)
            return inlineSize.value < blockSize.value ? inlineSize : blockSize
        }
        case 'dvw': {
            const { ownerDocument: { defaultView } } = element
            const inset = states.get(defaultView).shared.get('viewport-ui')
            let { innerWidth } = defaultView
            if (inset.right.expanded) {
                innerWidth -= inset.right.value
            }
            if (inset.left.expanded) {
                innerWidth -= inset.left.value
            }
            return length(value.value * innerWidth / 100, 'px')
        }
        case 'em':
        case 'ic': {
            const fontSize = (property === 'font-size' ? getComputedInheritedValue : getComputedValue)('font-size', element)
            return length(value.value * fontSize.value, 'px')
        }
        case 'ex': {
            const fontSize = (property === 'font-size' ? getComputedInheritedValue : getComputedValue)('font-size', element)
            return length(value.value * 0.5 * fontSize.value, 'px')
        }
        case 'lh': {
            if (property === 'font-size' || property === 'line-height') {
                const lineHeight = getInheritedValue('line-height', element)
                if (lineHeight.value === 'normal') {
                    const firstAvailableFontFamily = getFirstAvailableFontFamily(element)
                    const fontSize = getComputedInheritedValue('font-size', element)
                    const lineHeight = getNormalLineHeight(firstAvailableFontFamily, fontSize)
                    return length(value.value * lineHeight, 'px')
                }
                if (lineHeight.types[0] === '<number-token>') {
                    const fontSize = getComputedInheritedValue('font-size', element)
                    return length(value.value * lineHeight.value * fontSize.value, 'px')
                }
                return length(value.value * lineHeight, 'px')
            }
            const lineHeight = getComputedValue('line-height', element)
            if (lineHeight.value === 'normal') {
                const firstAvailableFontFamily = getFirstAvailableFontFamily(element)
                const fontSize = getComputedValue('font-size', element)
                const lineHeight = getNormalLineHeight(firstAvailableFontFamily, fontSize)
                return length(value.value * lineHeight, 'px')
            }
            if (lineHeight.types[0] === '<number-token>') {
                const fontSize = getComputedValue('font-size', element)
                return length(value.value * lineHeight.value * fontSize.value, 'px')
            }
            return length(value.value * lineHeight.value, 'px')
        }
        case 'lvb':
        case 'vb': {
            const writingMode = getComputedValue('writing-mode', element)
            const blockSize = element.ownerDocument.defaultView[writingMode.value === 'horizontal-tb' ? 'innerHeight' : 'innerWidth']
            return length(value.value * blockSize / 100, 'px')
        }
        case 'lvh':
        case 'vh':
            return length(value.value * element.ownerDocument.defaultView.innerHeight / 100, 'px')
        case 'lvi':
        case 'vi': {
            const writingMode = getComputedValue('writing-mode', element).value
            const inlineSize = element.ownerDocument.defaultView[writingMode === 'horizontal-tb' ? 'innerWidth' : 'innerHeight']
            return length(value.value * inlineSize / 100, 'px')
        }
        case 'lvmax':
        case 'vmax': {
            const { ownerDocument: { defaultView: { innerHeight, innerWidth } } } = element
            return length(value.value * Math.max(innerHeight, innerWidth) / 100, 'px')
        }
        case 'lvmin':
        case 'vmin': {
            const { ownerDocument: { defaultView: { innerHeight, innerWidth } } } = element
            return length(value.value * Math.min(innerHeight, innerWidth) / 100, 'px')
        }
        case 'lvw':
        case 'vw':
            return length(value.value * element.ownerDocument.defaultView.innerWidth / 100, 'px')
        case 'rcap': {
            const root = element.ownerDocument.documentElement
            const firstAvailableFontFamily = getFirstAvailableFontFamily(root)
            const { ascent } = getFontFamilyMetrics(firstAvailableFontFamily)
            if (element === root && property === 'font-size') {
                const fontSize = getUserPreferredFontSize(element)
                return length(value.value * ascent * fontSize, 'px')
            }
            const fontSize = getComputedValue('font-size', root)
            return length(value.value * ascent * fontSize.value, 'px')
        }
        case 'rch': {
            const root = element.ownerDocument.documentElement
            const writingMode = getComputedValue('writing-mode', root)
            const textOrientation = getComputedValue('text-orientation', root)
            const measure = (writingMode.value.startsWith('vertical') && textOrientation.value === 'upright') ? 1 : 0.5
            if (element === root && property === 'font-size') {
                const fontSize = getUserPreferredFontSize(element)
                return length(value.value * measure * fontSize, 'px')
            }
            const fontSize = getComputedValue('font-size', root)
            return length(value.value * measure * fontSize.value, 'px')
        }
        case 'rem':
        case 'ric': {
            const root = element.ownerDocument.documentElement
            if (element === root && property === 'font-size') {
                const fontSize = getUserPreferredFontSize(element)
                return length(value.value * fontSize, 'px')
            }
            const fontSize = getComputedValue('font-size', root)
            return length(value.value * fontSize.value, 'px')
        }
        case 'rex': {
            const root = element.ownerDocument.documentElement
            if (element === root && property === 'font-size') {
                const fontSize = getUserPreferredFontSize(element)
                return length(value.value * 0.5 * fontSize, 'px')
            }
            const fontSize = getComputedValue('font-size', root)
            return length(value.value * 0.5 * fontSize.value, 'px')
        }
        case 'rlh': {
            const root = element.ownerDocument.documentElement
            if (element === root && (property === 'font-size' || property === 'line-height')) {
                const firstAvailableFontFamily = getFirstAvailableFontFamily(root)
                const fontSize = getComputedInitialValue('font-size', root)
                const lineHeight = getNormalLineHeight(firstAvailableFontFamily, fontSize)
                return length(value.value * lineHeight, 'px')
            }
            const lineHeight = getComputedValue('line-height', root)
            if (lineHeight.value === 'normal') {
                const firstAvailableFontFamily = getFirstAvailableFontFamily(root)
                const fontSize = getComputedValue('font-size', root)
                const lineHeight = getNormalLineHeight(firstAvailableFontFamily, fontSize)
                return length(value.value * lineHeight, 'px')
            }
            if (lineHeight.types[0] === '<number-token>') {
                const fontSize = getComputedValue('font-size', root)
                return length(value.value * lineHeight.value * fontSize.value, 'px')
            }
            return length(value.value * lineHeight.value, 'px')
        }
        case 'svb': {
            const writingMode = getComputedValue('writing-mode', element)
            const unit = writingMode.value === 'horizontal-tb' ? 'svh' : 'svw'
            return getComputedLength({ ...value, unit })
        }
        case 'svh': {
            const inset = states.get(defaultView).shared.get('viewport-ui')
            let { ownerDocument: { defaultView: { innerHeight } } } = element
            innerHeight -= inset.top.value
            innerHeight -= inset.bottom.value
            return length(value.value * innerHeight / 100, 'px')
        }
        case 'svi': {
            const writingMode = getComputedValue('writing-mode', element)
            const unit = writingMode.value === 'horizontal-tb' ? 'svw' : 'svh'
            return getComputedLength({ ...value, unit })
        }
        case 'svmax': {
            const inlineSize = getComputedLength({ ...value, unit: 'svi' }, element, property)
            const blockSize = getComputedLength({ ...value, unit: 'svb' }, element, property)
            return inlineSize.value < blockSize.value ? blockSize : inlineSize
        }
        case 'svmin': {
            const inlineSize = getComputedLength({ ...value, unit: 'svi' }, element, property)
            const blockSize = getComputedLength({ ...value, unit: 'svb' }, element, property)
            return inlineSize.value < blockSize.value ? inlineSize : blockSize
        }
        case 'svw': {
            const inset = states.get(defaultView).shared.get('viewport-ui')
            let { ownerDocument: { defaultView: { innerWidth } } } = element
            innerWidth -= inset.right.value
            innerWidth -= inset.left.value
            return length(value.value * innerWidth / 100, 'px')
        }
        default:
            return value
    }
}

/**
 * @param {object} percentage
 * @param {Element} element
 * @param {string} property
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#percentage-value}
 */
function getComputedPercentage(percentage, element, property) {
    switch (property) {
        case 'font-size':
            return length(percentage.value * getComputedInheritedValue('font-size', element).value / 100, 'px')
        default:
            return percentage
    }
}

/**
 * @param {object} size
 * @param {Element} element
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#typedef-relative-size}
 */
function getComputedRelativeSize({ value }, element) {
    const inherited = getComputedInheritedValue('font-size', element).value
    switch (value) {
        case 'larger':
            return length(inherited * 1.2, 'px')
        case 'smaller':
            return length(inherited / 1.2, 'px')
        default:
            throw RangeError('Unexpected relative size')
    }
}

/**
 * @param {*} value
 * @param {string} property
 * @param {Element} element
 * @returns {*}
 */
function getComputedComponentValue(value, property, element) {
    if (isList(value)) {
        return map(value, value => getComputedComponentValue(value, property, element))
    }
    const { types } = value
    for (let index = types.length - 1; 0 <= index; --index) {
        switch (types[index]) {
            case "<'animation-timeline'>":
                return getAnimationTimelineInterpolationProgress(value, element)
            case '<absolute-size>':
                return getComputedAbsoluteSize(value, element)
            case '<calc-function>':
                return getComputedCalculationFunction(value, element, property)
            case '<color>':
                return getComputedColor(value, element)
            case '<length>':
                return getComputedLength(value, element, property)
            case '<percentage>':
                return getComputedPercentage(value, element, property)
            case '<relative-size>':
                return getComputedRelativeSize(value, element)
        }
    }
    return value
}

/**
 * @param {object} size
 * @param {Element} element
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-size}
 */
function getComputedFontSize(size, element) {
    if (size.value === 'math') {
        const inherited = getInheritedValue('math-depth', element)
        const computed = getComputedValue('math-depth', element)
        if (inherited.value === computed.value) {
            return inherited
        }
        if (computed.value < inherited.value) {
            return length(inherited.value / (0.71 ** (a.value - b.value)), 'px')
        }
        return length(inherited.value * (0.71 ** (b.value - a.value)), 'px')
    }
    return getComputedComponentValue(size, 'font-size', element)
}

/**
 * @param {string} property
 * @param {Element} element
 * @returns {*}
 */
function getComputedInheritedValue(property, element) {
    const parent = getParent(element)
    if (parent) {
        return getComputedValue(property, parent)
    }
    return getComputedInitialValue(property, element)
}

/**
 * @param {string} property
 * @param {Element} element
 * @returns {*}
 */
function getComputedInitialValue(property, element) {
    return getComputedValue(property, element, getInitialValue(property))
}

/**
 * @param {string} property
 * @param {Element} element
 * @param {*} specified
 * @returns {*}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#computed-value}
 */
function getComputedValue(property, element, specified = getSpecifiedValue(property, element)) {

    // Initial custom property value
    if (specified === null) {
        return specified
    }

    // Arbitrary substitution containing value

    // <whole-value>

    switch (property) {
        case 'font-size':
            return getComputedFontSize(specified, element)
        default:
            return getComputedComponentValue(specified, property, element)
    }
}

/**
 * @param {string} property
 * @param {Element} element
 * @param {*} computed
 * @returns {*}
 * @see {@link https://drafts.csswg.org/cssom-1/#resolved-value}
 */
function getResolvedValue(property, element, computed = getComputedValue(property, element)) {
    switch (property) {
        case 'background-color':
        case 'border-block-end-color':
        case 'border-block-start-color':
        case 'border-bottom-color':
        case 'border-inline-end-color':
        case 'border-inline-start-color':
        case 'border-left-color':
        case 'border-right-color':
        case 'border-top-color':
        case 'box-shadow':
        case 'caret-color':
        case 'color':
        case 'outline-color':
            return getUsedValue(property, element, computed)
        case 'line-height':
            if (computed.value === 'normal') {
                return computed
            }
            return getUsedValue('line-height', element, computed)
        default:
            return computed
    }
}

/**
 * @param {object} fn
 * @param {Element} element
 * @param {string} property
 * @returns {https://drafts.csswg.org/css-values-4/#calc-computed-value}
 */
function getUsedCalculationFunction({ range, round, type, value }, element, property) {
    if (!isNumeric(value, { literal: true })) {
        const resolutionType = type.percentHint ? `<${type.percentHint}>` : null
        value = simplifyCalculation(
            map(value, value => getComputedComponentValue(value, property, element)),
            resolutionType,
            element.ownerDocument.defaultView.devicePixelRatio)
    }
    let resolved = clamp(range.min, value.value, range.max)
    if (round) {
        resolved = Math.round(clamped)
    }
    return { ...value, value: resolved }
}

/**
 * @param {*} value
 * @param {string} property
 * @param {Element} element
 * @returns {*}
 */
function getUsedComponentValue(value, property, element) {
    if (isList(value)) {
        return map(value, value => getUsedComponentValue(value, property, element))
    }
    const { types } = value
    for (let index = types.length - 1; 0 <= index; --index) {
        switch (types[index]) {
            case '<calc-function>':
                return getUsedCalculationFunction(value, element, property)
        }
    }
    return value
}

/**
 * @param {*} color
 * @param {string} property
 * @param {Element} element
 * @returns {*}
 */
function getUsedColor(color, property, element) {
    if (color.types.includes('<color>')) {
        if (color.value === 'currentcolor') {
            if (property === 'color') {
                const parent = getParent(element)
                if (parent) {
                    return getResolvedValue('color', parent)
                }
                const initial = getInitialValue('color')
                const computed = getComputedValue('color', element, initial)
                return getResolvedValue('color', element, computed)
            }
            return getResolvedValue('color', element)
        }
        return color
    }
    return isList(color) ? map(color, value => getUsedColor(value, property, element)) : color
}

/**
 * @param {object} direction
 * @param {Element} element
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-writing-modes-4/#propdef-direction}
 */
function getUsedDirection(direction, element) {
    if (getUsedValue('text-orientation', element).value === 'upright') {
        return keyword('rtl', ['text-orientation'])
    }
    return direction
}

/**
 * @param {object} height
 * @param {Element} element
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-inline-3/#propdef-line-height}
 */
function getUsedLineHeight(height, element) {
    if (height.value === 'normal') {
        const firstAvailableFontFamily = getFirstAvailableFontFamily(element)
        const fontSize = getUsedValue('font-size', element)
        const lineHeight = getNormalLineHeight(firstAvailableFontFamily, fontSize)
        return length(value.value * lineHeight, 'px')
    }
    if (height.types[0] === '<number-token>') {
        const fontSize = getUsedValue('font-size', element)
        return length(height.value * fontSize.value, 'px')
    }
    return height
}

/**
 * @param {string} property
 * @param {Element} element
 * @param {*} [computed]
 * @returns {*}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#used-value}
 */
function getUsedValue(property, element, computed = getComputedValue(property, element)) {
    switch (property) {
        case 'background-color':
        case 'border-block-end-color':
        case 'border-block-start-color':
        case 'border-bottom-color':
        case 'border-inline-end-color':
        case 'border-inline-start-color':
        case 'border-left-color':
        case 'border-right-color':
        case 'border-top-color':
        case 'box-shadow-color':
        case 'caret-color':
        case 'color':
        case 'outline-color':
            return getUsedColor(computed, property, element)
        case 'direction':
            return getUsedDirection(computed, element)
        case 'line-height':
            return getUsedLineHeight(computed, element)
        default:
            return getUsedComponentValue(computed, property, element)
    }
}

export {
    getComputedValue,
    getInitialValue,
    getResolvedValue,
    getSpecifiedValue,
    getUsedValue,
}
