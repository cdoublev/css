
import * as actions from './actions.js'
import { createPermutationIterator, getPermutationIndex } from './permutation.js'
import { isBranch, type } from '../utils/node.js'
import { isCSSType, isSequence } from '../utils/definition.js'
import { isDelimiter, isError, isList, isNull, isOmitted, isUndefined, isWhitespace } from '../utils/value.js'
import { list, omitted } from '../values/value.js'
import {
    matchBlock,
    matchDeclaration,
    matchFunction,
    matchRule,
    matchToken,
    parseGrammarList,
} from './parser.js'
import arbitrary from './arbitrary.js'
import forgiving from '../values/forgiving.js'
import { isInputAtEnd } from '../utils/context.js'
import parseDefinition from './definition.js'

const states = {
    aborted: {},
    aborting: {
        actions: [abort],
        transitions: [
            { condition: isError, state: 'aborted' },
            { state: 'accepted' },
        ],
    },
    // Result of matching omitted value, preprocessing, replacing, aborting: disallow backtracking
    accepted: {
        actions: [assign],
        next: { state: 'rejected' },
    },
    // Result of matching: allow backtracking for a non-terminal
    matched: {
        actions: [assign],
        next: [
            { condition: isNonTerminal, state: 'matching' },
            { state: 'rejected' },
        ],
    },
    matching: {
        actions: [match],
        transitions: [
            { condition: isError, state: 'aborting' },
            { condition: either(isNull, [isUndefined, isAtEnd], [isOmitted, isRequired]), state: 'rejected' },
            { condition: isUndefined, state: 'replacing' },
            { condition: [isOmitted, isOptional], state: 'accepted' },
            { state: 'postprocessing' },
        ],
    },
    postprocessing: {
        actions: [tag, postprocess],
        transitions: [
            { condition: isError, state: 'aborting' },
            { condition: isNull, state: 'rejected' },
            { condition: isUndefined, state: 'matching' },
            { state: 'matched' },
        ],
    },
    preprocessing: {
        actions: [preprocess],
        transitions: [
            { condition: isError, state: 'aborting' },
            { condition: isNull, state: 'rejected' },
            { condition: isUndefined, state: 'matching' },
            { state: 'accepted' },
        ],
    },
    rejected: {
        actions: [reject],
    },
    replacing: {
        actions: [replace],
        transitions: [
            { condition: isError, state: 'aborting' },
            { condition: either(isUndefined, isNull), state: 'rejected' },
            { state: 'accepted' },
        ],
    },
    waiting: { next: { state: 'preprocessing' } },
}

/**
 * @param {object} node
 * @returns {string|null}
 */
function getNodeName({ definition: { type, name, value } }) {
    switch (type) {
        case 'declaration':
        case 'function':
            return null
        case 'token':
            return name ?? value
        default:
            return name
    }
}

// Guard creators

/**
 * @param  {...function} predicates
 * @returns {boolean}
 */
function either(...predicates) {
    return function hasSomeCondition(...args) {
        return predicates.some(predicate =>
            Array.isArray(predicate)
                ? predicate.every(predicate => predicate(...args))
                : predicate(...args))
    }
}

/**
 * @param  {...function} predicates
 * @returns {boolean}
 */
function not(...predicates) {
    return function hasNotSomeCondition(...args) {
        return predicates.every(predicate =>
            !(Array.isArray(predicate)
                ? predicate.some(predicate => predicate(...args))
                : predicate(...args)))
    }
}

// Guards

/**
 * @param {object|object[]|null} [value]
 * @param {object} node
 * @returns {boolean}
 */
function isAtEnd(value, node) {
    return isInputAtEnd(node)
}

/**
 * @param {object|object[]|null} [value]
 * @param {object} node
 * @returns {boolean}
 */
function isNonTerminal(value, node) {
    return isBranch(node)
}

/**
 * @param {object|object[]|null} [value]
 * @param {object} node
 * @returns {boolean}
 */
function isOptional(value, node) {
    return node.definition.type === 'optional'
}

/**
 * @param {object|object[]|null} [value]
 * @param {object} node
 * @returns {boolean}
 */
function isRequired(value, node) {
    return node.definition.type === 'required'
}

// Actions

