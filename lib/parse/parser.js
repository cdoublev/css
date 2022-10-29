
const { aliases, mappings } = require('../values/compatibility.js')
const { isDelimiter, isWhitespace } = require('../values/validation.js')
const ParseContext = require('./context.js')
const ParseTree = require('./tree.js')
const createStream = require('./stream.js')
const { map } = require('../values/value.js')
const parseDefinition = require('./definition.js')

class Parser {

    lists = []
    separator = ' '
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
     * @returns {object|undefined}
     */
    get list() {
        return this.lists.at(-1)
    }

    /**
     * @returns {ParseTree|undefined}
     */
    get tree() {
        return this.trees.at(-1)
    }

    /**
     * @param {object[]} input
     * @param {string} definition
     * @param {object} [parent]
     * @param {boolean} [greedy]
     * @returns {object|object[]|null}
     */
    parse(input, definition, parent, greedy = false) {
        const { lists, separator, trees } = this
        const tree = new ParseTree(this, this.tree)
        const list = Array.isArray(input) ? createStream(input) : input
        const { index: start } = list
        this.separator = ' '
        definition = parseDefinition(definition, { parent, useCache: true })
        trees.push(tree)
        lists.push(list)
        list.consume(isWhitespace)
        let match = this.parseNode(definition)
        while (match === null || !(greedy || list.atEnd(isWhitespace))) {
            if (tree.isEmpty() || tree.abort) {
                match = null
                list.moveTo(start)
                break
            }
            match = this.parseNode(definition)
        }
        this.separator = separator
        trees.pop()
        lists.pop()
        return match
    }

    /**
     * @param {object} definition
     * @param {object} parent
     * @returns {object|object[]|null}
     */
    parseNode(definition, parent) {
        const { tree } = this
        const { name, type } = definition
        const node = tree.has(definition) ? tree.get(definition) : tree.create(definition, parent)
        tree.dispatch(node, 'ENTER')
        while (!['accepted', 'matched', 'rejected'].some(status => status === node.status)) {
            let match
            if (type === 'optional' || type === 'required') {
                match = this.parseNode(definition.value, node)
            } else if (type === 'repeat' || type === ' ' || type === '&&' || type === '||') {
                match = this.parseSequence(node)
            } else if (type === '|') {
                match = this.parseNode(node.state.children[0], node)
            } else if (type === 'non-terminal' || type === 'property') {
                match = this.parseNode(node.state.child, node)
            } else {
                match = this.parseLeaf(node)
            }
            if (match) {
                if (name && type !== 'function') {
                    match.type.add(name)
                }
                tree.dispatch(node, 'SUCCESS', match)
            } else {
                tree.dispatch(node, 'FAILURE')
            }
        }
        return node.value
    }

    /**
     * @param {object} node
     * @returns {object[]|null}
     */
    parseSequence(node) {
        const { list, separator } = this
        const { state: { children, value } } = node
        for (const child of children) {
            const match = this.parseNode(child, node)
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
        const { list, productions: { structures, terminals } } = this
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
                return structures[name](list, this, definition)
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
        return this.list.consume(fn => {
            if (name === aliases.get(fn.name)) {
                fn = { ...fn, name }
            }
            if (name === fn.name || mappings.get(fn.name)) {
                const match = this.parse(fn.value, value, node)
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
        return this.list.consume(block => {
            if (block.type.has('simple-block')) {
                const match = this.parse(block.value, value, node)
                if (match) {
                    return map(block, () => match, true)
                }
            }
            return null
        })
    }
}

module.exports = Parser
