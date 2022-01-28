/**
 * What should be tested?
 *
 * - the CSSOM tree resulting from parsing a style sheet according to the CSS
 * grammar defining where statements (rules/declarations) are allowed or not
 * - the `CSSStyleSheet` interface to interact with (read/write) the CSSOM tree
 *
 * What are the corresponding interfaces?
 *
 * - `parseCSSStyleSheet()`: abstraction of `CSSStyleSheet.create()`
 * - `CSSStyleSheet.create()`: creates a CSSOM tree from a style sheet
 * - `new CSSStyleSheet()`: creates a new (empty) CSSOM tree
 *
 * What is the context of these interfaces? Who uses it?
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
// Do not import CSSOM implementation before the above main package entry point
const {
    ACCESS_THIRD_PARTY_STYLESHEET_ERROR,
    INSERT_INVALID_IMPORT_ERROR,
    UPDATE_LOCKED_STYLESHEET_ERROR,
} = require('../lib/cssom/CSSStyleSheet-impl.js')
const {
    INSERT_RULE_INVALID_GRAMMAR_ERROR,
    INSERT_RULE_INVALID_INDEX_ERROR,
    INSERT_RULE_INVALID_POSITION_ERROR,
    INSERT_RULE_UNEXPECTED_NAMESPACE_ERROR,
    INVALID_RULE_SYNTAX_ERROR,
} = require('../lib/parse/syntax.js')
const createError = require('../lib/error.js')

const {
    CSSImportRule,
    CSSKeyframeRule,
    CSSKeyframesRule,
    CSSMarginRule,
    CSSMediaRule,
    CSSNestingRule,
    CSSPageRule,
    CSSStyleRule,
    CSSRuleList,
    CSSStyleSheet,
    MediaList,
} = cssom

/**
 * @param {string} [cssRules]
 * @param {object} [properties]
 * @returns {CSSStyleSheet}
 *
 * It returns a CSSStyleSheet using the minimal default values.
 */
function createStyleSheet(cssRules = '', properties = {}) {
    return parseCSSStyleSheet({
        cssRules,
        location: 'https://github.com/cdoublev/stylesheet.css',
        media: '',
        originClean: true,
        ...properties,
    })
}

beforeAll(() => {
    install()
    globalThis.document = {
        href: 'https://github.com/cdoublev/',
    }
})

describe('parseStyleSheet()', () => {
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
        expect(styleSheet.ownerRule).toBeNull() // TODO: test non-null `ownerRule` with `@import`
    })
})

describe('CSSStyleSheet', () => {
    it('creates a constructed CSSStyleSheet', () => {

        const media = 'all'
        const options = { baseURL: 'css', disabled: true, media }
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

        // CSSStyleSheet properties
        expect(styleSheet.ownerRule).toBeNull()
    })
})

