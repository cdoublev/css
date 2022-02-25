
const { NEGATIVE_ZERO, clamp, isInfinite, isNegativeZero, sign, toDegrees, toRadians } = require('../utils/math.js')
const { canonicalize, getCanonicalUnitFromType } = require('../values/dimensions.js')
const { getCalculationType, getMathFunctionType, matchNumericType, mathFunctionTypes } = require('./types.js')
const { isCalculation, isCombinable, isNumeric, isOmitted } = require('../values/validation.js')
const ParserContext = require('./context.js')
const ParserState = require('./state.js')
const createList = require('../values/value.js')
const createStream = require('./stream.js')
const omitted = require('../values/omitted.js')
const parseDefinition = require('./definition.js')

const MAX_FN_ARGS = 32

const mathFunction = parseDefinition('<math-function>')

/**
 * @param {*} node
 * @returns {*}
 *
 * TODO: use `structuredClone()` when supported in Jest.
 */
function clone(node) {
    if (Array.isArray(node)) {
        return node.map(clone)
    }
    if (typeof node === 'object') {
        return cloneObject(node)
    }
    return node
}

/**
 * @param {object} node
 * @returns {object}
 */
function cloneObject(node) {
    return Object.entries(node).reduce((c, [key, value]) => {
        c[key] = clone(value)
        return c
    }, {})
}

/**
 * @param {object} list
 * @param {number} [index]
 * @returns {boolean}
 */
function shouldElideComma(list, index = list.index) {
    switch (list.source[index]) {
        case ' ':
            return shouldElideComma(list, index - 1)
        case ',':
            // Adjacent commas
            return true
        default:
            // All items preceding the comma have been omitted
            return index < 0
    }
}

/**
 * @param {object} [node]
 * @returns {boolean}
 */
function isOptionalNode({ repeat: { min, optional } = {}, value } = {}) {
    if (optional || min === 0) {
        return true
    }
    return Array.isArray(value) && areOptionalNodes(value)
}

/**
 * @param {object[]} nodes
 * @returns {boolean}
 */
function areOptionalNodes(nodes) {
    return nodes.every((node, index) => {
        if (node.value === ',') {
            return isOptionalNode(nodes[index + 1])
                || isOptionalNode(nodes[index - 1])
        }
        return isOptionalNode(node)
    })
}

/**
 * @param {string} strategy
 * @param {object} numeric
 * @param {number} precision
 * @returns {object}
 */
function round(strategy, numeric, precision) {
    const { value } = numeric
    // Preserve 0⁻ or 0⁺ if `number` is multiple of `precision`
    if (value % precision === 0) {
        return numeric
    }
    const isInfinitePrecision = isInfinite(precision)
    if (precision === 0 || (isInfinitePrecision && isInfinite(value))) {
        return canonicalize(numeric, () => NaN)
    }
    if (isInfinitePrecision) {
        switch (strategy) {
            case 'nearest':
            case 'to-zero':
                return canonicalize(numeric, () => (value < 0 || isNegativeZero(value)) ? NEGATIVE_ZERO : 0)
            case 'up':
                return canonicalize(numeric, () => {
                    if (value > 0) {
                        return Infinity
                    }
                    if (value < 0 || isNegativeZero(value)) {
                        return NEGATIVE_ZERO
                    }
                    return value
                })
            case 'down':
                return canonicalize(numeric, () => {
                    if (value < 0) {
                        return -Infinity
                    }
                    if (!isNegativeZero(value)) {
                        return 0
                    }
                    return value
                })
            default:
                throw RangeError('Unexpected rounding strategy')
        }
    }
    switch (strategy) {
        case 'down':
            return canonicalize(numeric, value => Math.floor(value / precision) * precision)
        case 'up':
            return canonicalize(numeric, value => Math.ceil(value / precision) * precision)
        case 'to-zero':
            return canonicalize(numeric, value => {
                const up = Math.ceil(value / precision) * precision
                const down = Math.floor(value / precision) * precision
                return Math.abs(down) < Math.abs(up) ? down : up
            })
        case 'nearest':
            return canonicalize(numeric, value => {
                const down = Math.floor(value / precision) * precision
                const up = Math.ceil(value / precision) * precision
                if (Math.abs(down - value) < Math.abs(up - value)) {
                    return down
                }
                return up
            })
        default:
            throw RangeError('Unexpected rounding strategy')
    }
}

