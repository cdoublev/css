/**
 * What should be tested?
 *
 * - the object tree resulting from parsing a style sheet according to the rules
 * of the CSS grammar defining where statements (rules and/or declarations) are
 * allowed or not
 * - the `CSSStyleSheet` interface to interact with this object tree
 *
 * What are the corresponding interfaces?
 *
 * - `parseCSSStyleSheet()`: returns a high-level object tree from parsing a
 * style sheet
 * - `CSSStyleSheet.create()`: returns an interface to read and interact with
 * the high-level object representing an existing style sheet
 * - `new CSSStyleSheet()`: returns an interface to construct a new object tree
 *
 * A CSSStyleSheet is created when parsing:
 *   - a Link HTTP header
 *   - <link>
 *   - <style>
 *   - a style sheet referenced by `@import`?
 *
 * A constructed CSSStyleSheet is created only by an end user?
 */

const { cssom, install, parseCSSStyleSheet } = require('../lib/index.js')

const { CSSImportRule, CSSStyleRule, CSSRuleList, CSSStyleSheet, MediaList } = cssom

beforeAll(() => {
    install()
    globalThis.document = {
        href: 'http://github.com/cdoublev/',
    }
})

describe('CSSStyleSheet', () => {
    it('creates a non-constructed CSSStyleSheet', () => {

        const input = `
            @import "./stylesheet.css";

            .selector {
                color: red;
            }
        `
        const location = 'http://github.com/cdoublev/css/'
        const media = 'all'
        const ownerNode = { type: 'HTMLLinkElement' }
        const title = 'Main CSS'
        const properties = {
            cssRules: input,
            location,
            media,
            originClean: true,
            ownerNode,
            title,
        }
        const styleSheet = parseCSSStyleSheet(properties)

        expect(CSSStyleSheet.is(styleSheet)).toBeTruthy()

        // StyleSheet properties
        expect(styleSheet.disabled).toBeFalsy()
        expect(styleSheet.href).toBe(location)
        expect(MediaList.is(styleSheet.media)).toBeTruthy()
        expect(styleSheet.media.mediaText).toBe(media)
        expect(styleSheet.ownerNode).toBe(ownerNode)
        expect(styleSheet.parentStyleSheet).toBeNull() // TODO: test non-null `parentStyleSheet` with `@import`
        expect(styleSheet.title).toBe(title)
        expect(styleSheet.type).toBe('text/css')

        // CSSStyleSheet properties
        expect(CSSRuleList.is(styleSheet.cssRules)).toBeTruthy()
        expect(CSSImportRule.is(styleSheet.cssRules[0])).toBeTruthy()
        expect(CSSStyleRule.is(styleSheet.cssRules[1])).toBeTruthy()
        expect(styleSheet.ownerRule).toBeNull()  // TODO: test non-null `ownerRule` with `@import`

        // Temporary assertions
        expect(styleSheet.cssRules[0].href).toBe('./stylesheet.css')
        expect(styleSheet.cssRules[1].style.color).toBe('red')
    })
    it('creates a constructed CSSStyleSheet', () => {

        const media = 'all'
        const options = { baseURL: 'css', media, disabled: true }
        const { CSSStyleSheet } = globalThis
        const styleSheet = new CSSStyleSheet(options)

        // StyleSheet properties
        expect(styleSheet.disabled).toBeTruthy()
        expect(styleSheet.href).toBe(globalThis.document.href)
        expect(MediaList.is(styleSheet.media)).toBeTruthy()
        expect(styleSheet.media.mediaText).toBe(media)
        expect(styleSheet.ownerNode).toBeNull()
        expect(styleSheet.parentStyleSheet).toBeNull()
        expect(styleSheet.title).toBe('')
        expect(styleSheet.type).toBe('text/css')

        styleSheet.disabled = false
        expect(styleSheet.disabled).toBeFalsy()

        // CSSStyleSheet properties
        expect(styleSheet.ownerRule).toBeNull()
    })
})

