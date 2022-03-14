
const { getNextPermutation } = require('./permutation.js')
const omitted = require('../values/omitted.js')
const parseDefinition = require('./definition.js')

const MAX_FN_ARGS = 32
const MAX_FN_DEPTH = 32

/**
 * @param {string} type
 * @returns {object|void}
 */
function getRepeatConfiguration(type) {
    if (type === 'calc-product' || type === 'calc-sum') {
        return { max: MAX_FN_ARGS - 1 }
    }
}

/**
 * @param {object[]} values
 * @param {object[]} types
 * @param {object[]} permutation
 * @param {number} location
 */
function setOmittedCombinationValues(values, types, permutation, location) {
    types.forEach(type => {
        if (!permutation.includes(type)) {
            const { position } = type
            values.push(omitted(type, location, position))
        }
    })
}

/**
 * @param {object[]} nodes
 * @returns {object[]}
 */
function setNodePositions(nodes) {
    return nodes.map((type, position) => {
        type.position = position
        return type
    })
}

class ParserState {

    #parser
    #scopes = []

    fnDepth = 0

    /**
     * @param {Parser} parser
     */
    constructor(parser) {
        this.#parser = parser
    }

    /**
     * @returns {Map}
     */
    get states() {
        return this.#scopes.at(-1)
    }

    createScope() {
        this.#scopes.push(new Map())
    }

    deleteScope() {
        this.#scopes.pop()
    }

    /**
     * @returns {boolean}
     */
    isEmpty() {
        return this.states.size === 0
    }

    /**
     * @param {number} depth
     * @returns {boolean}
     */
    isMaxFunctionDepth() {
        return this.fnDepth++ > MAX_FN_DEPTH
    }

    /**
     * @param {object} node
     * @returns {*[]}
     */
    getNodeState(node) {
        if (this.states.has(node)) {
            return this.#backtrack(node)
        }
        const { value } = node
        if (value === 'calc-value' && this.getOperandsNumber() > MAX_FN_ARGS) {
            return this.#backtrack(node)
        }
        return this.#createNodeState(node)
    }

    /**
     * @param {Map} [states]
     * @returns {object}
     */
    getRootNode(states = this.states) {
        return states.keys().next()?.value
    }

    /**
     * @param {Map} [states]
     * @returns {object}
     */
    getLastNode(states = this.states) {
        let lastNode
        for (lastNode of states.keys());
        return lastNode
    }

    /**
     * @param {Map} [states]
     * @returns {number}
     */
    getOperandsNumber() {
        let i = 0
        for (const { value } of this.states.keys()) {
            if (value === 'calc-value') {
                i++
            }
        }
        return i
    }

    /**
     * @param {string} type
     * @returns {string[]}
     *
     * If the given type name is included in a value definition resulting from
     * the expansion of a <length-percentage>/etc mixed type, the mixed type is
     * the production type and the given type is the context type, otherwise the
     * given type is the production type and the context type is undefined.
     *
     * It is assumed that <length-percentage>/etc mixed types are expanded to
     * `<length> | <percentage>` in this order.
     */
    getNumericContextTypes(type) {
        if (type !== 'percentage') {
            const lastNode = this.getLastNode()
            if (lastNode?.type === '|' && lastNode.value.some(({ value }) => value === 'percentage')) {
                if (lastNode.value.some(({ value }) => value === 'dimension')) {
                    return [type]
                }
                return [`${type}-percentage`, type]
            }
        }
        return [type]
    }

    /**
     * @param {Map} [parentScope]
     * @returns {boolean}
     */
    isTopLevelCalculation() {
        const parentScope = this.#scopes.at(-2)
        if (parentScope) {
            return this.getRootNode(parentScope).value !== 'math-function'
        }
        return true
    }

    /**
     * @param {Map} [states]
     * @returns {object}
     */
    isMathOperandNode() {
        return this.getRootNode()?.value === 'calc-sum'
    }

    /**
     * Only for tests.
     */
    clear() {
        this.fnDepth = 0
        this.#scopes = []
    }

