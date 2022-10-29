
const { createList } = require('../values/value.js')
const createOmitted = require('../values/omitted.js')
const { createPermutationIterator } = require('./permutation.js')
const hooks = require('./hooks.js')
const { isOmitted } = require('../values/validation.js')
const { isSequence } = require('./validation.js')
const parseDefinition = require('./definition.js')

const configuration = {
    context: {
        counters: {
            arguments: 0,
            nestedFunctions: 0,
        },
    },
    initial: 'waiting',
    states: {
        // Result of preprocess or replace: disallow backtracking
        accepted: {
            enter: [assign, configure],
            on: { ENTER: { target: 'rejected' } },
        },
        backtracking: {
            always: [
                { condition: [isNull, or(isAborted, isListAtEnd)], target: 'rejected' },
                { condition: isNull, target: 'replacing' },
                { condition: [isOmitted, isOptional], target: 'accepted' },
                { target: 'matching' },
            ],
            enter: [backtrack],
        },
        // Result of matching: allow backtracking
        matched: {
            enter: [assign, configure],
            on: { ENTER: { actions: [configure], target: 'backtracking' } },
        },
        matching: {
            on: {
                FAILURE: { target: 'backtracking' },
                SUCCESS: [
                    { condition: [isRequired, isOmitted], target: 'rejected' },
                    { condition: [isInvalidSequence], target: 'backtracking' },
                    { target: 'postprocessing' },
                ],
            },
        },
        postprocessing: {
            always: [
                { actions: [abort], condition: isNull, target: 'rejected' },
                { target: 'matched' },
            ],
            enter: [zip, postprocess],
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
 * @returns {string|object}
 */
function getNodeName({ definition: { value, name = value } }) {
    return name
}

/**
 * @param  {...function} predicates
 * @returns {boolean}
 */
function or(...predicates) {
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
function isAborted(value, node, { tree: { abort } }) {
    return abort
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
function isListAtEnd(value, node, { list }) {
    return list.atEnd()
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
function isOptional(value, { definition: { type } }) {
    return type === 'optional'
}

/**
 * @param {object|object[]|null} [value]
 * @param {object} node
 * @returns {boolean}
 */
function isRequired(value, { definition: { type } }) {
    return type === 'required'
}

/**
 * @param {object|object[]|null} [value]
 * @param {object} node
 * @returns {boolean}
 */
function isInvalidSequence({ length }, { definition, state: { children } }) {
    if (isSequence(definition)) {
        const { min = children.length } = definition
        return length < min
    }
    return false
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
function abort({ tree }) {
    tree.abort = true
    while (tree.parent) {
        tree.parent.abort = true
        tree = tree.parent
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @param {string} event
 * @param {object|object[]|null} value
 */
function assign(parser, node, event, value) {
    node.value = value
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {object|null|undefined}
 */
function backtrack(parser, node) {

    const { list, tree } = parser
    const { nodes, tail: { definition: tail } } = tree
    const { definition, location, state } = node
    const { separator, type } = definition
    const { children, value } = state

    if (type === 'repeat') {
        if (tail === definition) {
            return null
        }
        value.pop()
        if (tail === children.at(-1)) {
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
        if (tail === definition) {
            if (value) {
                return null
            }
            return createOmitted(definition)
        } else if (tail === node.value) {
            list.moveTo(location)
            nodes.pop()
            return createOmitted(definition)
        }
        return
    }
    if (type === ' ' || type === '&&' || type === '||') {
        if (tail === definition) {
            if (children.permute()) {
                list.moveTo(location)
                return
            }
            return null
        }
        value.pop()
        if (tail === children.pop()) {
            nodes.pop()
            return backtrack(parser, node)
        }
        return
    }
    if (type === '|') {
        if (tail === definition) {
            children.shift()
            if (children.length === 0) {
                return null
            }
        } else if (tail === children[0]) {
            nodes.pop()
            return backtrack(parser, node)
        }
        list.moveTo(location)
        return
    }
    // required, non-terminal, property, leaf
    if (tail === definition) {
        return null
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 */
function clear({ list, tree: { nodes } }, node) {
    list.moveTo(node.location)
    nodes.splice(nodes.indexOf(node))
    node.value = null
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @param {string} event
 */
function configure(parser, node, event) {
    const { configure: { [getNodeName(node)]: action } } = hooks
    if (action) {
        action(parser, node, event)
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @param {string} event
 * @param {object|object[]} value
 */
function postprocess(parser, node, event, value) {
    const { postprocess: { [getNodeName(node)]: action } } = hooks
    if (action) {
        return action(value, parser, node)
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 */
function preprocess(parser, node) {
    const { preprocess: { [getNodeName(node)]: action } } = hooks
    if (action) {
        return action(parser, node)
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 */
function replace(parser, node) {
    const { replace: { [getNodeName(node)]: action } } = hooks
    if (action) {
        return action(parser, node)
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @param {string} event
 * @param {object|object[]} value
 */
function zip(parser, node, event, value) {
    const { definition, state: { children } } = node
    if (isSequence(definition)) {
        const { separator = parser.separator, type, value: definitions } = definition
        if (type === '&&' || type === '||') {
            // Sort in canonical order
            value = definitions.map(definition => {
                const index = children.indexOf(definition)
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
 */
function applyTransition({ actions = [], target }, tree, configuration, node, event, value) {

    const { observers, parser } = tree
    const { states: { [target]: { enter = [], always } } } = configuration
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
    actions.forEach(action => {
        const result = action(parser, node, event, value)
        if (result !== undefined) {
            value = result
        }
    })

    if (always) {
        const transition = resolveTransition(tree, configuration, node, 'always', value)
        if (transition) {
            applyTransition(transition, tree, configuration, node, 'always', value)
        }
    }
}

/**
 * @param {ParseTree} tree
 * @param {object} configuration
 * @param {object} node
 * @param {string} event
 * @param {component|component[]|null} [value]
 * @returns {object|undefined}
 */
function resolveTransition({ parser }, configuration, node, event, value) {
    const { on: events = {}, states: { [node.status]: { always, on } } } = configuration
    // { always: [{ condition, target }, ...], ... }
    if (always) {
        const transition = always.find(({ condition }) => evalCondition(condition, value, node, parser))
        if (transition) {
            return transition
        }
    }
    // { on: [{ condition, target }, ...] }
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
 * @returns {object}
 */
function createNodeState(definition, parent) {
    switch (definition.type) {
        case ' ':
        case '&&':
        case '||':
            return createSequenceNodeState(definition)
        case '|':
            return { children: [...definition.value] }
        case 'non-terminal':
        case 'property':
            return { child: parseDefinition(definition.value, { parent: { definition, parent } }) }
        case 'repeat':
            return createMultipliedNodeState(definition)
        default:
            return {}
    }
}

class ParseTree {

    observers = []
    nodes = []

    /**
     * @param {Parser} parser
     * @param {ParseTree} [parent]
     */
    constructor(parser, parent = null) {
        this.parser = parser
        this.parent = parent
    }

    /**
     * @returns {object}
     */
    get root() {
        return this.nodes[0]
    }

    /**
     * @returns {object}
     */
    get tail() {
        return this.nodes.at(-1)
    }

    /**
     * @returns {boolean}
     */
    isEmpty() {
        return this.nodes.length === 0
    }

    /**
     * @param {object} definition
     * @returns {boolean}
     */
    has(definition) {
        return this.nodes.some(node => node.definition === definition)
    }

    /**
     * @param {object} definition
     * @returns {object|undefined}
     */
    get(definition) {
        return this.nodes.find(node => node.definition === definition)
    }

    /**
     * @param {object} definition
     * @param {object} parent
     * @returns {object}
     */
    create(definition, parent) {
        const { parser: { list: { index: location } } } = this
        const { context, initial: status } = configuration
        const node = {
            context: structuredClone(context),
            definition,
            location,
            parent,
            state: createNodeState(definition, parent),
            status,
            value: undefined,
        }
        this.nodes.push(node)
        return node
    }

    /**
     * @param {string} event
     * @param {object} node
     * @param {component|component[]|null} [value]
     */
    dispatch(node, event, value) {
        const transition = resolveTransition(this, configuration, node, event, value)
        if (transition) {
            applyTransition(transition, this, configuration, node, event, value)
        }
    }

    /**
     * @param {object} observer
     */
    subscribe(observer) {
        this.observers.push(observer)
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
