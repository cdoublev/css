
const parseDefinition = require('../lib/parse/definition.js')
const { serializeNodeType } = require('../lib/serialize.js')

describe('node type', () => {

    it('serializes a keyword type', () => {
        const definition = 'a'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe(definition)
    })
    it('serializes a terminal type', () => {
        const definition = '<length>'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe(definition)
    })
    it('serializes a non-terminal type', () => {
        const definition = '<length-percentage>'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe(definition)
    })
    it('serializes a non-terminal function type', () => {
        const definition = '<calc()>'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe('<calc(<calc-sum>)>')
    })
    it('serializes a terminal type with a range [min, max]', () => {
        const definition = '<number [1,2]>'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe(definition)
    })
    it('serializes a terminal type with a range [min,]', () => {
        const definition = '<number [1,∞]>'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe(definition)
    })
    it('serializes a terminal type with a multiplier ?', () => {
        const definition = '<number>?'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe(definition)
    })
    it('serializes a terminal type with a multiplier *', () => {
        const definition = '<number>*'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe(definition)
    })
    it('serializes a terminal type with a multiplier +', () => {
        const definition = '<number>+'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe(definition)
    })
    it('serializes a terminal type with a multiplier {n}', () => {
        const definition = '<number>{2}'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe(definition)
    })
    it('serializes a terminal type with a multiplier {min,max}', () => {
        const definition = '<number>{1,2}'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe(definition)
    })
    it('serializes a terminal type with a multiplier {min,}', () => {
        const definition = '<number>{2,}'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe('<number>{2,20}')
    })
    it('serializes a terminal type with a multiplier #', () => {
        const definition = '<number>#'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe(definition)
    })
    it('serializes a terminal type with a multiplier #?', () => {
        const definition = '<number>#?'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe(definition)
    })
    it.todo('serializes a terminal type with a multiplier +#')
    it.todo('serializes a terminal type with a multiplier +#?')
    it('serializes a terminal type with a multiplier #{min,max}', () => {
        const definition = '<number>#{1,2}'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe(definition)
    })
    it('serializes a type expanded to a combination', () => {
        const definition = '<length> | <percentage>'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe(definition)
    })
    it('[a b?]?', () => {
        const definition = '[a b?]?'
        const node = parseDefinition(definition)
        expect(serializeNodeType(node)).toBe(definition)
    })
})