describe('CSSStyleSheet.insertRule(), CSSStyleSheet.deleteRule()', () => {
    it('inserts and deletes a rule', () => {

        const { CSSStyleSheet } = globalThis
        const styleSheet = new CSSStyleSheet()

        styleSheet.insertRule('.selector { color: red }', 0)

        const { cssRules } = styleSheet

        expect(cssRules).toHaveLength(1)

        const [styleRule] = cssRules
        const { parentStyleSheet } = styleRule

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
        expect(parentStyleSheet).toBe(styleSheet)

        styleSheet.insertRule('.selector { color: green }', 0)

        expect(cssRules[1]).toBe(styleRule)

        styleSheet.deleteRule(1)

        expect(cssRules).toHaveLength(1)
        expect(styleRule.parentStyleSheet).toBeNull()
        // TODO: test null `parentRule` with `CSSGroupingRule.deleteRule()`, `CSSNestingRule.deleteRule()`, `CSSStyleRule.deleteRule()`
    })
    it('returns a syntax error when trying to insert a statement that is not a rule', () => {

        const { CSSStyleSheet } = globalThis
        const styleSheet = new CSSStyleSheet()
        const error = createError(INVALID_RULE_SYNTAX_ERROR, true)

        expect(styleSheet.insertRule('color: red')).toEqual(error)
    })
    it('throws an error when trying to insert/delete a rule in a stylesheet whose origin is not clean', () => {

        const styleSheet = createStyleSheet('.selector { color: red }', { originClean: false })
        const error = createError(ACCESS_THIRD_PARTY_STYLESHEET_ERROR)

        expect(() => styleSheet.insertRule('.selector { color: green }')).toThrow(error)
        expect(() => styleSheet.deleteRule(0)).toThrow(error)
    })
    it('throws an error when trying to insert/delete a rule while modification on the stylesheet are not allowed', () => {

        const { CSSStyleSheet } = globalThis
        const styleSheet = new CSSStyleSheet()
        const error = createError(UPDATE_LOCKED_STYLESHEET_ERROR)

        styleSheet.insertRule('.selector { color: green }')
        styleSheet.replace('.selector { color: orange }')

        expect(() => styleSheet.insertRule('.selector { color: red }')).toThrow(error)
        expect(() => styleSheet.deleteRule(0)).toThrow(error)
    })
    it('throws an error when trying to insert an import rule in a constructed style sheet', () => {

        const { CSSStyleSheet } = globalThis
        const styleSheet = new CSSStyleSheet()
        const error = createError(INSERT_INVALID_IMPORT_ERROR)

        expect(() => styleSheet.insertRule('@import "./stylesheet.css";')).toThrow(error)
    })
    it("throws an error when trying to insert/delete a rule at an index greater or equal than rule's length", () => {

        const { CSSStyleSheet } = globalThis
        const styleSheet = new CSSStyleSheet()
        const error = createError(INSERT_RULE_INVALID_INDEX_ERROR)

        expect(() => styleSheet.insertRule('.selector { color: red }', 1)).toThrow(error)
        expect(() => styleSheet.deleteRule(0)).toThrow(error)
    })
    it('throws an error when trying to insert an invalid rule', () => {

        const { CSSStyleSheet } = globalThis
        const styleSheet = new CSSStyleSheet()
        const error = createError(INSERT_RULE_INVALID_GRAMMAR_ERROR)

        expect(() => styleSheet.insertRule('@namespace <bad-string-or-url>;', 0)).toThrow(error)
    })
    it('throws an error when trying to insert a rule at an invalid position', () => {

        // Create a non-constructed style sheet to allow inserting import rule
        const styleSheet = createStyleSheet()
        const error = createError(INSERT_RULE_INVALID_POSITION_ERROR)

        // styleSheet.insertRule('@charset "utf-8";')

        // expect(() => styleSheet.insertRule('@import "./stylesheet.css";')).toThrow(error)
        // expect(() => styleSheet.insertRule('@namespace "./stylesheet.css";')).toThrow(error)
        // expect(() => styleSheet.insertRule('.selector { color: red }')).toThrow(error)

        styleSheet.insertRule('@import "./stylesheet.css";')

        expect(() => styleSheet.insertRule('@namespace "design-system";')).toThrow(error)
        expect(() => styleSheet.insertRule('.selector { color: red }')).toThrow(error)

        styleSheet.insertRule('@namespace "design-system";', 1)

        expect(() => styleSheet.insertRule('.selector { color: red }', 1)).toThrow(error)
        expect(() => styleSheet.insertRule('@import "./stylesheet.css";', 2)).toThrow(error)

        styleSheet.insertRule('.selector { color: red }', 2)

        expect(() => styleSheet.insertRule('@import "./stylesheet.css";', 3)).toThrow(error)
        expect(() => styleSheet.insertRule('@namespace "design-system";', 3)).toThrow(error)
    })
    it('throws an error when trying to insert a namespace rule if any rule that is not a namespace or import rule exists', () => {

        const { CSSStyleSheet } = globalThis
        const styleSheet = new CSSStyleSheet()

        styleSheet.insertRule('.selector { color: red }')

        expect(() => styleSheet.insertRule('@namespace "design-system";')).toThrow(INSERT_RULE_UNEXPECTED_NAMESPACE_ERROR)
    })
})