describe('CSSStyleSheet.insertRule(), CSSStyleSheet.deleteRule()', () => {
    it('inserts and deletes a rule', () => {

        const { CSSStyleSheet } = globalThis
        const styleSheet = new CSSStyleSheet()

        styleSheet.insertRule('.selector { color: red }')

        const { cssRules } = styleSheet

        expect(CSSRuleList.is(cssRules)).toBeTruthy()
        expect(cssRules).toHaveLength(1)

        const [styleRule] = cssRules
        const { parentStyleSheet } = styleRule

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
        expect(parentStyleSheet).toBe(styleSheet)

        styleSheet.deleteRule(0)

        expect(cssRules).toHaveLength(0)
        // TODO: figure out how read-only `rule.parentRule` and `rule.parentStyleSheet` can be set to `null`
        // expect(styleRule.parentStyleSheet).toBeNull()
        // TODO: add a case to assert against `styleRule.parentRule === null`
    })
    it.todo("throws an error when trying to insert/delete a rule at an index greater or equal than rule's length")
    it.todo('throws an error when failing to insert an invalid rule')
    it.todo('throws an error when failing to insert a rule that can not appear before an import or namespace rule')
    it.todo('throws an error when trying to insert a namespace rule after a style rule that is not an import rule')
})

describe('CSSStyleSheet.replace(), CSSStyleSheet.replaceSync()', () => {
    it.todo('synchronously replaces a rule with CSSStyleSheet.replaceSync()')
    it.todo('asynchronously replaces a rule with CSSStyleSheet.replace()')
})