/**
 * @param {object} node
 * @param {DOMException|SyntaxError} error
 * @returns {DOMException|SyntaxError|object|object[]}
 */
function abort(node, error) {
    const { definition, input, location } = node
    input.backtrack(location)
    return actions.intercept[definition.name]?.(error, node) ?? error
}

/**
 * @param {object} node
 * @param {object|object[]} value
 */
function assign(node, value) {
    return node.value = value
}

/**
 * @param {object} node
 * @returns {CSSFontFeatureValuesMapImp|CSSRuleImpl|SyntaxError|object|object[]|null|undefined}
 */
function match(node) {
    if (isBranch(node)) {
        return traverse(node)
    }
    const { input, definition: { name, type } } = node
    switch (type) {
        case 'arbitrary':
            return arbitrary[name](node)
        case 'block':
            return matchBlock(node)
        case 'declaration':
            return matchDeclaration(node)
        case 'forgiving':
            return parseGrammarList(input, forgiving[name], node)
        case 'function':
            return matchFunction(node)
        case 'omitted':
            return omitted
        case 'rule':
            return matchRule(node)
        case 'token':
            return matchToken(node)
        default:
            throw RangeError('Unrecognized node definition type')
    }
}

/**
 * @param {object} node
 * @param {object|object[]} value
 * @returns {CSSFontFeatureValuesMapImp|CSSRuleImpl|SyntaxError|object|object[]|null|undefined}
 */
function postprocess(node, value) {
    const action = actions.postprocess[getNodeName(node)]
    return action ? action(value, node) : value
}

/**
 * @param {object} node
 * @returns {SyntaxError|object|object[]|null|undefined}
 */
function preprocess(node) {
    return actions.preprocess[getNodeName(node)]?.(node)
}

/**
 * @param {object} node
 * @returns {null}
 */
function reject({ input, location }) {
    input.backtrack(location)
    return null
}

/**
 * @param {object} node
 * @returns {SyntaxError|object|object[]|null|undefined}
 */
function replace(node) {
    return actions.replace[getNodeName(node)]?.(node)
}

/**
 * @param {object} node
 * @param {CSSFontFeatureValuesMapImp|CSSRuleImpl|object|object[]} value
 * @returns {object|object[]}
 */
function tag({ definition }, value) {
    const { name } = definition
    if (value !== omitted && isCSSType(definition) && definition.type !== 'rule') {
        if (!isList(value)) {
            value = { ...value, types: [...value.types] }
        }
        value.types.push(name)
    }
    return value
}

/**
 * @param {object} definition
 * @param {object} alternative
 * @returns {number}
 */
function getAlternativeMaxLength({ max, separator, type }, alternative) {
    if (type === 'repetition') {
        return separator ? (max * 2) - 1 : max
    }
    return alternative.length
}

/**
 * @param {object} definition
 * @param {object} alternative
 * @returns {number}
 */
function getAlternativeMinLength({ min, separator, type }, alternative) {
    if (type === 'repetition') {
        return separator ? (min * 2) - 1 : min
    }
    return alternative.length
}

/**
 * @param {object} parent
 * @param {object} alternative
 * @yields {object}
 */
function* children(parent, alternative) {
    const { context, children, definition, input } = parent
    const { separator, type } = definition
    const max = getAlternativeMaxLength(definition, alternative)
    let index = Math.max(0, children.length - 1)
    while (index < max) {
        let node
        if (children[index]) {
            node = children.pop()
        } else if (separator && index % 2) {
            node = create({ type: 'token', value: separator }, input, context, parent)
        } else if (type === 'repetition') {
            node = create(alternative[0], input, context, parent)
        } else {
            node = create(alternative[index], input, context, parent)
        }
        yield node
        children.push(node)
        ++index
    }
}

/**
 * @param {object} node
 * @yields {object}
 */