describe('CSSStyleSheet.replace(), CSSStyleSheet.replaceSync()', () => {
    it('replaces a rule asynchronously/synchronously', async () => {

        const { CSSStyleSheet } = globalThis
        const styleSheet = new CSSStyleSheet()
        const { cssRules } = styleSheet

        expect(await styleSheet.replace('.selector { color: orange }')).toBe(styleSheet)
        expect(cssRules).toHaveLength(1)

        const [styleRule1] = cssRules

        expect(styleRule1.style.color).toBe('orange')

        styleSheet.replaceSync('.selector { color: green }')

        expect(cssRules).toHaveLength(1)

        const [styleRule2] = cssRules

        expect(styleRule2.style.color).toBe('green')
    })
    it('throws an error when trying to replace rules of a non-constructed stylesheet', () => {

        const styleSheet = createStyleSheet('.selector { color: red }')

        expect(() => styleSheet.replaceSync('')).toThrow(UPDATE_LOCKED_STYLESHEET_ERROR)
    })
    it('throws an error when trying to replace rules concurrently', async () => {

        const { CSSStyleSheet } = globalThis
        const styleSheet = new CSSStyleSheet()

        styleSheet.replace('')

        try {
            await styleSheet.replace('')
        } catch (error) {
            const { message, name } = UPDATE_LOCKED_STYLESHEET_ERROR
            expect(error.name).toBe(name)
            expect(error.message).toBe(message)
        }
    })
    it('ignores invalid rules and import rules', () => {

        const { CSSStyleSheet } = globalThis
        const styleSheet = new CSSStyleSheet()
        const { cssRules } = styleSheet
        const rules = `
            @import "./stylesheet.css";
            .selector { color: green }
            color: red
        `

        styleSheet.replaceSync(rules)

        expect(cssRules).toHaveLength(1)

        const [styleRule] = cssRules

        expect(styleRule.style.color).toBe('green')
    })
})

