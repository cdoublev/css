
import * as colors from './values/colors.js'
import {
    CSSContainerRule,
    CSSImportRule,
    CSSLayerBlockRule,
    CSSLayerStatementRule,
    CSSMediaRule,
    CSSNamespaceRule,
    CSSNestedDeclarations,
    CSSScopeRule,
    CSSStyleRule,
    CSSSupportsRule,
} from './cssom/index.js'
import { delimiter, identToken, list, map, omitted } from './values/value.js'
import { findAncestor, getParent } from './utils/dom.js'
import { isDelimiter, isFailure, isList, isOmitted } from './utils/value.js'
import { matchElementAgainstSelectors, matchTreesAgainstSelectors } from './match/selector.js'
import { ampersand } from './values/defaults.js'
import { implForWrapper } from './cssom/utils.js'
import { isMatchingImportConditions } from './cssom/CSSImportRule-impl.js'
import matchContainer from './match/container.js'
import { parseGrammar } from './parse/parser.js'
import properties from './properties/definitions.js'

const USER_AGENT_ORIGIN = 1
const USER_ORIGIN = 2
const AUTHOR_ORIGIN = 3

const scopeSelector = list([delimiter(':'), identToken('scope')], ['<pseudo-class-selector>', '<subclass-selector>'])


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
    return matchTreesAgainstSelectors([context.tree], getAbsoluteSelectors(end[1].value, context), context)
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
    return matchTreesAgainstSelectors([context.tree], getAbsoluteSelectors(start.value, context), context)
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

        const declaration = rule.style._declarations.find(declaration => declaration.name === property)
        if (declaration) {
            return [{ ...declaration, context }]
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
        const elements = matchTreesAgainstSelectors([context.tree], selectors, context)

        if (0 < elements.length) {
            context = { ...context, selectors: [...context.selectors, selectors] }
            const nestedContext = { ...context, anchors: elements, scopes: undefined }
            const declarations = getRuleListDeclarations(property, element, cssRules, nestedContext)
            if (elements.includes(element)) {
                const declaration = style._declarations.find(declaration => declaration.name === property)
                if (declaration) {
                    declarations.push({ ...declaration, context })
                }
            }
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
 * @param {Document|ShadowRoot} tree
 * @param {number} origin
 * @returns {object}
 */
function createContext(tree, origin) {
    return {
        excludeSubtrees: true,
        layers: [],
        namespaces: new Map,
        origin,
        selectors: [],
        tree,
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
    const tree = element.getRootNode({ compose: true })
    const { adoptedStyleSheets = [], styleSheets } = tree

    const declarations = [
        getStyleSheetDeclarations(property, element, _userAgentStyleSheet, createContext(tree, USER_AGENT_ORIGIN)),
        getStyleSheetDeclarations(property, element, _userStyleSheet, createContext(tree, USER_ORIGIN)),
        getStyleSheetListDeclarations(property, element, styleSheets, createContext(tree, AUTHOR_ORIGIN)),
        getStyleSheetListDeclarations(property, element, adoptedStyleSheets, createContext(tree, AUTHOR_ORIGIN)),
    ]
    const declaration = implForWrapper(style)._declarations.find(declaration => declaration.name === property)
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
            case '<pseudo-class-selector>':
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
            case '<pseudo-element-selector>':
            case '<type-selector>':
                return [0, 0, 1]
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
    const matches = matchElementAgainstSelectors(element, selectors.pop(), context, true)
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

        if (a.context.attached) {
            return 1
        }
        if (b.context.attached) {
            return -1
        }

        if (a.context.origin < b.context.origin) {
            return a.important ? 1 : -1
        }
        if (b.context.origin < a.context.origin) {
            return a.important ? -1 : 1
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
    for (let index = declarations.indexOf(declaration); -1 < index; index--) {
        const { context, value } = declarations[index]
        if (context.origin !== origin) {
            return value
        }
    }
    return getDefaultValue(property, element)
}

/**
 * @param {object} declaration
 * @param {object[]} declarations
 * @returns {*}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#valdef-all-revert-layer}
 */
function getRevertedLayerValue(declaration, declarations) {
    const { context: { layer } } = declaration
    for (let index = declarations.indexOf(declaration); -1 < index; index--) {
        const { context, value } = declarations[index]
        if (context.layer !== layer) {
            return value
        }
    }
    return getDefaultValue(property, element)
}

/**
 * @param {object} declaration
 * @param {object[]} declarations
 * @returns {*}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#valdef-all-revert-rule}
 */
function getRevertedRuleValue(declaration, declarations) {
    return declarations[declarations.indexOf(declaration) - 1]?.value
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
            return getRevertedLayerValue(cascaded, declared)
        case 'revert-rule':
            return getRevertedRuleValue(cascaded, declared)
        default:
            return value
    }
}


// Resolving the computed and used value

/**
 * @param {Element} element
 * @returns {object|object[][]|undefined}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics.html#meta-color-scheme}
 */
function getPageSupportedColorSchemes(element) {
    const { ownerDocument } = element
    if (!ownerDocument) {
        return
    }
    const selector = parseGrammar('meta[name=color-scheme][content]', '<selector-list>')
    const definition = properties['color-scheme'].value
    for (const meta of matchTreesAgainstSelectors([ownerDocument], selector)) {
        const colorScheme = parseGrammar(meta.getAttribute('content'), definition)
        if (!isFailure(colorScheme)) {
            return colorScheme
        }
    }
}

/**
 * @param {Element} element
 * @returns {string|undefined}
 * @see {@link https://drafts.csswg.org/css-color-adjust-1/#propdef-color-scheme}
 */
function getElementSupportedColorSchemes(element) {
    return getCascadedValue('color-scheme', element)?.value
}

/**
 * @param {Element} element
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-color-adjust-1/#determine-the-used-color-scheme}
 */
function getUsedColorScheme(element) {
    const supported = getElementSupportedColorSchemes(element) || getPageSupportedColorSchemes(element)
    if (supported) {
        if (supported.value === 'normal') {
            return 'light'
        }
        const preferred = supported[0].find(({ value }) => value === 'dark' || value === 'light')
        if (preferred) {
            return preferred.value
        }
    }
    return 'light'
}

/**
 * @param {object} value
 * @param {Element} element
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-color-4/#resolving-color-values}
 */
function getComputedColor(value, element) {
    if (value.value === 'transparent') {
        return parseGrammar('rgb(0, 0, 0, 0)', '<color>')
    }
    if (value.types.includes('<deprecated-color>')) {
        return parseGrammar(colors.system[colors.deprecated[value.value]][getUsedColorScheme(element)], '<color>')
    }
    if (value.types.includes('<named-color>')) {
        return parseGrammar(colors.named[value.value], '<color>')
    }
    if (value.types.includes('<system-color>')) {
        return parseGrammar(colors.system[value.value][getUsedColorScheme(element)], '<color>')
    }
    return value
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
            case '<color>':
                return getComputedColor(value, element)
        }
    }
    return value
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
        default:
            return computed
    }
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
        }
    }
    return value
}

/**
 * @param {*} value
 * @param {string} property
 * @param {Element} element
 * @returns {*}
 */
function getColorLikeUsedValue(value, property, element) {
    if (value.types.includes('<color>')) {
        if (value.value === 'currentcolor') {
            if (property === 'color') {
                return getResolvedValue('color', element, getInheritedValue('color', element))
            }
            return getResolvedValue('color', element)
        }
        return value
    }
    return isList(value) ? map(value, value => getColorLikeUsedValue(value, property, element)) : value
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
            return getColorLikeUsedValue(computed, property, element)
        default:
            if (isList(computed)) {
                return map(computed, value => getUsedComponentValue(value, property, element))
            }
            return computed
    }
}

export {
    getComputedValue,
    getInitialValue,
    getResolvedValue,
    getUsedValue,
}