/**
 * @param {object} root
 * @param {string} contextType
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#simplify-a-calculation-tree}
 */
function simplifyCalcTree(root, contextType) {
    const { name, parameters, type, value } = root
    // Leaf: numeric
    if (isNumeric(root)) {
        if (type.has('percentage') && contextType === 'number') {
            return { type: new Set(['number']), value: value / 100 }
        }
        if (type.has('dimension')) {
            return canonicalize(root)
        }
        if (type.has('calc-constant')) {
            switch (value) {
                case 'infinity':
                    return { type: new Set(['number']), value: Infinity }
                case '-infinity':
                    return { type: new Set(['number']), value: -Infinity }
                case 'e':
                    return { type: new Set(['number']), value: Math.E }
                case 'pi':
                    return { type: new Set(['number']), value: Math.Pi }
                case 'nan':
                    return { type: new Set(['number']), value: NaN }
                default:
                    throw RangeError('Unexpected <calc-constant> value')
            }
        }
        return root
    }
    // Leaf: non-math functions (`var()` or `attr()`) that resolve to a numeric value
    if (type.has('var()') || type.has('attr()')) {
        // `var()` and `attr()` are resolved at computed value time
        return root
    }
    // Operator: math function or calc operation
    const children = root.value = value.map(value => simplifyCalcTree(value, contextType))
    const [child, ...other] = children
    // Operator: math functions with enough information to compute the operation root represents
    if (type.has('function') && children.every(node => isCombinable(node, contextType))) {
        switch (name) {
            case 'abs':
                return mapComponent(child, Math.abs)
            case 'acos':
                return { type: new Set(['dimension', 'angle']), value: toDegrees(Math.acos(child.value)) }
            case 'asin':
                return { type: new Set(['dimension', 'angle']), value: toDegrees(Math.asin(child.value)) }
            case 'atan':
                return { type: new Set(['dimension', 'angle']), value: toDegrees(Math.atan(child.value)) }
            case 'atan2':
                const { value: x } = canonicalize(child)
                const { value: y } = canonicalize(other[0])
                return { type: new Set(['dimension', 'angle']), value: toDegrees(Math.atan2(x, y)) }
            case 'calc':
                return canonicalize(child)
            case 'clamp':
                const [{ value: min }, numeric, { value: max }] = children.map(value => canonicalize(value))
                return mapComponent(numeric, value => clamp(min, value, max))
            case 'cos':
                const { value: cos } = canonicalize(child, value => {
                    if (child.type.has('angle')) {
                        return Math.cos(toRadians(value))
                    }
                    return Math.cos(value)
                })
                return { type: new Set(['number']), value: cos }
            case 'exp':
                return mapComponent(child, Math.exp)
            case 'hypot':
                return other.reduce(
                    ({ value: a }, child) => canonicalize(child, b => Math.hypot(a, b)),
                    canonicalize(child))
            case 'log':
                return mapComponent(child, value => {
                    value = Math.log(value)
                    if (other.length === 1) {
                        const [{ value: base }] = other
                        value /= Math.log(base)
                    }
                    return value
                })
            case 'max':
                return other.reduce(
                    ({ value: a }, child) => canonicalize(child, b => Math.max(a, b)),
                    canonicalize(child))
            case 'min':
                return other.reduce(
                    ({ value: a }, child) => canonicalize(child, b => Math.min(a, b)),
                    canonicalize(child))
            case 'mod':
                const [{ value: modulus }] = other
                return canonicalize(child, value => {
                    if (Math.abs(value) === Infinity || modulus === 0) {
                        return NaN
                    }
                    if (Math.abs(modulus) === Infinity) {
                        if (sign(value) !== sign(modulus)) {
                            return NaN
                        }
                        return value
                    }
                    return value - (modulus * Math.floor(value / modulus))
                })
            case 'pow':
                const [{ value: power }] = other
                return mapComponent(child, base => Math.pow(base, power))
            case 'rem':
                const [{ value: divisor }] = other
                return canonicalize(child, value => {
                    if (divisor === 0 || Math.abs(value) === Infinity) {
                        return NaN
                    }
                    if (Math.abs(divisor) === Infinity) {
                        return value
                    }
                    return value - (divisor * Math.trunc(value / divisor))
                })
            case 'round':
                const strategy = parameters.find(({ type }) => type.has('rounding-strategy'))
                const [{ value: precision }] = other
                return round(strategy?.value ?? 'nearest', child, precision)
            case 'sign':
                return { type: new Set(['number']), value: mapComponent(child, Math.sign).value }
            case 'sin':
                const { value: sin } = canonicalize(child, value => {
                    if (isNegativeZero(value)) {
                        return value
                    }
                    if (child.type.has('angle')) {
                        return Math.sin(toRadians(value))
                    }
                    return Math.sin(value)
                })
                return { type: new Set(['number']), value: sin }
            case 'sqrt':
                return mapComponent(child, Math.sqrt)
            case 'tan':
                const { value: tan } = canonicalize(child, value => {
                    if (isNegativeZero(value)) {
                        return value
                    }
                    if (child.type.has('number')) {
                        value = toDegrees(value)
                    }
                    switch (value % 360) {
                        case -270:
                        case 90:
                            return Infinity
                        case 270:
                        case -90:
                            return -Infinity
                        default:
                            return Math.tan(toRadians(value))
                    }
                })
                return { type: new Set(['number']), value: tan }
            default:
                throw RangeError(`Unexpected math function named "${name}"`)
        }
    }
    // Operator: `min()` or `max()` that can not be fully resolved
    if (type.has('min()') || type.has('max()')) {
        const combinables = []
        const rest = []
        children.forEach(node => isCombinable(node, contextType) ? combinables.push(node) : rest.push(node))
        if (combinables.length > 0) {
            const [seed, ...operands] = combinables
            const combined = operands.reduce(
                ({ value: a }, child) =>
                    canonicalize(child, b => type.has('min()') ? Math.min(a, b) : Math.max(a, b)),
                canonicalize(seed))
            return { ...root, value: createList(rest.concat(combined), ',') }
        }
        if (rest.length === 1) {
            return rest[0]
        }
        return { ...root, value: createList(rest, ',') }
    }
    // TODO: report spec issue "math functions other than `min()` or `max()` with unresolved arguments"
    if (type.has('function')) {
        return { ...root, value }
    }
    // Operator: calc-operators
    if (type.has('calc-negate')) {
        if (isNumeric(child)) {
            return mapComponent(child, value => value * -1)
        }
        if (child.type.has('calc-negate')) {
            return child.value
        }
        return root
    }
    if (type.has('calc-invert')) {
        if (isNumeric(child) && !child.unit) {
            return mapComponent(child, value => 1 / value)
        }
        if (child.type.has('calc-invert')) {
            return child.value
        }
        return root
    }
    if (type.has('calc-sum')) {
        const result = children
            // Flatten nested sums
            .reduce((sum, operand) => {
                if (operand.type.has('calc-sum')) {
                    ({ value: operand } = operand)
                }
                return sum.concat(operand)
            }, [])
            // Resolve sums of numerics with the same unit
            .reduce((sum, operand) => {
                if (isNumeric(operand)) {
                    const matchIndex = sum.findIndex(value => value.unit === operand.unit)
                    if (matchIndex > -1) {
                        const match = sum[matchIndex]
                        sum[matchIndex] = mapComponent(match, value => value + operand.value)
                        return sum
                    }
                }
                sum.push(operand)
                return sum
            }, [])
        if (result.length === 1) {
            return result[0]
        }
        root.value = result
        return root
    }
    if (type.has('calc-product')) {
        const result = children
            // Flatten nested products, eg. from `1 * (1em * 1)` to `1 * 1em * 1`
            .reduce((product, operand) => {
                if (operand.type.has('calc-product')) {
                    ({ value: operand } = operand)
                }
                return product.concat(operand)
            }, [])
            // Resolve numbers
            .reduce((product, operand) => {
                if (operand.type.has('number')) {
                    const matchIndex = product.findIndex(({ type }) => type.has('number'))
                    if (matchIndex > -1) {
                        const match = product[matchIndex]
                        product[matchIndex] = mapComponent(match, value => value * operand.value)
                        return product
                    }
                }
                product.push(operand)
                return product
            }, [])
        // Resolve a number and an (unresolved) sum of numerics, eg. from `2 * (1em + 1px)` to `2em + 2px`
        if (result.length === 2) {
            const number = children.find(({ type }) => type.has('number'))
            const sum = children.find(operand => operand.type.has('calc-sum') && operand.value.every(isNumeric))
            if (number && sum) {
                return mapComponent(sum, operand => mapComponent(operand, value => value * number.value))
            }
        }
        // Resolve numerics with "compatible" types, eg. from `2 * 1em` to `2em` or from `2 * 1ms` to `2000ms`
        if (result.every(operand => isNumeric(operand) || (operand.type.has('calc-invert') && operand.value.map(isNumeric)))) {
            const productType = getCalculationType({ type, value: result })
            // Check that this product can match any of the types that a math function can resolve to
            if (productType && mathFunctionTypes.some(mathFnType => matchNumericType(productType, mathFnType))) {
                const { value: type = 'number' } = productType.keys().next()
                let initial = result.shift()
                if (initial.type.has(type)) {
                    initial = canonicalize(initial)
                } else if (type !== 'number') {
                    initial.type.add(type)
                    initial.unit = getCanonicalUnitFromType(type)
                }
                // Resolve the product expressed in canonical unit
                return result.reduce((product, operand) => {
                    if (operand.type.has('calc-invert')) {
                        ({ value: [operand] } = operand)
                    }
                    product.value *= canonicalize(operand).value
                    return product
                }, initial)
            }
        }
        root.value = result
        return root
    }
    throw RangeError('Unexpected type of calculation tree')
}

