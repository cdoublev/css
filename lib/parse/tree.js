
const { createList } = require('../values/value.js')
const createOmitted = require('../values/omitted.js')
const { createPermutationIterator } = require('./permutation.js')
const createStream = require('./stream.js')
const forgiving = require('../values/forgiving.js')
const hooks = require('./hooks.js')
const { isOmitted } = require('../values/validation.js')
const { isSequence } = require('./validation.js')
const parseDefinition = require('./definition.js')

const configuration = {
    initial: 'waiting',
    states: {
        // Result of preprocess or replace: disallow backtracking
        accepted: {
            enter: [assign, configure],
            on: { ENTER: { target: 'rejected' } },
        },
        backtracking: {
            always: [
                { condition: [isNull, either(isAborted, isListAtEnd)], target: 'rejected' },
                { condition: isNull, target: 'replacing' },
                { condition: isUndefined, target: 'matching' },
                { target: 'accepted' },
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
                    { target: 'postprocessing' },
                ],
            },
        },
        postprocessing: {
            always: [
                { actions: [abort], condition: isError, target: 'rejected' },
                { condition: isNull, target: 'rejected' },
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
function abort({ tree, trees: [{ nodes: [{ definition: { name } }] }] }) {
    const strict = name === 'supports-condition'
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
        if (tail.definition === node.value) {
            list.moveTo(location)
            nodes.pop()
            return createOmitted(definition)
        }
        return
    }
    // required, non-terminal, property, leaf
    if (tail === node) {
        return null
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
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
        return applyTransition(transition, tree, configuration, node, 'always', value)
    }
    return value
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

    arguments = 0
    observers = []
    nodes = []
    separator = ' '

    /**
     * @param {object[]} input
     * @param {string} definition
     * @param {ParseTree} parent
     * @param {Parser} parser
     */
    constructor(input, definition, parent = null, parser) {
        this.list = Array.isArray(input) ? createStream(input) : input
        this.parent = parent
        this.parser = parser
        this.root = this.create(parseDefinition(definition, { parent: parent?.tail, useCache: true }))
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
     * @param {object} [parent]
     * @returns {object}
     */
    create(definition, parent = null) {
        let node = this.nodes.find(node => node.definition === definition)
        if (node) {
            return node
        }
        node = {
            definition,
            location: this.list.index,
            parent,
            state: createNodeState(definition, parent),
            status: configuration.initial,
            value: undefined,
        }
        this.nodes.push(node)
        return node
    }

    /**
     * @param {string} event
     * @param {object} node
     * @param {component|component[]|null} [value]
     * @returns {object|object[]|null}
     */
    dispatch(node, event, value) {
        const transition = resolveTransition(this, configuration, node, event, value)
        return applyTransition(transition, this, configuration, node, event, value)
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
