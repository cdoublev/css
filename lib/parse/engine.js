
const { NEGATIVE_ZERO, clamp, isInfinite, isNegativeZero, sign, toDegrees, toRadians } = require('../utils/math.js')
const { canonicalize, getCanonicalUnitFromType } = require('../values/dimensions.js')
const { getCalculationType, getMathFunctionType, matchNumericType, mathFunctionTypes } = require('./types.js')
const { isCalculation, isCombinable, isNumeric, isOmitted } = require('../values/validation.js')
const createList = require('../values/value.js')
const createStream = require('./stream.js')
const { getNextPermutation } = require('./permutation.js')
const omitted = require('../values/omitted.js')
const parseDefinition = require('./definition.js')

const MAX_FN_ARGS = 32
const MAX_FN_DEPTH = 32

const mathFunction = parseDefinition('<math-function>')

let context

/**
 * @param {*} node
 * @returns {*}
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
 * @param {string} type
 * @returns {object|void}
 *
 * It returns a repeat configuration for parsing the definition value of a CSS
 * type.
 */
function getRepeatConfiguration(type) {
    switch (type) {
        case 'calc-product':
        case 'calc-sum':
            return { max: MAX_FN_ARGS - 1 }
        case 'min()':
        case 'max()':
        case 'hypoth()':
            return { max: MAX_FN_ARGS }
        default:
            return
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
 * @param {object} list
 * @param {object} node
 * @returns {*[]}
 */
function backtrack(list, node) {
    const { type, repeat, value } = node
    const state = context.getState(node)
    const { discarded, excluded, nodes, permutation, types, startIndex, values } = state
    if (repeat) {
        if (context.isLastNodeWithState(node)) {
            const { min, optional } = repeat
            const { length } = values
            // Match failure
            if (length <= min && (!optional || length === 0)) {
                list.moveTo(startIndex)
                context.deleteState(node)
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
        if (context.isLastNodeWithState(node)) {
            list.moveTo(startIndex)
            context.deleteState(node)
            return { abort: true }
        }
        // Discard last match value
        const { location } = values.pop()
        // Get node type of discarded match value
        const nodeType = value[values.length]
        // Restore it in remaining node types
        types.unshift(nodeType)
        // Resume parsing discarded match value
        if (context.hasState(nodeType)) {
            list.moveTo(location)
            return state
        }
        // Backtrack to previous match value
        return backtrack(list, node)
    }
    if (type === '&&' || type === '||') {
        if (context.isLastNodeWithState(node)) {
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
            context.deleteState(node)
            return { abort: true }
        }
        // Discard last match value
        const { location, position } = values.pop()
        // Get node type of discarded match value
        const nodeType = value[position]
        discarded.push(nodeType)
        list.moveTo(location)
        // Resume parsing discarded match value
        if (context.hasState(nodeType)) {
            types.unshift(nodeType)
            return state
        }
        // Backtrack to previous match value
        if (types.length === 0) {
            return backtrack(list, node)
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
        context.deleteState(node)
        return { abort: true }
    }
    if (type === '|') {
        list.moveTo(startIndex)
        if (context.isLastNodeWithState(node)) {
            if (types.length === 0) {
                list.moveTo(startIndex)
                context.deleteState(node)
                return { abort: true }
            }
            types.shift()
        }
        return state
    }
    // Non-terminal
    if (context.isLastNodeWithState(node)) {
        list.moveTo(startIndex)
        context.deleteState(node)
        return { abort: true }
    }
    return state
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

/**
 * @param {object} node
 * @param {object} list
 * @returns {*[]}
 */
function createState(node, list) {
    const { repeat, type, value } = node
    const { index: startIndex } = list
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
    } else if (context.hasProductionRule('non-terminal', value)) {
        const definition = context.getProductionRule('non-terminal', value)
        const type = parseDefinition(definition, { repeat: getRepeatConfiguration(value) })
        state = { startIndex, type }
    } else if (context.hasProductionRule('property', value)) {
        const { value: definition } = context.getProductionRule('property', value)
        const type = parseDefinition(definition, { repeat: { ignoreHash: true } })
        state = { startIndex, type }
    } else {
        throw Error(`Could not find a definition for the type "${value}"`)
    }
    context.setState(node, state)
    return state
}

/**
 * @param {object} node
 * @param {object} list
 * @returns {*[]}
 */
function useState(node, list) {
    if (context.hasState(node)) {
        return backtrack(list, node)
    }
    return createState(node, list)
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
                throw RangeError(`Unexpected rounding strategy named "${strategy}"`)
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
            throw RangeError(`Unexpected rounding strategy named "${strategy}"`)
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
                    throw RangeError(`Unexpected <calc-constant> value "${value}"`)
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
 * @param {object} fn
 * @param {object} node
 * @returns {object|null}
 */
function parseMathFunction(fn, { range, value: type }) {
    if (fn.type?.has('function') && mathFunctionTypes.includes(type)) {
        // Do not parse `fn` again (after failing to match another numeric type)
        if (!fn.type.has('math-function')) {
            fn = parseRootNode(createStream([fn]), mathFunction)
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
            const [productionType, contextType] = context.getNumericContextTypes(type)
            const { numericType = getMathFunctionType(fn, contextType) } = fn
            if (matchNumericType(numericType, productionType)) {
                fn.value = getMathFunctionInternalRepresentation(fn, context.isTopLevelCalculation(), contextType, range, round)
                fn.numericType = numericType
                return fn
            }
        }
    }
    return null
}

/**
 * @param {object} list
 * @param {object} node
 * @returns {object|null}
 */
function parseFunction(list, { name, value }) {
    if (context.fnDepth++ > MAX_FN_DEPTH) {
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
        let match = parseRootNode(input, ast)
        // `match` is `''` when all function arguments are omitted
        if (match !== null) {
            list.consume()
            --context.fnDepth
            fn.type.add(type)
            match = context.applyRule(match, type)
            if (match) {
                return mapComponent(fn, () => match)
            }
        }
    }
    --context.fnDepth
    return null
}

/**
 * @param {object} list
 * @param {object} type
 * @returns {object|null}
 */
function parseSimpleBlock(list, type) {
    if (type === '<calc-sum>' && context.fnDepth++ > MAX_FN_DEPTH) {
        return null
    }
    list.consume(' ')
    const block = list.next()
    if (block?.type?.has('simple-block')) {
        const { value } = block
        const input = createStream(value)
        const ast = parseDefinition(type, { useCache: true })
        const match = parseRootNode(input, ast)
        if (match !== null) {
            list.consume()
            --context.fnDepth
            return mapComponent(block, () => match)
        }
    }
    --context.fnDepth
    return null
}

/**
 * @param {object} list
 * @param {object} node
 * @param {boolean} [isRoot]
 * @returns {object|null}
 */
function parseNonTerminalType(list, node, isRoot) {
    const { abort, type } = useState(node, list)
    if (abort) {
        return null
    }
    const { value } = node
    if (value === 'calc-value' && context.getOperandsNumber() > MAX_FN_ARGS) {
        return parseType(list, node)
    }
    let match = parseNode(list, type)
    if (match) {
        match.type.add(value)
        match = context.applyRule(match, value)
    }
    if (match === null && !isRoot) {
        return parseType(list, node)
    }
    return match
}

/**
 * @param {object} list
 * @param {function} parse
 * @param {object} node
 * @returns {object|null}
 */
function parseTerminalType(list, parse, node) {
    if (list.atEnd()) {
        return null
    }
    const component = list.next()
    // Delimiter
    if (typeof component === 'string' && component !== ' ') {
        return null
    }
    const { range, value } = node
    const match = parse(value === 'declaration-value' ? list : component, range)
    if (match === null) {
        const numericFunction = parseMathFunction(component, node)
        if (numericFunction) {
            list.consume()
            return numericFunction
        }
        return null
    }
    list.consume()
    match.type.add(value)
    return context.applyRule(match, value)
}

/**
 * @param {object} list
 * @param {object} node
 * @param {boolean} [isRoot]
 * @returns {object|null}
 */
function parseType(list, node, isRoot) {
    const { value } = node
    if (value !== 'declaration-value') {
        list.consume(' ')
    }
    const structure = context.getProductionRule('block', value)
    if (structure) {
        return structure(list)
    }
    const terminal = context.getProductionRule('terminal', value)
    if (terminal) {
        return parseTerminalType(list, terminal, node)
    }
    return parseNonTerminalType(list, node, isRoot)
}

/**
 * @param {object} list
 * @param {string} delimiter
 * @returns {string|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-syntax}
 */
function parseDelimiter(list, delimiter) {
    if (delimiter !== ' ') {
        list.consume(' ')
    }
    if ((delimiter === '+' || delimiter === '-') && list.current !== ' ') {
        return null
    }
    if (list.consume(delimiter)) {
        return { type: new Set(['delimiter']), value: delimiter }
    }
    return null
}

/**
 * @param {object} list
 * @param {object} node
 * @returns {object|null}
 */
function parseSingle(list, node) {
    const { abort, types } = useState(node, list)
    if (abort) {
        return null
    }
    for (let typeIndex = 0; typeIndex < types.length; typeIndex++) {
        const type = types[typeIndex]
        const match = parseNode(list, type)
        if (match) {
            return match
        }
        types.splice(typeIndex--, 1)
    }
    return parseSingle(list, node)
}

/**
 * @param {object} list
 * @param {object} node
 * @returns {object[]|null}
 */
function parsePermutation(list, node) {
    const { abort, types, values } = useState(node, list)
    if (abort) {
        return null
    }
    // TODO: use `for..of` and derive the remaining types from values length
    for (let typeIndex = 0; typeIndex < types.length; typeIndex++) {
        const type = types[typeIndex]
        const { index: location } = list
        const { position } = type
        const match = parseNode(list, type)
        if (match === null) {
            return parsePermutation(list, node)
        }
        types.splice(typeIndex--, 1)
        match.location = location
        match.position = position
        values.push(match)
    }
    return createList(values).sort(({ position: a }, { position: b }) => a - b)
}

/**
 * @param {object} list
 * @param {object} node
 * @returns {object[]|null}
 */
function parseSequence(list, node) {
    const { abort, types, values } = useState(node, list)
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
        const match = parseNode(list, type)
        if (match === null) {
            // All remaining items (are presumed to) have been omitted
            if (value === ',' && areOptionalNodes(types) && list.consume(' ', true) && list.atEnd()) {
                types.forEach(type => values.push(omitted(type, location)))
                types.splice(0)
                break
            }
            return parseSequence(list, node)
        }
        types.splice(typeIndex--, 1)
        match.location = location
        values.push(match)
        // Do not allow omitted last value after a (trailing) comma
        if (isOmitted(match) && values.at(-2)?.value === ',' && typeIndex === types.length - 1) {
            return parseSequence(list, node)
        }
    }
    return createList(values)
}

/**
 * @param {object} list
 * @param {string|string[]} separators
 * @param {object} state
 * @returns {object|null}
 *
 * It matches the next component value against a single separator or the first
 * matching separator (eg. when using `+#` as a multiplier).
 */
function parseRepeatSeparator(list, separators, state) {
    let { separator } = state
    if (separator) {
        return parseDelimiter(list, separator)
    }
    if (typeof separators === 'string') {
        separators = [separators]
    }
    separator = separators.find(separator => parseDelimiter(list, separator))
    if (separator) {
        state.separator = separator
        return separator
    }
    return null
}

/**
 * @param {object} list
 * @param {object} node
 * @returns {object|object[]|null}
 */
function parseRepeat(list, node) {
    const { name, repeat: { min, max, optional, separator = ' ' }, type, value } = node
    const state = useState(node, list)
    const { abort, nodes, skip, values } = state
    if (abort) {
        return null
    }
    let { length } = values
    while (!skip && length < max) {
        const { index } = list
        if (length > 0 && !parseRepeatSeparator(list, separator, state)) {
            break
        }
        const node = nodes[length] ?? { name, type, value: clone(value) }
        const match = parseNode(list, node)
        if (match === null) {
            // Backtrack to the separator eagerly that was consumed before
            if (list.current === state.separator) {
                list.moveTo(index)
            }
            break
        }
        match.location = index
        nodes[length++] = node
        values.push(match)
    }
    state.skip = false
    if (length < min && (!optional || length > 0)) {
        return parseRepeat(list, node)
    }
    // Type is multiplied with `?` or `{0,1}`
    if (max === 1) {
        // Match is undefined when the value is omitted
        const [match = omitted(node)] = values
        // Values matching a group of optional types multiplied with `!` should not all be omitted
        if (min === 1 && !optional && isOmitted(match, false)) {
            context.deleteState(node)
            return null
        }
        return match
    }
    return createList(values, state.separator ?? separator)
}

/**
 * @param {object} list
 * @param {object} node
 * @param {boolean} [isRoot]
 * @returns {object|object[]|null}
 */
function parseNode(list, node, isRoot) {
    const { repeat, type, value } = node
    if (repeat) {
        return parseRepeat(list, node)
    }
    switch (type) {
        // Combined types
        case ' ':
            return parseSequence(list, node)
        case '&&':
        case '||':
            return parsePermutation(list, node)
        case '|':
            return parseSingle(list, node)
        // Single type
        case 'basic':
        case 'non-terminal':
        case 'property':
            return parseType(list, node, isRoot)
        case 'delimiter':
            return parseDelimiter(list, value)
        case 'function':
            return parseFunction(list, node)
        case 'keyword':
            return parseType(list, { range: value, value: 'keyword' })
        case 'simple-block':
            return parseSimpleBlock(list, value)
        default:
            throw RangeError(`Unexpected node of type "${type}"`)
    }
}

/**
 * @param {object} list
 * @param {object} node
 * @returns {object|object[]|null}
 */
function parseRootNode(list, node) {
    // Create a new scope of execution states
    context.addScope()
    let match = parseNode(list, node, true)
    list.consume(' ')
    while (match === null || !list.atEnd()) {
        // Allow backtracking multiple times eg. when parsing `a a a` against `a | a a | a a a`
        if (match === null || context.isEmptyState()) {
            match = null
            break
        }
        match = parseNode(list, node, true)
    }
    // Drop current scope and roll back states of the parent scope (if any)
    context.deleteScope()
    return match
}

/**
 * @param {object[]} list
 * @param {string|object} definition
 * @param {ParserContext} parserContext
 * @returns {object|object[]|null}
 *
 * "Match result against grammar".
 *
 * It accepts a grammar as a definition string or as an AST (pre-parsed).
 */
function parse(list, definition, parserContext) {
    list = createStream(list)
    context = parserContext
    if (typeof definition === 'string') {
        definition = parseDefinition(definition, { useCache: true })
    }
    const result = parseRootNode(list, definition)
    context.reset()
    return result
}

module.exports = parse