/**
 * @param {object} fn
 * @param {boolean} isTopLevel
 * @param {string} contextType
 * @param {object} [range]
 * @param {boolean} round
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-internal}
 */
function getMathFunctionInternalRepresentation(fn, isTopLevel, contextType, range, round) {
    const { name, type, value } = fn
    let representation
    if (name === 'calc') {
        representation = simplifyCalcTree(value, contextType)
    } else {
        const calculations = []
        const parameters = []
        // TODO: implement an appropriate data structure for component values
        if (Array.isArray(value)) {
            value.forEach(arg => isCalculation(arg) ? calculations.push(arg) : parameters.push(arg))
        } else {
            calculations.push(value)
        }
        // TODO: the representation of a math function should not have `type`
        representation = simplifyCalcTree({ name, parameters, type: new Set(type), value: calculations }, contextType)
    }
    if (isTopLevel && Number.isNaN(representation.value)) {
        representation.value = Infinity
    }
    return { range, round, ...representation }
}

/**
 * @param {string} type
 * @returns {object|void}
 *
 * TODO: replace with an abstraction in `ParserState`.
 */
function getRepeatConfiguration(type) {
    if (type === 'min()' || type === 'max()' || type === 'hypoth()') {
        return { max: MAX_FN_ARGS }
    }
}