describe('grammar rules', () => {
    it('discards a declaration at the top level of the style sheet', () => {

        const input = `
            color: red;
            .selector { color: green }
        `
        const { cssRules } = createStyleSheet(input)

        expect(cssRules).toHaveLength(1)

        const [styleRule] = cssRules

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()

        const { style: { length, color } } = styleRule

        expect(length).toBe(1)
        expect(color).toBe('green')
    })
    it('discards a declaration with an unknown property in a style rule', () => {

        const input = '.selector { unknown-before: red; color: green; unknown-after: red }'
        const { cssRules } = createStyleSheet(input)

        expect(cssRules).toHaveLength(1)

        const [styleRule] = cssRules

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()

        const { style: { length, color } } = styleRule

        expect(length).toBe(1)
        expect(color).toBe('green')
    })
    it('discards a declaration with an invalid value in a style rule', () => {

        const input = '.selector { color: red; width: red }'
        const { cssRules } = createStyleSheet(input)

        expect(cssRules).toHaveLength(1)

        const [styleRule] = cssRules

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()

        const { style: { length, color } } = styleRule

        expect(length).toBe(1)
        expect(color).toBe('red')
    })
    it('discards a declaration in a rule containing <stylesheet>', () => {

        const input = `
            @media all {
                color: red;
                .selector { color: green }
            }
        `
        const { cssRules } = createStyleSheet(input)

        expect(cssRules).toHaveLength(1)

        const [mediaRule] = cssRules

        expect(CSSMediaRule.is(mediaRule)).toBeTruthy()
        expect(CSSMediaRule.cssRules).toHaveLength(1)

        const { cssRules: [styleRule] } = mediaRule

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
    })
    it('discards a declaration in a rule containing <rule-list>', () => {

        const input = `
            @keyframes myAnimation {
                color: red;
                to { color: green }
            }
        `
        const { cssRules } = createStyleSheet(input)

        expect(cssRules).toHaveLength(1)

        const [keyframes] = cssRules

        expect(CSSKeyframesRule.is(keyframes)).toBeTruthy()
        expect(keyframes.cssRules).toHaveLength(1)

        const { cssRules: [keyframe] } = keyframes

        expect(CSSKeyframeRule.is(keyframe)).toBeTruthy()
    })
    it('discards a declaration of a property that is not allowed in a nested @keyframe rule', () => {

        const input = `
            @keyframes myAnimation {
                to {
                    animation-delay: 1s;
                    color: green;
                    animation-duration: 1s;
                }
            }
        `
        const { cssRules } = createStyleSheet(input)

        expect(cssRules).toHaveLength(1)

        const [keyframes] = cssRules

        expect(CSSKeyframesRule.is(keyframes)).toBeTruthy()
        expect(keyframes.cssRules).toHaveLength(1)

        const { cssRules: [keyframe] } = keyframes

        expect(CSSKeyframeRule.is(keyframe)).toBeTruthy()
    })
    it.todo('discards a declaration of a property that is not allowed in @page')
    it.todo('discards a declaration of a property that is not allowed in a margin at-rule')
    it.todo('discards a rule whose name is unrecognized')
    // only test with a missing or 100% wrong prelude: it will be fully tested in __tests__/value.js
    // otherwise specify a <statement-rule> as a <block-rule> and vice-versa
    it.todo('discards a rule whose prelude or value is invalid according to its production rule')
    // any at-rule that is not @nest: containing <stylesheet> or <rule-list>
    it.todo('discards a qualified rule whose selector starts with `&` at the top level of the style sheet or any at-rule that is not @nest')
    it.todo('discards a qualified rule whose selector does not start with `&` in a style rule')
    // any rule that is not @keyframes: containing <stylesheet> or <rule-list>
    it.todo('discards a qualified rule whose selector matches <keyframe-selector> at the top level of the style sheet or any rule that is not @keyframes')
    it.todo('discards any at-rule that is not @nest in style rule')
    it('discards @import preceded by another rule that is not @charset', () => {

        const input = `
            .selector { color: red }
            @import "./stylesheet.css";
        `
        const properties = { cssRules: parseCSSStyleSheet(input) }
        const styleSheet = CSSStyleSheet.create(globalThis, [], properties)

        const { cssRules: [styleRule, importRule] } = styleSheet

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
        expect(importRule).toBeUndefined()
    })
    // any at-rule that is not @page: containing <stylesheet>, <rule-list>, or <declaration-list>
    it.todo('discards @charset, @import, or @namespace in any at-rule')
    // any at-rule that is not @page: containing <stylesheet>, <rule-list>, or <declaration-list>
    it.todo('discards a margin rule at the top level of the style sheet or any at-rule that is not @page')
    // `@media` in `@page`, any at-rule in `@top-left`, `@media` in `@keyframes`, ...to complete when adding new at-rules whose content is <declaration-list>
    it.todo('discards any rule that is not allowed in a rule containing <declaration-list>')
    /**
     * Allow:
     *
     * - declarations in:
     *   - <declaration-list>
     *     - in `@keyframes` nested qualified rule (including `animation-timing-function`)
     *     - in `@page`
     *     - in `@top-left`
     *     - ... to complete when adding new at-rules whose content is <declaration-list>
     *   - <style-block>
     *     - in style rule
     *     - in nested style rule
     *     - in `@nest`
     *     - ... to complete when adding new at-rules whose content is <style-block>
     * - rules in:
     *   - <stylesheet>
     *     - style rule in style sheet, `@media`, `@supports`
     *     - any top-level at-rule in style sheet, `@media`, `@supports`
     *     - ... to complete when adding new at-rules whose content is <stylesheet>
     *   - <rule-list>
     *     - qualified rule nested in `@keyframes` and matching `<keyframe-selector>#`
     *     - ... to complete when adding new at-rules whose content is <rule-list>
     *   - <style-block>
     *     - in style rule nested in style rule or `@nest`
     *     - `@nest` in style rule or `@nest`
     *     - `@media` in style rule or `@nest`
     *   - <declaration-list>
     *     - `@top-left` in `@page`
     *     - ... to complete when adding new at-rules whose content is <declaration-list>
     */
})
