
const { aliases, mappings } = require('../values/compatibility.js')
const { isDelimiter, isWhitespace } = require('../values/validation.js')
const ParseContext = require('./context.js')
const ParseTree = require('./tree.js')
const { isSequence } = require('./validation.js')
const { map } = require('../values/value.js')

class Parser {

    trees = []

    /**
     * @param {CSSStyleSheetImpl|CSSRuleImpl} [block]
     * @param {object} productions
     */
    constructor(block, productions) {
        this.context = new ParseContext(block)
        this.productions = productions
    }

    /**
     * @returns {ParseTree|null}
     */
    get tree() {
        return this.trees.at(-1) ?? null
    }

    /**
     * @param {object[]} input
     * @param {string} definition
     * @param {boolean} [greedy]
     * @returns {object|object[]|null}
     */
    parse(input, definition, greedy = false) {
        const { trees } = this
        const tree = new ParseTree(input, definition, this)
        const { list, root } = tree
        trees.push(tree)
        list.consume(isWhitespace)
        let match = this.parseNode(root)
        while (match === null || !(greedy || list.atEnd(isWhitespace))) {
            if (tree.isEmpty() || tree.abort) {
                match = null
                break
            }
            match = this.parseNode(root)
        }
        trees.pop()
        return match
    }

    /**
     * @param {object} node
     * @returns {object|object[]|null}
     */
    parseNode(node) {
        const { tree } = this
        const { definition, state } = node
        const { name, type, value } = definition
        let match = tree.dispatch(node, 'ENTER')
        while (node.status === 'matching') {
            if (isSequence(definition)) {
                match = this.parseSequence(node)
            } else if (type === '|') {
                match = this.parseNode(tree.create(state.children[0], node))
            } else if (type === 'optional' || type === 'required') {
                match = this.parseNode(tree.create(value, node))
            } else if (type === 'non-terminal' || type === 'property') {
                match = this.parseNode(tree.create(state.child, node))
            } else {
                match = this.parseLeaf(node)
            }
            if (tree.abort) {
                return null
            }
            if (match) {
                if (name && type !== 'function') {
                    match.type.add(name)
                }
                match = tree.dispatch(node, 'SUCCESS', match)
            } else {
                match = tree.dispatch(node, 'FAILURE')
            }
        }
        return match
    }

    /**
     * @param {object} node
     * @returns {object[]|null}
     */
    parseSequence(node) {
        const { tree } = this
        const { list, separator } = tree
        const { state: { children, value } } = node
        for (const child of children) {
            const match = this.parseNode(tree.create(child, node))
            if (match === null) {
                break
            }
            value.push(match)
            if (separator) {
                list.consume(isDelimiter(separator))
            }
        }
        return value
    }

    /**
     * @param {object} node
     * @returns {object|object[]|null}
     */
    parseLeaf(node) {
        const { productions: { structures, terminals }, tree: { list } } = this
        if (list.atEnd(isWhitespace)) {
            return null
        }
        const { definition } = node
        const { name, type, value } = definition
        switch (type) {
            case 'delimiter':
                return list.consume(isDelimiter(value))
            case 'function':
                return this.parseFunction(node)
            case 'simple-block':
                return this.parseSimpleBlock(node)
            case 'structure':
                return structures[name](list, this)
            case 'terminal':
                return list.consume(terminals[name], definition)
            default:
                throw RangeError('Unrecognized node type')
        }
    }

    /**
     * @param {object} node
     * @returns {object|null}
     */
    parseFunction(node) {
        const { definition: { name, value } } = node
        return this.tree.list.consume(fn => {
            const type = `${name}()`
            const input = `${fn.name}()`
            if (type === aliases.get(input)) {
                fn = { ...fn, name }
            }
            if (name === fn.name || type === mappings.get(input)) {
                const match = this.parse(fn.value, value)
                if (match) {
                    return map(fn, () => match, true)
                }
            }
            return null
        })
    }

    /**
     * @param {object} node
     * @returns {object|null}
     */
    parseSimpleBlock(node) {
        const { definition: { value } } = node
        return this.tree.list.consume(block => {
            if (block.type.has('simple-block')) {
                const match = this.parse(block.value, value)
                if (match) {
                    return map(block, () => match, true)
                }
            }
            return null
        })
    }
}

module.exports = Parser
