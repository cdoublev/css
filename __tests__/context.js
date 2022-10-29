
const topLevel = require('../lib/rules/definitions.js')
const ParseContext = require('../lib/parse/context.js')

const {
    rules: {
        keyframes: keyframesDefinition,
        media: mediaDefinition,
        page: pageDefinition,
        style: styleDefinition,
        supports: supportsDefinition,
    },
} = topLevel
const { rules: { keyframe: keyframeDefinition } } = keyframesDefinition
const { rules: { margin: marginDefinition } } = pageDefinition
const { rules: { nest: nestingStyleDefinition, style: nestedStyleDefinition } } = styleDefinition

const parentStyleSheet = { _rules: [], type: 'text/css' }

const supportsRule = { parentStyleSheet, type: new Set(['at-rule', 'supports']) }
const mediaRule = { parentRule: supportsRule, parentStyleSheet, type: new Set(['at-rule', 'media']) }
const mediaNestedStyleRule = { parentRule: mediaRule, parentStyleSheet, type: new Set(['qualified-rule', 'style']) }

const keyframesRule = { parentStyleSheet, type: new Set(['at-rule', 'keyframes']) }
const keyframeRule = { parentRule: keyframesRule, parentStyleSheet, type: new Set(['qualified-rule', 'keyframe']) }
const pageRule = { parentStyleSheet, type: new Set(['at-rule', 'page']) }
const marginRule = { parentRule: pageRule, parentStyleSheet, type: new Set(['at-rule', 'margin']) }

const styleRule = { parentStyleSheet, type: new Set(['qualified-rule', 'style']) }
const nestedStyleRule = { parentRule: styleRule, parentStyleSheet, type: new Set(['qualified-rule', 'style']) }
const nestingRule = { parentRule: styleRule, parentStyleSheet, type: new Set(['at-rule', 'nest']) }

parentStyleSheet._rules.push(
    { parentStyleSheet, type: new Set(['import']) },
    { parentStyleSheet, prefix: 'html', type: new Set(['namespace']) },
    { parentStyleSheet, prefix: 'svg', type: new Set(['namespace']) })

describe('ParseContext', () => {
    it('represents the context of a style rule by default', () => {
        const context = new ParseContext()
        const { definition, parent, root, type } = context
        expect(definition).toBe(styleDefinition)
        expect(root).toBe(context)
        expect(root.namespaces).toEqual(['*'])
        expect(parent).toBeUndefined()
        expect(type).toBe('style')
    })
    it('represents the context of the given style sheet', () => {
        const context = new ParseContext(parentStyleSheet)
        const { definition, parent, root, type } = context
        expect(definition).toBe(topLevel)
        expect(root).toBe(context)
        expect(root.namespaces).toEqual(['*', 'html', 'svg'])
        expect(parent).toBeUndefined()
        expect(type).toBe('root')
    })
    // Find at-rule type in <rule-list>
    it('represents the context of the given @supports', () => {
        const { definition, parent, root, type } = new ParseContext(supportsRule)
        expect(definition).toBe(supportsDefinition)
        expect(root).toBe(parent)
        expect(root.namespaces).toEqual(['*', 'html', 'svg'])
        expect(parent.definition).toBe(topLevel)
        expect(parent.type).toBe('root')
        expect(type).toBe('supports')
    })
    // Find qualified rule type in <rule-list>
    it('represents the context of the given style rule', () => {
        const { definition, parent, root, type } = new ParseContext(styleRule)
        expect(definition).toBe(styleDefinition)
        expect(root).toBe(parent)
        expect(root.namespaces).toEqual(['*', 'html', 'svg'])
        expect(parent.definition).toBe(topLevel)
        expect(parent.type).toBe('root')
        expect(type).toBe('style')
    })
    // Find at-rule type in <stylesheet>
    it('represents the context of the given @media nested in @supports', () => {
        const { definition, parent, root, type } = new ParseContext(mediaRule)
        expect(definition).toBe(mediaDefinition)
        expect(root).toBe(parent.parent)
        expect(root.namespaces).toEqual(['*', 'html', 'svg'])
        expect(parent.definition).toBe(supportsDefinition)
        expect(parent.type).toBe('supports')
        expect(type).toBe('media')
    })
    // Find qualified rule type in <stylesheet>
    it('represents the context of the given style rule nested in @media', () => {
        const { definition, parent, root, type } = new ParseContext(mediaNestedStyleRule)
        expect(definition).toBe(styleDefinition)
        expect(root).toBe(parent.parent.parent)
        expect(root.namespaces).toEqual(['*', 'html', 'svg'])
        expect(parent.definition).toBe(mediaDefinition)
        expect(parent.type).toBe('media')
        expect(type).toBe('style')
    })
    // Find at-rule type in <declaration-list>
    it('represents the context of the given margin rule', () => {
        const { definition, parent, root, type } = new ParseContext(marginRule)
        expect(definition).toBe(marginDefinition)
        expect(root).toBe(parent.parent)
        expect(root.namespaces).toEqual(['*', 'html', 'svg'])
        expect(parent.definition).toBe(pageDefinition)
        expect(parent.type).toBe('page')
        expect(type).toBe('margin')
    })
    // Find qualified rule type in <declaration-list>
    it('represents the context of the given keyframe rule', () => {
        const { definition, parent, root, type } = new ParseContext(keyframeRule)
        expect(definition).toBe(keyframeDefinition)
        expect(root).toBe(parent.parent)
        expect(root.namespaces).toEqual(['*', 'html', 'svg'])
        expect(parent.definition).toBe(keyframesDefinition)
        expect(parent.type).toBe('keyframes')
        expect(type).toBe('keyframe')
    })
    // Find at-rule type in <style-block>
    it('represents the context of the given @nest', () => {
        const { definition, parent, root, type } = new ParseContext(nestingRule)
        expect(definition).toBe(nestingStyleDefinition)
        expect(root).toBe(parent.parent)
        expect(root.namespaces).toEqual(['*', 'html', 'svg'])
        expect(parent.definition).toBe(styleDefinition)
        expect(parent.type).toBe('style')
        expect(type).toBe('nest')
    })
    // Find qualified rule type in <style-block>
    it('represents the context of the given directly nested style rule', () => {
        const { definition, root, parent, type } = new ParseContext(nestedStyleRule)
        expect(definition).toBe(nestedStyleDefinition)
        expect(root).toBe(parent.parent)
        expect(root.namespaces).toEqual(['*', 'html', 'svg'])
        expect(parent.definition).toBe(styleDefinition)
        expect(parent.type).toBe('style')
        expect(type).toBe('style')
    })
})

