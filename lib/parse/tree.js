
const { aliases, mappings } = require('../values/compatibility.js')
const { isDelimiter, isOmitted } = require('../values/validation.js')
const Stream = require('./stream.js')
const { createList } = require('../values/value.js')
const createOmitted = require('../values/omitted.js')
const { createPermutationIterator } = require('./permutation.js')
const forgiving = require('../values/forgiving.js')
const hooks = require('./hooks.js')
const { isSequence } = require('./validation.js')
const { map } = require('../values/value.js')
const parseDefinition = require('./definition.js')

const configuration = {
    initial: 'waiting',
    statuses: {
        // Result of preprocess or replace: disallow backtracking
        accepted: {
            enter: [assign, configure],
            on: { ENTER: { target: 'rejected' } },
        },
        backtracking: {
            always: [
                { condition: isUndefined, target: 'matching' },
                { condition: [isNull, either(isAborted, isListAtEnd)], target: 'rejected' },
                { condition: isNull, target: 'replacing' },
                { target: 'accepted' },
            ],
            enter: [backtrack],
        },
        // Result of matching: allow backtracking
        matched: {
            enter: [assign, configure],
            on: { ENTER: { actions: [deleteType, configure], target: 'backtracking' } },
        },
        matching: {
            always: [
                { condition: either(isAborted, [isRequired, isOmitted]), target: 'rejected' },
                { condition: isNull, target: 'backtracking' },
                { target: 'postprocessing' },
            ],
            enter: [match],
        },
        postprocessing: {
            always: [
                { condition: isUndefined, target: 'backtracking' },
                { actions: [abort], condition: isError, target: 'rejected' },
                { condition: isNull, target: 'rejected' },
                { target: 'matched' },
            ],
            enter: [zip, addType, postprocess],
        },
        preprocessing: {
            always: [
                { condition: isUndefined, target: 'matching' },
                { actions: [abort], condition: isError, target: 'rejected' },
                { condition: isNull, target: 'rejected' },
                { target: 'accepted' },
            ],
            enter: [preprocess],
        },
        rejected: {
            enter: [clear, configure],
        },
        replacing: {
            always: [
                { condition: isNull, target: 'rejected' },
                { target: 'accepted' },
            ],
            enter: [replace],
        },
        waiting: { on: { ENTER: { actions: [configure], target: 'preprocessing' } } },
    },
}

/**
 * @param {object} node
 * @returns {object|string}
 */
function getNodeName({ definition: { value, name = value } }) {
    return name
}

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
 * @param {object|object[]|null} [value]
 * @param {object} node
 * @param {Parser} parser
 * @returns {boolean}
 */
function isAborted(value, node, parser) {
    return parser.tree.abort
}

/**
 * @param {Error|object|object[]|null} [value]
 * @returns {boolean}
 */
function isError(value) {
    return value instanceof Error
}

/**
 * @param {object|object[]|null} [value]
 * @param {object} node
 * @param {Parser} parser
 * @returns {boolean}
 */
function isListAtEnd(value, node, parser) {
    return parser.tree.list.atEnd()
}

/**
 * @param {Error|object|object[]|null} [value]
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
function isRequired(value, node) {
    return node.definition.type === 'required'
}

/**
 * @param {Error|object|object[]|null} [value]
 * @returns {boolean}
 */
function isUndefined(value) {
    return value === undefined
}

// Actions

/**
 * @param {Parser} parser
 */