/**
 * @param {object} component
 * @param {function} transform
 * @returns {object}
 *
 * It transforms the value of a component without side effects that would make
 * backtracking fail. This is only used by functions to parse calculations.
 */
function mapComponent({ type, value, ...props }, transform) {
    return { ...props, type: new Set(type), value: transform(value) }
}

class Parser {

    #context
    #list
    #parentList
    #state
    #types
    #rules

    /**
     * @param {object} types
     * @param {object} rules
     * @param {CSSStyleSheetImpl|CSSRuleImpl} [block]
     */
    constructor(types, rules, block) {
        this.#context = new ParserContext(block)
        this.#rules = rules
        this.#types = types
        this.#state = new ParserState(this)
    }

    /**
     * @returns {ParserContext}
     */
    get context() {
        return this.#context
    }

    /**
     * @returns {object}
     */
    get list() {
        return this.#list
    }

    /**
     * @returns {object}
     */
    get parentList() {
        return this.#parentList
    }

    /**
     * @returns {ParserState}
     */
    get state() {
        return this.#state
    }

    /**
     * @returns {object}
     */
    get types() {
        return this.#types
    }

    /**
     * @param {string|object[]} input
     * @param {string|object} definition
     * @returns {object|object[]|null}
     */
    parse(input, definition) {
        input = createStream(Array.isArray(input) ? input : [input])
        if (typeof definition === 'string') {
            definition = parseDefinition(definition, { useCache: true })
        }
        return this.parseRootNode(input, definition)
    }

