
/**
 * @param {Map} [states]
 * @returns {object}
 */
function getFirstRecordNode(states) {
    return states.keys().next()?.value
}

/**
 * @param {Map} [states]
 * @returns {object}
 */
function getLastRecordNode(states) {
    let lastNode
    for (lastNode of states.keys());
    return lastNode
}

class ParserContext {

    locked = false
    #scopes

    /**
     * @param {object} types
     * @param {object} rules
     */
    constructor(types, rules) {
        this.types = types
        this.rules = rules
        this.reset()
    }

    reset() {
        if (this.locked) {
            return
        }
        this.fnDepth = 0
        this.#scopes = []
        this.states = null
    }

    getProductionRule(type, name) {
        return this.types[type][name]
    }

    hasProductionRule(subtype, name) {
        return this.types[subtype]?.[name]
    }

    applyRule(input, name) {
        const rule = this.rules[name]
        if (rule) {
            return rule(input)
        }
        return input
    }

    addScope() {
        this.states = new Map()
        // Set current execution states
        this.#scopes.push(this.states)
    }

    deleteScope() {
        this.#scopes.pop()
        this.states = this.#scopes.at(-1)
    }

    hasState(node) {
        return this.states.has(node)
    }

    setState(node, state) {
        return this.states.set(node, state)
    }

    getState(node) {
        return this.states.get(node)
    }

    deleteState(node) {
        return this.states.delete(node)
    }

    isEmptyState() {
        return this.states.size === 0
    }

    /**
     * @param {string} type
     * @returns {string[]}
     *
     * If the given type is currently matched against `<type-percentage>`/etc mixed
     * types, it returns the mixed type as the production type, and the given type
     * as the context type, otherwise it returns the given type as the production
     * type and the context type is undefined.
     *
     * It is assumed that `<length-percentage>`/etc mixed types are expanded to
     * `<length> | <percentage>` in this order.
     */
    getNumericContextTypes(type) {
        if (type !== 'percentage') {
            const lastNode = getLastRecordNode(this.states)
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
     * @param {object} node
     * @returns {boolean}
     */
    isLastNodeWithState(node) {
        return getLastRecordNode(this.states) === node
    }

    /**
     * @param {Map} [parentScope]
     * @returns {boolean}
     *
     * It returns whether or not the first state of the previous scope is associated
     * to a node key whose value is `math-function`, which would mean that the type
     * currently being matched is for an argument contained in a nested function.
     */
    isTopLevelCalculation() {
        const parentScope = this.#scopes.at(-2)
        if (parentScope) {
            return getFirstRecordNode(parentScope).value !== 'math-function'
        }
        return true
    }
}

module.exports = ParserContext