describe('grammar rules', () => {
    it('discards a declaration at the top level of the style sheet', () => {

        // It looks like a declaration but `{}` allows to parse it as a (invalid) qualified rule
        const { cssRules: [styleRule] } = createStyleSheet(`
            declaration: value;
            {}
            .selector { color: green }
            declaration: value;
            {}
        `)

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
        expect(styleRule.style.color).toBe('green')
    })
    it('discards a declaration with an unknown property in a style rule', () => {

        const { cssRules: [styleRule] } = createStyleSheet(`
            .selector {
                unknown-before: red;
                color: green;
                unknown-after: red
            }
        `)

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
        expect(styleRule.style).toHaveLength(1)
        expect(styleRule.style.color).toBe('green')
    })
    it('discards a declaration with an invalid value in a style rule', () => {

        const { cssRules: [styleRule] } = createStyleSheet(`
            .selector {
                top: invalid;
                color: green;
                bottom: invalid;
            }
        `)

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
        expect(styleRule.style).toHaveLength(1)
        expect(styleRule.style.color).toBe('green')
    })
    it('discards a declaration in a rule containing <stylesheet>', () => {

        // It looks like a declaration but `{}` allows to parse it as a (invalid) qualified rule
        const { cssRules: [mediaRule] } = createStyleSheet(`
            @media all {
                declaration: value;
                {}
                .selector { color: green }
                declaration: value;
                {}
            }
        `)

        expect(CSSMediaRule.is(mediaRule)).toBeTruthy()
        expect(mediaRule.cssRules).toHaveLength(1)

        const { cssRules: [styleRule] } = mediaRule

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
    })
    it('discards a declaration in a rule containing <rule-list>', () => {

        // It looks like a declaration but `{}` allows to parse it as a (invalid) qualified rule
        const { cssRules: [keyframesRule] } = createStyleSheet(`
            @keyframes myAnimation {
                declaration: value;
                {}
                to {
                    color: green;
                }
                declaration: value;
                {}
            }
        `)

        expect(CSSKeyframesRule.is(keyframesRule)).toBeTruthy()

        const { cssRules: [keyframeRule] } = keyframesRule

        expect(CSSKeyframeRule.is(keyframeRule)).toBeTruthy()
        expect(keyframeRule.style.color).toBe('green')
    })
    it('discards a declaration of a property not allowed in (nested) keyframe rules', () => {

        const { cssRules: [{ cssRules: [keyframeRule] }] } = createStyleSheet(`
            @keyframes myAnimation {
                to {
                    animation-delay: 1s;
                    color: green;
                    animation-duration: 1s;
                }
            }
        `)

        expect(CSSKeyframeRule.is(keyframeRule)).toBeTruthy()
        expect(keyframeRule.style.color).toBe('green')
    })
    it('discards a declaration of a property not allowed in @page', () => {

        const { cssRules: [pageRule] } = createStyleSheet(`
            @page {
                top: 1px;
                font-size: 16px;
                bottom: 1px;
            }
        `)

        expect(CSSPageRule.is(pageRule)).toBeTruthy()
        expect(pageRule.style).toHaveLength(1)
        expect(pageRule.style.fontSize).toBe('16px')
    })
    it('discards a declaration of a property not allowed in margin at-rules', () => {

        const { cssRules: [{ cssRules: [marginRule] }] } = createStyleSheet(`
            @page {
                @top-left {
                    top: 1px;
                    content: "allowed";
                    bottom: 1px;
                }
            }
        `)

        expect(CSSMarginRule.is(marginRule)).toBeTruthy()
        expect(marginRule.style).toHaveLength(1)
        expect(marginRule.style.content).toBe('\"allowed\"')
    })
    it('discards a rule whose name is unrecognized', () => {

        const { cssRules } = createStyleSheet(`
            @unknown {}
            @unknown;
        `)

        expect(cssRules).toHaveLength(0)
    })
    it('discards a rule whose prelude or value is invalid according to its production rule', () => {

        const { cssRules } = createStyleSheet(`
            @namespace ns {
                color: red;
            }
            @media all;
            .selector;
        `)

        expect(cssRules).toHaveLength(0)
    })
    it('discards @nest or a style rule whose selector starts with `&` at the top level of the style sheet', () => {

        const { cssRules } = createStyleSheet(`
            & .selector {
                color: red;
            }
            .selector {
                color: green;
            }
            @nest .selector {
                color: red;
            }
        `)

        expect(cssRules).toHaveLength(1)

        const [styleRule] = cssRules

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
        expect(styleRule.style.color).toBe('green')
    })
    it('discards a (qualified) keyframe rule anywhere outside @keyframes', () => {

        /* `from` and `to` are valid selectors for style rules */
        const { cssRules } = createStyleSheet(`
            0% {
                color: red;
            }
            @media all {
                100% {
                    color: red;
                }
            }
        `)

        expect(cssRules).toHaveLength(1)

        const [mediaRule] = cssRules

        expect(CSSMediaRule.is(mediaRule)).toBeTruthy()
        expect(mediaRule.cssRules).toHaveLength(0)
    })
    it('discards any rule that is not a nested style rule, @nest, or @media, in a style rule', () => {

        // CSS Syntax throws away everything that is invalid until reading `;`
        const { cssRules: [{ cssRules }] } = createStyleSheet(`
            .selector {
                @nest .nested {
                    color: green;
                }
                .nested {
                    color: red;
                };
                @keyframes myAnimation {
                    to {
                        color: red;
                    }
                };
                @media all {
                    color: green;
                }
            }
        `)

        expect(cssRules).toHaveLength(2)

        const [nestingRule, mediaRule] = cssRules

        expect(CSSNestingRule.is(nestingRule)).toBeTruthy()
        expect(CSSMediaRule.is(mediaRule)).toBeTruthy()

    })
    it.skip('discards @import preceded by another rule that is not @charset', () => {

        const { cssRules: [styleRule1, styleRule2] } = createStyleSheet(`
            .selector { color: green }
            @import "./stylesheet.css";
            .selector { color: green }
        `)

        expect(CSSStyleRule.is(styleRule1)).toBeTruthy()
        expect(CSSStyleRule.is(styleRule2)).toBeTruthy()
    })
    it.skip('discards @charset, @import, or @namespace in any at-rule', () => {

        const { cssRules } = createStyleSheet(`
            /* <stylesheet> */
            @media all {
                @import "./stylesheet.css";
                @namespace "design-system";
            }
            /* <rule-list> */
            @keyframes myAnimation {
                @import "./stylesheet.css";
                @namespace "design-system";
            }
            /* <declaration-list> */
            @page {
                @import "./stylesheet.css";
                @namespace "design-system";
            }
        `)

        expect(cssRules).toHaveLength(0)
    })
    it.skip('discards a margin rule at the top level of the style sheet or any at-rule that is not @page', () => {

        const { cssRules } = createStyleSheet(`
            @top-left {
                color: red;
            }
            /* <stylesheet> */
            @media all {
                @top-left {
                    color: red;
                }
            }
            /* <rule-list> */
            @keyframes myAnimation {
                @top-left {
                    color: red;
                }
            }
            /* TODO: case with top-level rule containing <declaration-list> */
        `)

        expect(cssRules).toHaveLength(0)
    })
    it.skip('discards any rule that is not allowed in a rule containing <declaration-list>', () => {

        const { cssRules } = createStyleSheet(`
            @page {
                /* Invalid: */
                @media all {
                    color: red;
                }
                @top-left {
                    /* Invalid: */
                    @media all {
                        color: red;
                    }
                }
            }
            @keyframes myAnimation {
                to {
                    /* Invalid: */
                    @media all {
                        color: red;
                    }
                }
            }
        `)

        expect(cssRules).toHaveLength(0)
    })
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
