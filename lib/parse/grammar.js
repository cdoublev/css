
const { createPermutationIterator, getPermutationIndex } = require('./permutation.js')
const { isBranch, isCSSType, isSequence } = require('../utils/definition.js')
const { isDelimiter, isList, isOmitted, isSimpleBlock } = require('../utils/value.js')
const { list, omitted } = require('../values/value.js')
const Stream = require('./stream.js')
const actions = require('./actions.js')
const arbitrary = require('./arbitrary.js')
const forgiving = require('../values/forgiving.js')
const parseDefinition = require('./definition.js')

const states = {
    aborted: {},
    aborting: {
        actions: [intercept],
        transitions: [
            { condition: isError, state: 'aborted' },
            { state: 'accepted' },
        ],
    },
    // Result of matching omitted value, preprocessing, replacing, intercepting error: disallow backtracking
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
            { condition: either(isNull, [isUndefined, isInputAtEnd], [isOmitted, isRequired]), state: 'rejected' },
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
 * @returns {object|string|null}
 */
function getNodeName({ definition: { type, name, value } }) {
    if (type === 'token') {
        return name ?? value
    }
    if (type === 'function') {
        return null
    }
    return name
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
 * @param {SyntaxError|object|object[]} [value]
 * @returns {boolean}
 */
function isError(value) {
    return value instanceof SyntaxError
}

/**
 * @param {object|object[]|null} [value]
 * @param {object} node
 * @returns {boolean}
 */
function isInputAtEnd(value, node) {
    return node.input.atEnd()
}

/**
 * @param {null} value
 * @param {object} node
 * @returns {boolean}
 */
function isNonTerminal(value, node) {
    return isBranch(node.definition)
}

/**
 * @param {SyntaxError|object|object[]|null} [value]
 * @returns {boolean}
 */
function isNull(value) {
    return value === null
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

/**
 * @param {SyntaxError|object|object[]|null} [value]
 * @returns {boolean}
 */
function isUndefined(value) {
    return value === undefined
}

// Actions

/**
 * @param {object} node
 * @param {object} parser
 * @param {object|object[]} value
 */
function assign(node, parser, value) {
    return node.value = value
}

/**
 * @param {object} node
 * @param {object} parser
 * @param {object|object[]} value
 * @returns {SyntaxError|object|object[]}
 */
function intercept(node, parser, error) {
    return actions.intercept[node.definition.name]?.(error, node, parser) ?? error
}

/**
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|object[]|null|undefined}
 */
function match(node, parser) {
    const { context, definition, input } = node
    if (isBranch(definition)) {
        return traverse(node, parser)
    }
    const { name, type } = definition
    switch (type) {
        case 'arbitrary':
            return arbitrary[name](node, parser)
        case 'forgiving':
            return parser.parseCSSGrammarList(input, forgiving[name], { ...context, forgiving: true })
        case 'function':
            return input.consume(matchFunction, node, parser)
        case 'omitted':
            return omitted
        case 'simple-block':
            return input.consume(matchSimpleBlock, node, parser)
        case 'token':
            return input.consume(matchToken, node)
        default:
            throw RangeError('Unrecognized node definition type')
    }
}

/**
 * @param {object} value
 * @param {object} node
 * @param {object} parser
 * @returns {object|null}
 */
function matchSimpleBlock(value, node, parser) {
    const { context, definition, input } = node
    if (isSimpleBlock(definition.associatedToken, value)) {
        const match = parser.parseCSSValue(
            new Stream(value.value, input.source),
            definition.value,
            context)
        if (match instanceof SyntaxError) {
            return match
        }
        if (match) {
            return { ...value, value: match }
        }
    }
    return null
}

/**
 * @param {object} value
 * @param {object} node
 * @param {object} parser
 * @returns {object|null}
 */
function matchFunction(value, node, parser) {
    if (value.types[0] !== '<function>') {
        return null
    }
    const { context, definition, input } = node
    const ctx = { ...context, function: node }
    if (definition.name) {
        const match = parser.parseCSSValue(value.name, definition.name, ctx)
        if (match === null || match instanceof SyntaxError) {
            return match
        }
        value = { ...value, name: match.value }
    }
    if (definition.value) {
        const list = new Stream(value.value, input.source)
        const match = parser.parseCSSValue(list, definition.value, ctx)
        if (match === null || match instanceof SyntaxError) {
            return match
        }
        value = { ...value, value: match }
    } else if (0 < value.value.length) {
        return null
    }
    return value
}

/**
 * @param {object} value
 * @param {object} node
 * @returns {boolean}
 */
function matchToken(value, node) {
    if (node.definition.name) {
        return value.types[0] === node.definition.name
    }
    return isDelimiter(node.definition.value, value)
}

/**
 * @param {object} node
 * @param {object} parser
 * @param {object|object[]} value
 * @returns {SyntaxError|object|object[]|null|undefined}
 */
function postprocess(node, parser, value) {
    const action = actions.postprocess[getNodeName(node)]
    return action ? action(value, node, parser) : value
}

/**
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|object[]|null|undefined}
 */
function preprocess(node, parser) {
    return actions.preprocess[getNodeName(node)]?.(node, parser)
}

/**
 * @param {object} node
 * @returns {null}
 */
function reject({ input, location }) {
    input.moveTo(location)
    return null
}

/**
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|object[]|null|undefined}
 */
function replace(node, parser) {
    return actions.replace[getNodeName(node)]?.(node, parser)
}

/**
 * @param {object} node
 * @param {object} parser
 * @param {object|object[]} value
 * @returns {object|object[]}
 */
function tag({ definition }, parser, value) {
    const { name } = definition
    if (value !== omitted && isCSSType(definition) && name !== '<declaration>') {
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
function getAlternativeMinLength({ min, type }, alternative) {
    return type === 'repetition' ? min : alternative.length
}

/**
 * @param {object} node
 * @param {object} alternative
 * @yields {object}
 */
function* children(parent, alternative) {
    const { context, children, definition, input } = parent
    const { separator, type } = definition
    const max = getAlternativeMaxLength(definition, alternative)
    let index = Math.max(0, children.length - 1)
    while (index < max) {
        let node = children[index]
        if (node) {
            children.pop()
        } else if (type === 'repetition') {
            node = create(alternative[0], input, context, parent)
        } else {
            node = create(alternative[index], input, context, parent)
        }
        yield node
        children.push(node)
        ++index
        if (separator && index < max) {
            const node = create({ type: 'token', value: separator }, input, context, parent)
            yield node
            children.push(node)
            ++index
        }
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
 * @param {object} parser
 * @returns {SyntaxError|object[]|undefined}
 */
function traverse(node, parser) {

    const { definition, input, context: { separator } } = node
    const isSeparator = isDelimiter(separator)
    const iterator = alternatives(node)

    let alternative = iterator.next().value
    let valid = node.children.length

    while (alternative) {

        for (const child of children(node, alternative)) {
            const match = parse(child, parser)
            if (match === null || match === undefined) {
                break
            }
            if (match instanceof SyntaxError) {
                return match
            }
            ++valid
            if (separator) {
                input.consume(isSeparator)
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
        const listSeparator = definition.separator
        if (listSeparator && (length % 2 === 0)) {
            continue
        }

        if (isSequence(definition)) {
            const { type, value: sequence } = definition
            let value
            if (type === '&&' || type === '||') {
                value = sequence.map(definition =>
                    node.children.find(node => node.definition === definition)?.value ?? omitted)
            } else if (listSeparator) {
                value = node.children.map(node => node.value).filter(value => value.value !== listSeparator)
            } else {
                value = node.children.map(node => node.value)
            }
            return list(value, listSeparator ?? separator)
        }
        return node.children[0].value
    }
}

/**
 * @param {function|function[]} [condition]
 * @param {object} node
 * @param {SyntaxError|object|object[]|null} [value]
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
 * @param {object} parser
 * @param {SyntaxError|object|object[]|null} [value]
 * @returns {object|object[]|null}
 */
function applyTransition({ state }, node, parser, value) {

    const { [state]: { actions = [], transitions } } = states

    node.state = state
    value = actions.reduce((value, action) => action(node, parser, value), value)

    if (transitions) {
        return applyTransition(resolveTransition(node, value), node, parser, value)
    }
    return value
}

/**
 * @param {object} node
 * @param {object|object[]|null} [value]
 * @returns {object}
 */
function resolveTransition(node, value) {
    return states[node.state].transitions.find(transition => evalCondition(transition.condition, node, value))
}

/**
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|object[]|null|undefined}
 */
function parse(node, parser) {
    let transition = states[node.state].next
    if (Array.isArray(transition)) {
        transition = transition.find(({ condition }) => evalCondition(condition, node))
    }
    return applyTransition(transition, node, parser)
}

/**
 * @param {object|string} definition
 * @param {Stream|object} input
 * @param {object} context
 * @param {object} [parent]
 * @returns {object}
 */
function create(definition, input, context, parent = null) {
    if (typeof definition === 'string') {
        definition = parseDefinition(definition, parent?.definition)
    }
    const node = {
        children: [],
        context,
        definition,
        input,
        location: input.index ?? null,
        parent,
        state: 'waiting',
    }
    return actions.configure[definition.name]?.(node) ?? node
}

module.exports = { create, parse }