    /**
     * @param {object} node
     * @returns {*[]}
     */
    #createNodeState(node) {
        const { list: { index: startIndex }, types: { production, property } } = this.#parser
        const { repeat, type, value } = node
        let state
        if (repeat) {
            state = { iteration: 0, nodes: [], startIndex, values: [] }
        } else if (type === ' ') {
            state = { startIndex, types: [...value], values: [] }
        } else if (type === '&&' || type === '||') {
            const permutation = setNodePositions(value)
            state = {
                discarded: [],
                excluded: [],
                permutation,
                startIndex,
                types: [...permutation],
                values: [],
            }
        } else if (type === '|') {
            state = { startIndex, types: [...value] }
        } else if (production[value]) {
            const definition = production[value]
            const type = parseDefinition(definition, { repeat: getRepeatConfiguration(value) })
            state = { startIndex, type }
        } else if (property[value]) {
            const { value: definition } = property[value]
            const type = parseDefinition(definition, { repeat: { ignoreHash: true } })
            state = { startIndex, type }
        } else {
            throw RangeError('Unexpected node type')
        }
        this.states.set(node, state)
        return state
    }

    /**
     * @param {object} node
     * @returns {*[]}
     */
    #backtrack(node) {
        const { list } = this.#parser
        const state = this.states.get(node)
        const { discarded, excluded, nodes, permutation, types, startIndex, values } = state
        const { type, repeat, value } = node
        if (repeat) {
            if (this.getLastNode() === node) {
                const { min, optional } = repeat
                const { length } = values
                // Match failure
                if (length <= min && (!optional || length === 0)) {
                    list.moveTo(startIndex)
                    this.states.delete(node)
                    return { abort: true }
                }
                nodes.pop()
                // Resume parsing next node type
                state.skip = true
            }
            // Discard last iteration
            const { location } = values.pop()
            list.moveTo(location)
            return state
        }
        if (type === ' ') {
            // Match failure
            if (this.getLastNode() === node) {
                list.moveTo(startIndex)
                this.states.delete(node)
                return { abort: true }
            }
            // Discard last match value
            const { location } = values.pop()
            // Get node type of discarded match value
            const nodeType = value[values.length]
            // Restore it in remaining node types
            types.unshift(nodeType)
            // Resume parsing discarded match value
            if (this.states.has(nodeType)) {
                list.moveTo(location)
                return state
            }
            // Backtrack to previous match value
            return this.#backtrack(node)
        }
        if (type === '&&' || type === '||') {
            if (this.getLastNode() === node) {
                const valid = [...values, ...discarded.splice(0)]
                const full = type === '&&'
                const nextPermutation = getNextPermutation(value, permutation, valid, excluded, full)
                list.moveTo(startIndex)
                // Start over parsing with next permutation
                if (nextPermutation) {
                    state.permutation = nextPermutation
                    types.splice(0, Infinity, ...nextPermutation)
                    values.splice(0)
                    setOmittedCombinationValues(values, value, nextPermutation, startIndex)
                    return state
                }
                // Match failure
                this.states.delete(node)
                return { abort: true }
            }
            // Discard last match value
            const { location, position } = values.pop()
            // Get node type of discarded match value
            const nodeType = value[position]
            discarded.push(nodeType)
            list.moveTo(location)
            // Resume parsing discarded match value
            if (this.states.has(nodeType)) {
                types.unshift(nodeType)
                return state
            }
            // Backtrack to previous match value
            if (types.length === 0) {
                return this.#backtrack(node)
            }
            // Resume parsing with next permutation
            const valid = [...values, ...discarded.splice(0)]
            const full = type === '&&'
            const nextPermutation = getNextPermutation(value, permutation, valid, excluded, full)
            if (nextPermutation) {
                const nextTypes = nextPermutation.slice(nextPermutation.length - types.length - 1)
                state.permutation = nextPermutation
                types.splice(0, Infinity, ...nextTypes)
                setOmittedCombinationValues(values, value, nextPermutation, startIndex)
                return state
            }
            // Match failure
            this.states.delete(node)
            return { abort: true }
        }
        if (type === '|') {
            list.moveTo(startIndex)
            if (this.getLastNode() === node) {
                if (types.length === 0) {
                    list.moveTo(startIndex)
                    this.states.delete(node)
                    return { abort: true }
                }
                types.shift()
            }
            return state
        }
        // Non-terminal
        if (this.getLastNode() === node) {
            list.moveTo(startIndex)
            this.states.delete(node)
            return { abort: true }
        }
        return state
    }
}

module.exports = ParserState
