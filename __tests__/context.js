
const topLevel = require('../lib/values/rules.js')
const ParserContext = require('../lib/parse/context.js')

const cssRules = []
const styleSheet = { _rules: cssRules, type: 'text/css' }
const styleRule = { parentStyleSheet: styleSheet, type: new Set(['style']) }
const nestedStyleRule = { name: 'nest', parentRule: styleRule, parentStyleSheet: styleSheet, type: new Set(['nest']) }
const { rules: { style: styleRuleContext } } = topLevel
const { rules: { nest: nestedStyleRuleContext } } = styleRuleContext

cssRules.push(
    { parentStyleSheet: styleSheet, type: new Set(['import']) },
    { parentStyleSheet: styleSheet, prefix: 'html', type: new Set(['namespace']) },
    { parentStyleSheet: styleSheet, prefix: 'svg', type: new Set(['namespace']) },
    styleRule)

it('has the top level (style sheet) context by default as its current context', () => {
    const { current } = new ParserContext()
    expect(current).toBe(topLevel)
})
it('has the context of the given style sheet as its current context', () => {
    const { current } = new ParserContext(styleSheet)
    expect(current).toBe(topLevel)
})
it('has the context of the given rule as its current context', () => {
    const { current } = new ParserContext(styleRule)
    expect(current).toBe(styleRuleContext)
})
it('has the context of the given nested rule as its current context', () => {
    const { current } = new ParserContext(nestedStyleRule)
    expect(current).toBe(nestedStyleRuleContext)
})
it('enters in the context of a given rule and returns its context', () => {
    const context = new ParserContext()
    const next = context.enter(styleRule)
    expect(next).toEqual(styleRuleContext)
    expect(context.current).toEqual(styleRuleContext)
})
it('tries to enter in the context of a given unknown rule', () => {
    const context = new ParserContext()
    // Unknown rule type
    const next = context.enter({ name: 'unknown', type: new Set() })
    expect(next).toBeNull()
    expect(context.current).toEqual(topLevel)
})
it('exits from the context of a child rule to the context of its parent rule or style sheet', () => {
    const context = new ParserContext(styleRule)
    context.enter(nestedStyleRule)
    context.exit()
    expect(context.current).toEqual(styleRuleContext)
    context.exit()
    expect(context.current).toEqual(topLevel)
})
it('has the universal selector as the default declared namespace prefixes', () => {
    const { namespaces } = new ParserContext()
    expect(namespaces).toEqual(['*'])
})
it('has the namespace prefixes from @namespace rules as the declared namespace prefixes', () => {
    const { namespaces } = new ParserContext(styleRule)
    expect(namespaces).toEqual(['*', 'html', 'svg'])
})