function* alternatives({ children, definition: { type, value: set }, value }) {
    if (type === '&&' || type === '||') {
        const index = 0 < children.length
            ? getPermutationIndex(set, children.map(node => node.definition))
            : 0
        yield* createPermutationIterator(set, type === '&&', index)
    } else if (type === '|') {
        if (0 < children.length) {
            set = set.slice(set.indexOf(children[0].definition))
        }
        for (const alternative of set) {
            yield [alternative]
        }
    } else if (type === 'optional') {
        if (0 < children.length && children[0].definition.type === 'omitted') {
            return
        }
        yield [set]
        yield [{ type: 'omitted' }]
    } else if (type === 'repetition') {
        if (0 === children.length && value) {
            return
        }
        yield [set]
    } else if (type === ' ') {
        yield set
    } else {
        yield [set]
    }
}

/**
 * @param {object} node
 * @returns {SyntaxError|object[]|undefined}
 */
function traverse(node) {

    const { context, definition, input } = node
    const { type, separator, value } = definition
    const noWhitespace = context.separator === ''
    const iterator = alternatives(node)

    let alternative = iterator.next().value
    let valid = node.children.length

    while (alternative) {

        for (const child of children(node, alternative)) {
            const match = parse(child)
            if (!match) {
                break
            }
            if (isError(match)) {
                return match
            }
            ++valid
            if (!noWhitespace) {
                input.consume(isWhitespace)
            }
        }

        const { children: { length } } = node
        if (length < getAlternativeMinLength(definition, alternative)) {
            if (length === 0) {
                alternative = iterator.next(valid).value
                valid = 0
            }
            continue
        }
        if (separator && (length % 2 === 0)) {
            continue
        }

        if (isSequence(definition)) {
            let values
            if (type === '&&' || type === '||') {
                values = value.map(definition =>
                    node.children.find(node => node.definition === definition)?.value ?? omitted)
            } else if (separator) {
                values = node.children.map(node => node.value).filter(value => !isDelimiter(separator, value))
            } else {
                values = node.children.map(node => node.value)
            }
            if (separator) {
                return list(values, separator)
            }
            return list(values, noWhitespace ? '' : ' ')
        }
        return node.children[0].value
    }
}

/**
 * @param {function|function[]} [condition]
 * @param {object} node
 * @param {CSSFontFeatureValuesMapImp|CSSRuleImpl|DOMException|SyntaxError|object|object[]|null} [value]
 * @returns {boolean}
 */
function evalCondition(condition, node, value) {
    if (Array.isArray(condition)) {
        return condition.every(condition => evalCondition(condition, node, value))
    }
    return condition ? condition(value, node) : true
}

/**
 * @param {object} transition
 * @param {object} node
 * @param {CSSFontFeatureValuesMapImp|CSSRuleImpl|DOMException|SyntaxError|object|object[]|null} [value]
 * @returns {CSSFontFeatureValuesMapImp|CSSRuleImpl|DOMException|SyntaxError|object|object[]|null|undefined}
 */
function applyTransition({ state }, node, value) {

    const { [state]: { actions = [], transitions } } = states

    node.state = state
    value = actions.reduce((value, action) => action(node, value), value)

    if (transitions) {
        return applyTransition(resolveTransition(node, value), node, value)
    }
    return value
}

/**
 * @param {object} node
 * @param {CSSFontFeatureValuesMapImp|CSSRuleImpl|DOMException|SyntaxError|object|object[]|null} [value]
 * @returns {object}
 */
function resolveTransition(node, value) {
    return states[node.state].transitions.find(transition => evalCondition(transition.condition, node, value))
}

/**
 * @param {object} node
 * @returns {CSSFontFeatureValuesMapImp|CSSRuleImpl|DOMException|SyntaxError|object|object[]|null|undefined}
 */
export function parse(node) {
    let transition = states[node.state].next
    if (Array.isArray(transition)) {
        transition = transition.find(({ condition }) => evalCondition(condition, node))
    }
    return applyTransition(transition, node)
}

/**
 * @param {object|string} definition
 * @param {Stream|object} input
 * @param {object} context
 * @param {object} [parent]
 * @returns {object}
 */
export function create(definition, input, context, parent = null) {
    if (typeof definition === 'function') {
        definition = definition?.(parent)
    }
    if (typeof definition === 'string') {
        definition = parseDefinition(definition, parent?.definition)
    }
    const node = {
        children: [],
        context,
        definition,
        input,
        location: input.index,
        parent,
        state: 'waiting',
        type,
        value: undefined,
    }
    return actions.configure[definition.name]?.(node) ?? node
}