function abort({ tree, trees }) {
    const strict = trees[0].root.definition.name === 'supports-condition'
    tree.abort = true
    let { parent } = tree
    while (parent && (strict || !forgiving.includes(parent.root.definition.name))) {
        parent.abort = true
        parent = parent.parent
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @param {string} event
 * @param {object|object[]} value
 * @returns {object|object[]}
 */
function addType(parser, { definition: { name, type } }, event, value) {
    if (name && type !== 'function') {
        value.type.add(name)
    }
    return value
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @param {string} event
 * @param {object|object[]|null} value
 */
function assign(parser, node, event, value) {
    return node.value = value
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {object|null|undefined}
 */
function backtrack(parser, node) {

    const { tree } = parser
    const { list, nodes, separator, tail } = tree
    const { definition, location, state } = node
    const { type } = definition
    const { children, value } = state

    if (type === ' ' || type === '&&' || type === '||') {
        if (tail === node) {
            if (children.permute()) {
                list.moveTo(location)
                return
            }
            return null
        }
        value.pop()
        if (tail.definition === children.pop()) {
            nodes.pop()
            return backtrack(parser, node)
        }
        return
    }
    if (type === '|') {
        if (tail === node) {
            children.shift()
            if (children.length === 0) {
                return null
            }
        } else if (tail.definition === children[0]) {
            nodes.pop()
            return backtrack(parser, node)
        }
        list.moveTo(location)
        return
    }
    if (type === 'repeat') {
        if (tail === node) {
            return null
        }
        value.pop()
        if (tail.definition === children.at(-1)) {
            // Resume parsing next node
            if (separator && 1 < value.length) {
                children.pop()
                nodes.pop()
                value.pop()
            }
            list.moveTo(tree.tail.location)
            children.done = true
            children.pop()
            nodes.pop()
        } else {
            // Resume parsing child node (last iteration)
            children.done = false
        }
        return
    }
    if (type === 'optional') {
        if (tail === node) {
            return createOmitted(definition)
        }
        if (tail.definition === definition.value) {
            list.moveTo(location)
            nodes.pop()
            return createOmitted(definition)
        }
        return
    }
    // descriptor, property, non-terminal, required, leaf
    if (tail === node) {
        return null
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {null}
 */
function clear({ tree: { list, nodes } }, node) {
    list.moveTo(node.location)
    nodes.splice(nodes.indexOf(node))
    return null
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @param {string} event
 * @returns {object|object[]|null}
 */
function configure(parser, node, event, value) {
    hooks.configure[getNodeName(node)]?.(parser, node, event)
    return value
}

/**
 * @param {Parser} parser
 * @param {object} node
 */
function deleteType(parser, { definition: { name, type }, value }) {
    if (name && (type === 'non-terminal' || type === 'property' || type === 'descriptor')) {
        value.type.delete(name)
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {object|object[]|null}
 */
function match(parser, node) {
    const { productions: { structures, terminals }, tree } = parser
    const { list } = tree
    const { definition, state } = node
    const { name, type, value } = definition
    switch (type) {
        case ' ':
        case '&&':
        case '||':
        case 'repeat':
            return tree.traverse(node)
        case '|':
            return tree.enter(state.children[0], node)
        case 'descriptor':
        case 'non-terminal':
        case 'property':
            return tree.enter(state.child, node)
        case 'optional':
        case 'required':
            return tree.enter(value, node)
        case 'structure':
            return structures[name](list, parser)
    }
    if (list.atEnd()) {
        return null
    }
    switch (type) {
        case 'delimiter':
            return list.consume(isDelimiter(value))
        case 'function':
            return list.consume(fn => {
                const type = `${name}()`
                const input = `${fn.name}()`
                if (type === aliases.get(input)) {
                    fn = { ...fn, name }
                }
                if (name === fn.name || type === mappings.get(input)) {
                    const match = parser.parseValue(fn.value, value)
                    if (match) {
                        return map(fn, () => match, true)
                    }
                }
                return null
            })
        case 'simple-block':
            return list.consume(block => {
                if (block.type.has('simple-block')) {
                    const match = parser.parseValue(block.value, value)
                    if (match) {
                        return map(block, () => match, true)
                    }
                }
                return null
            })
        case 'terminal':
            return list.consume(terminals[name], definition)
        default:
            throw RangeError('Unrecognized node type')
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @param {string} event
 * @returns {Error|object|object[]|null}
 */
function postprocess(parser, node, event, value) {
    const { postprocess: { [getNodeName(node)]: action } } = hooks
    return action ? action(value, parser, node) : value
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object|object[]|null|undefined}
 */
function preprocess(parser, node) {
    return hooks.preprocess[getNodeName(node)]?.(parser, node)
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {object[]|object|null}
 */
function replace(parser, node) {
    return hooks.replace[getNodeName(node)]?.(parser, node) ?? null
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @param {string} event
 * @param {object|object[]} value
 */
function zip(parser, node, event, value) {
    const { definition, state } = node
    if (isSequence(definition)) {
        const { separator = parser.tree.separator, type, value: definitions } = definition
        if (type === '&&' || type === '||') {
            // Sort in canonical order
            value = definitions.map(definition => {
                const index = state.children.indexOf(definition)
                return -1 < index ? value[index] : createOmitted(definition)
            })
        } else if (type === 'repeat' && separator !== ' ') {
            value = value.filter(({ value }) => value !== separator)
        }
        value = createList(value, separator)
    }
    return value
}

/**
 * @param {function|function[]} [condition]
 * @param {object|object[]|null} [value]
 * @param {object} node
 * @param {Parser} parser
 * @returns {boolean}
 */
function evalCondition(condition, value, node, parser) {
    if (Array.isArray(condition)) {
        return condition.every(condition => evalCondition(condition, value, node, parser))
    }
    return condition ? condition(value, node, parser) : true
}

/**
 * @param {object} transition
 * @param {ParseTree} tree
 * @param {object} configuration
 * @param {object} node
 * @param {string} event
 * @param {object|object[]} [value]
 * @returns {object|object[]|null}
 */
function applyTransition({ actions = [], target }, tree, configuration, node, event, value) {

    const { observers, parser } = tree
    const { statuses: { [target]: { enter = [], always } } } = configuration
    const { status } = node

    actions = [...actions, ...enter]
    observers.forEach(observer => {
        const { callback, event: oe, node: on, once, status: os } = observer
        if (on === node && os === status && (!oe || oe === event)) {
            actions.push(callback)
            if (once) {
                tree.unsubscribe(observer)
            }
        }
    })

    node.status = target
    value = actions.reduce((value, action) => action(parser, node, event, value), value)

    if (always) {
        const transition = resolveTransition(tree, configuration, node, 'always', value)
        return applyTransition(transition, tree, configuration, node, 'always', value)
    }
    return value
}

/**
 * @param {ParseTree} tree
 * @param {object} configuration
 * @param {object} node
 * @param {string} event
 * @param {object|object[]|null} [value]
 * @returns {object|undefined}
 */
function resolveTransition({ parser }, configuration, node, event, value) {
    const { on: events = {}, statuses: { [node.status]: { always, on } } } = configuration
    // { always: [{ condition, target }, ...], ... }
    if (always) {
        const transition = always.find(({ condition }) => evalCondition(condition, value, node, parser))
        if (transition) {
            return transition
        }
    }
    // { on: [{ condition, event, target }, ...] }
    if (Array.isArray(on)) {
        return on.find(({ event: target }) => target === event || target === '*')
    }
    if (on) {
        const { [event]: transition } = on
        // { on: { [event]: [{ condition, target }, ...] } }
        if (Array.isArray(transition)) {
            return transition.find(({ condition }) => evalCondition(condition, value, node, parser))
        }
        // { on: { [event]: { target } } }
        if (transition) {
            return transition
        }
    }
    // Global or wildcard (match any) event
    return events[event] ?? on?.['*']
}

/**
 * @param {object} definition
 * @returns {object}
 */
function createMultipliedNodeState({ max, separator, value: multiplied }) {
    const limit = separator ? (max * 2) - 1 : max
    const value = []
    const matched = []
    const children = {
        done: false,
        * [Symbol.iterator]() {
            while (!children.done) {
                const definition = matched[value.length]
                if (definition) {
                    yield definition
                } else {
                    const definition = structuredClone(multiplied)
                    yield definition
                    matched.push(definition)
                }
                if (limit === value.length) {
                    break
                }
                if (separator) {
                    const definition = { type: 'delimiter', value: separator }
                    yield definition
                    matched.push(definition)
                }
            }
        },
        get length() {
            return matched.length
        },
        at(index) {
            return matched.at(index)
        },
        pop() {
            return matched.pop()
        },
    }
    return { children, value }
}

/**
 * @param {object} definition
 * @returns {object}
 */
function createSequenceNodeState({ type, value: sequence }) {
    const permutations = type === ' '
        ? [sequence][Symbol.iterator]()
        : createPermutationIterator(sequence, type === '&&')
    let { value: permutation } = permutations.next()
    let value = []
    let index = 0
    let valid = 0
    const children = {
        * [Symbol.iterator]() {
            const { length } = permutation
            while (index < length) {
                yield permutation[index]
                valid = Math.max(++index, valid)
            }
        },
        get length() {
            return permutation.length
        },
        indexOf(type) {
            return permutation.indexOf(type)
        },
        permute() {
            ({ value: permutation } = permutations.next(valid))
            if (permutation) {
                value = []
                valid = 0
                return true
            }
            return false
        },
        pop() {
            return permutation[--index]
        },
    }
    return { children, value }
}

/**
 * @param {object} definition
 * @param {object} parent
 * @param {object} productions
 * @returns {object}
 */
function createNodeState(definition, parent, productions) {
    switch (definition.type) {
        case ' ':
        case '&&':
        case '||':
            return createSequenceNodeState(definition)
        case '|':
            return { children: [...definition.value] }
        case 'descriptor':
        case 'non-terminal':
        case 'property':
            return { child: parseDefinition(definition.value, productions, { parent: { definition, parent } }) }
        case 'repeat':
            return createMultipliedNodeState(definition)
        default:
            return {}
    }
}

class ParseTree {

    arguments = 0
    observers = []
    nodes = []
    separator = ' '

    /**
     * @param {object[]} input
     * @param {object|string} definition
     * @param {ParseTree|null} parent
     * @param {Parser} parser
     */
    constructor(input, definition, parent, parser) {
        if (typeof definition === 'string') {
            definition = parseDefinition(definition, parser.productions, { parent: parent?.tail, useCache: true })
        }
        this.list = Array.isArray(input) ? new Stream(input) : input
        this.parent = parent
        this.parser = parser
        this.root = this.create(definition)
    }

    /**
     * @returns {object}
     */
    get tail() {
        return this.nodes.at(-1)
    }

    /**
     * @param {object} definition
     * @param {object} [parent]
     * @returns {object}
     */
    create(definition, parent = null) {
        const { list, nodes, parser } = this
        let node = nodes.find(node => node.definition === definition)
        if (node) {
            return node
        }
        node = {
            definition,
            location: list.index,
            parent,
            state: createNodeState(definition, parent, parser.productions),
            status: configuration.initial,
            value: null,
        }
        nodes.push(node)
        return node
    }

    /**
     * @param {string} event
     * @param {object} node
     * @param {object|object[]} [value]
     * @returns {object|object[]|null}
     */
    dispatch(node, event, value) {
        const transition = resolveTransition(this, configuration, node, event, value)
        return applyTransition(transition, this, configuration, node, event, value)
    }

    /**
     * @param {object} node
     * @param {object} [parent]
     * @returns {object}
     */
    enter(node, parent) {
        return this.dispatch(parent ? this.create(node, parent) : node, 'ENTER')
    }

    /**
     * @returns {boolean}
     */
    isEmpty() {
        return this.nodes.length === 0
    }

    /**
     * @param {object} observer
     */
    subscribe(observer) {
        this.observers.push(observer)
    }

    /**
     * @param {object} node
     * @returns {object[]|null}
     */
    traverse(node) {
        const { list, separator } = this
        const { definition, state: { children, value } } = node
        const isSeparator = isDelimiter(separator)
        for (const child of children) {
            const match = this.enter(child, node)
            if (match === null) {
                break
            }
            value.push(match)
            if (separator) {
                list.consume(isSeparator)
            }
        }
        const { min = children.length } = definition
        return min <= value.length ? value : null
    }

    /**
     * @param {object} observer
     */
    unsubscribe(observer) {
        const { observers } = this
        observers.splice(observers.indexOf(observer), 1)
    }
}

module.exports = ParseTree