describe('ParseContext.enter()', () => {
    it('returns null when trying to enter in the context of the given unknown rule', () => {
        const context = new ParseContext(parentStyleSheet)
        expect(context.enter({ name: 'unknown', type: new Set() })).toBeNull()
    })
    // Enter in at-rule from <rule-list>
    it('returns a child context representing the given @supports', () => {
        const context = new ParseContext(parentStyleSheet)
        const { parent, type } = context.enter({ name: 'supports', type: new Set(['at-rule']) })
        expect(type).toBe('supports')
        expect(parent).toBe(context)
    })
    // Enter in qualified rule from <rule-list>
    it('returns a child context representing the given style rule', () => {
        const context = new ParseContext(parentStyleSheet)
        const { parent, type } = context.enter({ type: new Set(['qualified-rule']) })
        expect(type).toBe('style')
        expect(parent).toBe(context)
    })
    // Enter in at-rule from <stylesheet>
    it('returns a child context representing the given @media nested in @supports', () => {
        const context = new ParseContext(supportsRule)
        const { parent, type } = context.enter({ name: 'media', type: new Set(['at-rule']) })
        expect(type).toBe('media')
        expect(parent).toBe(context)
    })
    // Enter in qualified rule from <stylesheet>
    it('returns a child context representing the given style rule nested in @media', () => {
        const context = new ParseContext(mediaRule)
        const { parent, type } = context.enter({ type: new Set(['qualified-rule']) })
        expect(type).toBe('style')
        expect(parent).toBe(context)
    })
    // Enter in margin rule from <declaration-list>
    it('returns a child context representing the given margin rule', () => {
        const context = new ParseContext(pageRule)
        const { parent, type } = context.enter({ name: 'top-left', type: new Set(['at-rule']) })
        expect(type).toBe('margin')
        expect(parent).toBe(context)
    })
    // Enter in keyframe rule from <declaration-list>
    it('returns a child context representing the given keyframe rule', () => {
        const context = new ParseContext(keyframesRule)
        const { parent, type } = context.enter({ type: new Set(['qualified-rule']) })
        expect(type).toBe('keyframe')
        expect(parent).toBe(context)
    })
    // Enter in at-rule rule from <style-block>
    it('returns a child context representing the given @nest', () => {
        const context = new ParseContext(styleRule)
        const { parent, type } = context.enter({ name: 'nest', type: new Set(['at-rule']) })
        expect(type).toBe('nest')
        expect(parent).toBe(context)
    })
    // Enter in qualified rule from <style-block>
    it('returns a child context representing the given directly nested style rule', () => {
        const context = new ParseContext(styleRule)
        const { parent, type } = context.enter({ type: new Set(['qualified-rule']) })
        expect(type).toBe('style')
        expect(parent).toBe(context)
    })
})