    /**
     * @param {object} list
     * @param {object} node
     * @returns {object|object[]|null}
     */
    parseRootNode(list, node) {
        const { list: parentList, state } = this
        const grandParentList = this.#parentList
        this.#parentList = parentList
        this.#list = list
        state.createScope()
        let match = this.parseNode(node)
        // Consume a trailing whitespace
        list.consume(' ')
        while (match === null || !list.atEnd()) {
            if (match === null || state.isEmpty()) {
                match = null
                break
            }
            match = this.parseNode(node)
        }
        this.#parentList = grandParentList
        this.#list = parentList
        state.deleteScope()
        return match
    }

    /**
     * @param {object} node
     * @returns {object|object[]|null}
     */
    parseNode(node) {
        const { repeat, type, value } = node
        if (repeat) {
            return this.parseRepeat(node)
        }
        switch (type) {
            // Combined types
            case ' ':
                return this.parseSequence(node)
            case '&&':
            case '||':
                return this.parsePermutation(node)
            case '|':
                return this.parseSingle(node)
            // Single type
            case 'delimiter':
                return this.parseDelimiter(value)
            case 'function':
                return this.parseFunction(node)
            case 'non-terminal':
            case 'property':
                return this.parseNonTerminalType(node)
            case 'simple-block':
                return this.parseSimpleBlock(value)
            case 'structure':
                return this.parseTypeRule(value, this.#types.production[value](this.#list, this))
            case 'terminal':
                return this.parseTerminalType(node)
            default:
                throw RangeError('Unexpected node type')
        }
    }

    /**
     * @param {object} node
     * @returns {object|object[]|null}
     */
    parseRepeat(node) {
        const { list, state } = this
        const nodeState = state.getNodeState(node)
        const { abort, nodes, skip, values } = nodeState
        const { repeat: { min, max, optional, separator = ' ' }, value, ...definition } = node
        if (abort) {
            return null
        }
        let { length } = values
        while (!skip && length < max) {
            const { index } = list
            if (0 < length && !this.parseRepeatSeparator(separator, nodeState)) {
                break
            }
            const node = nodes[length] ?? { ...definition, value: clone(value) }
            const match = this.parseNode(node)
            if (match === null) {
                // Backtrack to the separator that was previously consumed
                if (list.current === nodeState.separator) {
                    list.moveTo(index)
                }
                break
            }
            match.location = index
            nodes[length++] = node
            values.push(match)
        }
        nodeState.skip = false
        if (length < min && (!optional || length > 0)) {
            return this.parseRepeat(node)
        }
        // Type is multiplied with `?` or `{0,1}`
        if (max === 1) {
            // Match is undefined when the value is omitted
            const [match = omitted(node)] = values
            /**
             * - values matching optional types in a group multiplied with `!`
             * should not all be omitted
             * - whitespace is required between two `<compound-selector>`s if
             * `<combinator>` is omitted
             */
            if (min === 1 && (!optional || (value === 'combinator' && list.next() !== ' ' && !list.atEnd())) && isOmitted(match, false)) {
                return this.parseRepeat(node)
            }
            return match
        }
        return createList(values, nodeState.separator ?? separator)
    }

    /**
     * @param {string|string[]} definition
     * @param {object} state
     * @returns {boolean}
     *
     * It parses the next component value against a single separator, or the
     * first matching separator (eg. when using `+#` as a multiplier), saved in
     * (local) state for the next executions.
     *
     * Separator is consumed by this function, except a whitespace which is only
     * consumed (if any) before parsing a terminal, function, or simple block. A
     * whitespace is allowed before and after other separators.
     *
     * Separators are not parsed to component values nor saved in the list of
     * matched component values. Instead, the list has a `separator` property
     * that is assigned the corresponding delimiter.
     */
    parseRepeatSeparator(definition, state) {
        const { list } = this
        const { values } = state
        let { separator } = state
        // `separator` has already been parsed once
        if (separator) {
            if (separator === ' ') {
                // Prevent infinite match of a sequence of omitted value(s)
                return !isOmitted(values.at(-1), false) && !list.atEnd()
            }
            list.consume(' ')
            return list.consume(separator)
        }
        // Find the first matching separator
        const next = list.next()
        if (!Array.isArray(definition)) {
            definition = [definition]
        }
        separator = definition.find(separator => {
            // Whitespace separator should not be consumed by this function
            if (separator === ' ') {
                return false
            }
            // Prevent consuming whitespace if it is not followed by `separator`
            if (next === ' ' && list.next(2, 1) === separator) {
                list.consume(' ')
            }
            return list.consume(separator)
        })
        if (separator) {
            state.separator = separator
            return true
        }
        if (definition.includes(' ')) {
            state.separator = ' '
            // Prevent infinite match of a sequence of omitted value(s)
            return !isOmitted(values.at(-1), false) && !list.atEnd()
        }
        return false
    }

    /**
     * @param {object} node
     * @returns {object[]|null}
     */
    parseSequence(node) {
        const { list, state } = this
        const { abort, types, values } = state.getNodeState(node, list)
        if (abort) {
            return null
        }
        // TODO: use `for..of` and derive the remaining types from values length
        for (let typeIndex = 0; typeIndex < types.length; typeIndex++) {
            const type = types[typeIndex]
            const { value } = type
            const { index: location } = list
            // Comma-ellision rules: commas would be adjacent or all items preceding the comma have been omitted
            if (value === ',' && isOmitted(values.at(-1)) && shouldElideComma(list)) {
                types.splice(typeIndex--, 1)
                values.push(omitted(type, location))
                continue
            }
            const match = this.parseNode(type)
            if (match === null) {
                // All remaining items (are presumed to) have been omitted
                if (value === ',' && areOptionalNodes(types) && list.consume(' ', true) && list.atEnd()) {
                    types.forEach(type => values.push(omitted(type, location)))
                    types.splice(0)
                    break
                }
                return this.parseSequence(node)
            }
            types.splice(typeIndex--, 1)
            match.location = location
            values.push(match)
            // Do not allow omitted last value after a (trailing) comma
            if (isOmitted(match) && values.at(-2)?.value === ',' && typeIndex === types.length - 1) {
                return this.parseSequence(node)
            }
        }
        return createList(values)
    }

    /**
     * @param {object} node
     * @returns {object[]|null}
     */
    parsePermutation(node) {
        const { abort, types, values } = this.#state.getNodeState(node)
        if (abort) {
            return null
        }
        // TODO: use `for..of` and derive the remaining types from values length
        for (let typeIndex = 0; typeIndex < types.length; typeIndex++) {
            const type = types[typeIndex]
            const { index: location } = this.#list
            const { position } = type
            const match = this.parseNode(type)
            if (match === null) {
                return this.parsePermutation(node)
            }
            types.splice(typeIndex--, 1)
            match.location = location
            match.position = position
            values.push(match)
        }
        return createList(values).sort(({ position: a }, { position: b }) => a - b)
    }

    /**
     * @param {object} node
     * @returns {object|null}
     */
    parseSingle(node) {
        const { abort, types } = this.#state.getNodeState(node)
        if (abort) {
            return null
        }
        for (let typeIndex = 0; typeIndex < types.length; typeIndex++) {
            const type = types[typeIndex]
            const match = this.parseNode(type)
            if (match) {
                return match
            }
            types.splice(typeIndex--, 1)
        }
        return this.parseSingle(node)
    }

    /**
     * @param {object} node
     * @returns {object|null}
     *
     * TODO: clear scopes up to the parent math function instead of aborting in
     * each node upwards, to optimize performances.
     */
    parseFunction({ name, value }) {
        const { list, state } = this
        if (state.isMaxFunctionDepth()) {
            return null
        }
        list.consume(' ')
        const fn = list.next()
        if (fn?.name === name) {
            const type = `${name}()`
            const { value: args } = fn
            const input = createStream(args)
            const repeat = getRepeatConfiguration(type)
            const configuration = { repeat, useCache: true }
            const ast = parseDefinition(value, configuration)
            let match = this.parseRootNode(input, ast)
            // `match` is `''` when all function arguments are omitted
            if (match !== null) {
                list.consume()
                --state.fnDepth
                fn.type.add(type)
                match = this.parseTypeRule(type, match)
                if (match) {
                    return mapComponent(fn, () => match)
                }
            }
        }
        --state.fnDepth
        return null
    }

    /**
     * @param {object} fn
     * @param {object} node
     * @returns {object|null}
     */
    parseMathFunction(fn, { range, value: type }) {
        if (fn.type?.has('function') && mathFunctionTypes.includes(type)) {
            // Do not parse `fn` again (after failing to match another numeric type)
            if (!fn.type.has('math-function')) {
                fn = this.parseRootNode(createStream([fn]), mathFunction)
                // TODO: implement an appropriate data structure for component values
                if (Array.isArray(fn?.value)) {
                    fn.value = fn.value.filter(({ value }) => value !== ',')
                }
            }
            if (fn) {
                // `integer` is parsed as `number` in `calc()`
                const round = type === 'integer'
                if (round) {
                    type = 'number'
                }
                const [productionType, contextType] = this.#state.getNumericContextTypes(type)
                const { numericType = getMathFunctionType(fn, contextType) } = fn
                if (matchNumericType(numericType, productionType)) {
                    const topLevel = this.#state.isTopLevelCalculation()
                    fn.value = getMathFunctionInternalRepresentation(fn, topLevel, contextType, range, round)
                    fn.numericType = numericType
                    return fn
                }
            }
        }
        return null
    }

    /**
     * @param {object} type
     * @returns {object|null}
     */
    parseSimpleBlock(type) {
        const { list, state } = this
        if (type === '<calc-sum>' && state.isMaxFunctionDepth()) {
            return null
        }
        list.consume(' ')
        const block = list.next()
        if (block?.type?.has('simple-block')) {
            const { value } = block
            const input = createStream(value)
            const ast = parseDefinition(type, { useCache: true })
            const match = this.parseRootNode(input, ast)
            if (match !== null) {
                list.consume()
                --state.fnDepth
                return mapComponent(block, () => match)
            }
        }
        --state.fnDepth
        return null
    }

    /**
     * @param {object} list
     * @param {object} node
     * @returns {object|null}
     */
    parseNonTerminalType(node) {
        const { abort, type } = this.#state.getNodeState(node, this.#list)
        if (abort) {
            return null
        }
        const { value } = node
        let match = this.parseNode(type)
        if (match) {
            match.type.add(value)
            match = this.parseTypeRule(value, match)
        }
        if (match === null) {
            return this.parseNonTerminalType(node)
        }
        return match
    }

    /**
     * @param {object} node
     * @returns {object|null}
     */
    parseTerminalType(node) {
        const { list } = this
        const { terminal } = this.#types
        const { range, value } = node
        const parse = terminal[value]
        if (!parse) {
            throw RangeError('Unexpected terminal type')
        }
        list.consume(' ')
        if (list.atEnd()) {
            return null
        }
        const component = list.next()
        // Delimiter (assert that all terminals are parsed as objects)
        if (typeof component === 'string' && component !== ' ') {
            return null
        }
        const match = parse(component, range)
        if (match === null) {
            const numericFunction = this.parseMathFunction(component, node)
            if (numericFunction) {
                list.consume()
                return numericFunction
            }
            return null
        }
        list.consume()
        match.type.add(value)
        return match
    }

    /**
     * @param {string} delimiter
     * @returns {string|null}
     * @see {@link https://drafts.csswg.org/css-values-4/#calc-syntax}
     */
    parseDelimiter(delimiter) {
        const { list, state } = this
        list.consume(' ')
        // Invalid addition or subtraction operator in `<calc-sum>` or `<calc-product>`
        if ((delimiter === '+' || delimiter === '-') && list.current !== ' ' && state.isMathOperandNode()) {
            return null
        }
        if (list.consume(delimiter)) {
            return { type: new Set(['delimiter']), value: delimiter }
        }
        return null
    }

    /**
     * @param {string} name
     * @param {object|object[]} match
     * @returns {object|object[]|null}
     */
    parseTypeRule(name, match) {
        const parse = this.rules[name]
        if (parse) {
            return parse(match, this)
        }
        return match
    }
}

module.exports = Parser
