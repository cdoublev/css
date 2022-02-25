/**
 * What should be tested?
 *
 * - the CSSOM tree resulting from parsing a style sheet according to the CSS
 * grammar defining where statements (rules/declarations) are allowed or not
 * - the `CSSStyleSheet` interface to interact with (read/write) the CSSOM tree
 * - the `CSSRule` subclasses because they can not be instantiated and are only
 * accessible via an instance of `CSSStyleSheet` or `CSSRule`
 *
 * What are the corresponding interfaces?
 *
 * - `CSSStyleSheetWrapper.create()`: creates a CSSOM tree from a style sheet
 * - `new CSSStyleSheet()`: creates a new (empty) CSSOM tree
 *
 * What is the context of these interfaces? Who uses it?
 *
 * A non-constructed CSSStyleSheet is created when parsing:
 *   - a Link HTTP header
 *   - <link>
 *   - <style>
 *   - a style sheet referenced by `@import`?
 *
 * A constructed CSSStyleSheet is created only by an end user?
 */

const { cssom, install } = require('../lib/index.js')
// Do not import CSSOM implementations before the above main package entry point
const {
    ACCESS_THIRD_PARTY_STYLESHEET_ERROR,
    INSERT_INVALID_IMPORT_ERROR,
    UPDATE_LOCKED_STYLESHEET_ERROR,
} = require('../lib/cssom/CSSStyleSheet-impl.js')
const {
    INSERT_RULE_INVALID_GRAMMAR_ERROR,
    INSERT_RULE_INVALID_INDEX_ERROR,
    INSERT_RULE_INVALID_POSITION_ERROR,
    INVALID_NAMESPACE_STATE_ERROR,
    INVALID_RULE_SYNTAX_ERROR,
} = require('../lib/parse/syntax.js')
const createError = require('../lib/error.js')

const {
    CSSImportRule,
    CSSKeyframeRule,
    CSSKeyframesRule,
    CSSMarginRule,
    CSSMediaRule,
    CSSNamespaceRule,
    CSSNestingRule,
    CSSPageRule,
    CSSStyleRule,
    CSSRuleList,
    CSSStyleDeclaration,
    CSSStyleSheet,
    MediaList,
} = cssom

/**
 * @param {string} [cssRules]
 * @param {object} [properties]
 * @returns {CSSStyleSheet}
 *
 * It returns a non-constructed `CSSStyleSheet` using minimal default property
 * values.
 */
function createStyleSheet(cssRules = '', properties = {}) {
    properties = {
        cssRules,
        location: 'https://github.com/cdoublev/stylesheet.css',
        media: '',
        originClean: true,
        ...properties,
    }
    return CSSStyleSheet.create(globalThis, undefined, properties)
}

beforeAll(() => {
    install()
    globalThis.document = {
        href: 'https://github.com/cdoublev/',
    }
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
            location,
            media,
            originClean: true,
            ownerNode,
            title,
        }
        const styleSheet = createStyleSheet(input, properties)

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
    it('throws an error when trying to insert/delete a rule while modifications on the stylesheet are not allowed', () => {

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

        styleSheet.insertRule('@import "./stylesheet.css";')

        expect(() => styleSheet.insertRule('@namespace svg "http://www.w3.org/2000/svg";')).toThrow(error)
        expect(() => styleSheet.insertRule('.selector { color: red }')).toThrow(error)

        styleSheet.insertRule('@namespace svg "http://www.w3.org/2000/svg";', 1)

        expect(() => styleSheet.insertRule('.selector { color: red }', 1)).toThrow(error)
        expect(() => styleSheet.insertRule('@import "./stylesheet.css";', 2)).toThrow(error)

        styleSheet.insertRule('.selector { color: red }', 2)

        expect(() => styleSheet.insertRule('@import "./stylesheet.css";', 3)).toThrow(error)
        expect(() => styleSheet.insertRule('@namespace svg "http://www.w3.org/2000/svg";', 3)).toThrow(error)
    })
    it('throws an error when trying to insert a namespace rule if any rule that is not a namespace or import rule exists', () => {

        const { CSSStyleSheet } = globalThis
        const styleSheet = new CSSStyleSheet()

        styleSheet.insertRule('.selector { color: red }')

        expect(() => styleSheet.insertRule('@namespace svg "http://www.w3.org/2000/svg";'))
            .toThrow(INVALID_NAMESPACE_STATE_ERROR)
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
        const error = createError(UPDATE_LOCKED_STYLESHEET_ERROR)

        styleSheet.replace('')

        return expect(styleSheet.replace('')).rejects.toMatchObject(error)
    })
    it('ignores import rules and invalid statements', () => {

        const { CSSStyleSheet } = globalThis
        const styleSheet = new CSSStyleSheet()
        const { cssRules } = styleSheet
        const rules = `
            @import "./stylesheet.css";
            @namespace <bad-string-or-url>;
            .selector { color: green }
            color: red
        `

        styleSheet.replaceSync(rules)

        expect(cssRules).toHaveLength(1)

        const [styleRule] = cssRules

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
        expect(styleRule.style.color).toBe('green')
    })
})

describe('grammar rules', () => {
    it('ignores @charset', () => {

        const { cssRules: [styleRule1, styleRule2] } = createStyleSheet(`
            @charset "utf-8";
            .selector { color: green }
            @charset "utf-8";
            .selector { color: green }
        `)

        expect(CSSStyleRule.is(styleRule1)).toBeTruthy()
        expect(CSSStyleRule.is(styleRule2)).toBeTruthy()
    })
    it('ignores @import preceded by any other valid rule than @charset', () => {

        const { cssRules: [styleRule1, styleRule2] } = createStyleSheet(`
            .selector { color: green }
            @import "./stylesheet.css";
            .selector { color: green }
        `)

        expect(CSSStyleRule.is(styleRule1)).toBeTruthy()
        expect(CSSStyleRule.is(styleRule2)).toBeTruthy()
    })
    it('does not ignore @import preceded by invalid rule(s) or followed by @charset', () => {

        const { cssRules: [importRule] } = createStyleSheet(`
            @namespace <bad-string-or-url>;
            @import "./stylesheet.css";
        `)

        expect(CSSImportRule.is(importRule)).toBeTruthy()
    })
    it('ignores @namespace preceded by any other valid rules than @import', () => {

        const { cssRules: [styleRule1, styleRule2] } = createStyleSheet(`
            .selector { color: green }
            @namespace svg "http://www.w3.org/2000/svg";
            .selector { color: green }
        `)

        expect(CSSStyleRule.is(styleRule1)).toBeTruthy()
        expect(CSSStyleRule.is(styleRule2)).toBeTruthy()
    })
    it('does not ignore @namespace preceded by an invalid rule or followed by @charset or an invalid @import', () => {

        const { cssRules: [namespaceRule, ...otherRules] } = createStyleSheet(`
            @import <bad-string-or-url>;
            @namespace svg "http://www.w3.org/2000/svg";
            @charset "UTF-8";
            @import <bad-string-or-url>;
        `)

        expect(CSSNamespaceRule.is(namespaceRule)).toBeTruthy()
        expect(otherRules).toHaveLength(0)
    })
    it('ignores a declaration at the top level of the style sheet', () => {

        // `{}` allows to parse below declarations as (invalid) qualified rules
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
    it('ignores a declaration with an unknown property in a style rule', () => {

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
    it('ignores a declaration with an invalid value in a style rule', () => {

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
    it.todo('ignores a declaration appearing after a rule in a style rule')
    it('ignores a declaration in a rule containing <stylesheet>', () => {

        // `{}` allows to parse below declarations as (invalid) qualified rules
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
    it('ignores a declaration in a rule containing <rule-list>', () => {

        // `{}` allows to parse below declarations as (invalid) qualified rules
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
    it('ignores a declaration with a disallowed property or an invalid value in (qualified) keyframe rules', () => {

        // A declaration value with `!important` is invalid in keyframe rules
        const { cssRules: [{ cssRules: [keyframeRule] }] } = createStyleSheet(`
            @keyframes myAnimation {
                to {
                    animation-delay: 1s;
                    color: green;
                    animation-duration: 1s;
                    color: red !important;
                }
            }
        `)

        expect(CSSKeyframeRule.is(keyframeRule)).toBeTruthy()
        expect(keyframeRule.style.color).toBe('green')
    })
    it('ignores a declaration with a disallowed property or an invalid value in @page', () => {

        const { cssRules: [pageRule] } = createStyleSheet(`
            @page {
                top: 1px;
                font-size: 16px;
                bottom: 1px;
                invalid: value;
                font-size: 20px !important;
            }
        `)

        expect(CSSPageRule.is(pageRule)).toBeTruthy()
        expect(pageRule.style).toHaveLength(1)
        expect(pageRule.style.fontSize).toBe('20px')
    })
    it('ignores a declaration with a disallowed property or an invalid value in margin at-rules', () => {

        const { cssRules: [{ cssRules: [marginRule] }] } = createStyleSheet(`
            @page {
                @top-left {
                    top: 1px;
                    content: "allowed";
                    bottom: 1px;
                    content: "important" !important;
                    invalid: value;
                }
            }
        `)

        expect(CSSMarginRule.is(marginRule)).toBeTruthy()
        expect(marginRule.style).toHaveLength(1)
        expect(marginRule.style.content).toBe('"important"')
    })
    it('ignores a rule whose name is unrecognized', () => {

        const { cssRules } = createStyleSheet(`
            @unknown {}
            @unknown;
        `)

        expect(cssRules).toHaveLength(0)
    })
    it('ignores a rule whose prelude or value is invalid according to its production rule', () => {

        const { cssRules } = createStyleSheet(`
            @namespace ns {
                color: red;
            }
            @media all;
            .selector;
        `)

        expect(cssRules).toHaveLength(0)
    })
    it('ignores a nested style rule at the top level of the style sheet', () => {

        const { cssRules } = createStyleSheet(`
            & .selector {
                color: red;
            }
            .selector {
                color: green;
            }
            @nest .selector & {
                color: red;
            }
        `)

        expect(cssRules).toHaveLength(1)

        const [styleRule] = cssRules

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
        expect(styleRule.style.color).toBe('green')
    })
    it.todo('ignores a directly nested style rule whose prelude is not a nest-prefixed selector')
    it.todo('ignores @nest whose prelude is not a nest-containing selector')
    it('ignores a (qualified) keyframe rule anywhere outside @keyframes', () => {

        // `from` and `to` are valid selectors for style rules
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
    it('ignores any other rules than a nested style rule, @nest, or @media, in a style rule', () => {

        // CSS Syntax throws away invalid tokens until reading `;`
        const { cssRules: [{ cssRules }] } = createStyleSheet(`
            .selector {
                .nested {
                    color: red;
                };
                @nest .container & {
                    color: green;
                }
                @keyframes myAnimation {
                    to {
                        color: red;
                    }
                }
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
    it('ignores @charset, @import, or @namespace in any at-rule', () => {

        const { cssRules: [mediaRule, keyframesRule, pageRule] } = createStyleSheet(`
            /* <stylesheet> */
            @media all {
                @import "./stylesheet.css";
                @namespace svg "http://www.w3.org/2000/svg";
            }
            /* <rule-list> */
            @keyframes myAnimation {
                @import "./stylesheet.css";
                @namespace svg "http://www.w3.org/2000/svg";
            }
            /* <declaration-list> */
            @page {
                @import "./stylesheet.css";
                @namespace svg "http://www.w3.org/2000/svg";
            }
        `)

        expect(mediaRule.cssRules).toHaveLength(0)
        expect(keyframesRule.cssRules).toHaveLength(0)
        expect(pageRule.cssRules).toHaveLength(0)
    })
    it('ignores a margin rule at the top level of the style sheet or in any other rule than @page', () => {

        // TODO: add case using a top-level rule containing <declaration-list> and that is not @page
        const { cssRules: [mediaRule, keyframesRule] } = createStyleSheet(`
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
        `)

        expect(CSSMediaRule.is(mediaRule)).toBeTruthy()
        expect(mediaRule.cssRules).toHaveLength(0)
        expect(CSSKeyframesRule.is(keyframesRule)).toBeTruthy()
        expect(keyframesRule.cssRules).toHaveLength(0)
    })
    it('ignores any rule not allowed in a rule containing <declaration-list>', () => {

        const { cssRules: [{ cssRules: [marginRule] }, { cssRules: [keyframeRule] }] } = createStyleSheet(`
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

        expect(CSSMarginRule.is(marginRule)).toBeTruthy()
        expect(marginRule.cssRules).toBeUndefined()
        expect(CSSKeyframeRule.is(keyframeRule)).toBeTruthy()
        expect(keyframeRule.cssRules).toBeUndefined()
    })
})

describe('CSSCounterStyleRule', () => {})
describe('CSSFontFaceRule', () => {})
describe('CSSFontFeatureValuesRule', () => {})
describe('CSSImportRule', () => {
    it('has all properties', () => {

        const input = '@import "./stylesheet.css";'
        const styleSheet = createStyleSheet(input, { media: 'all' })
        const { cssRules: [rule] } = styleSheet
        const { cssText, href, media, parentRule, parentStyleSheet, styleSheet: importedStyleSheet } = rule

        // CSSRule properties
        expect(cssText).toBe('@import url("./stylesheet.css");')
        expect(parentRule).toBeNull()
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSImportRule proeprties
        expect(href).toBe('./stylesheet.css')
        // TODO: implement fetching the stylesheet referenced by @import
        // expect(media).toBe(importedStyleSheet.media)
        // expect(CSSStyleSheet.is(importedStyleSheet)).toBeTruthy()

        // const { ownerRule, parentStyleSheet } = importedStyleSheet

        // expect(importedStyleSheet.ownerRule).toBe(rule)
        // expect(importedStyleSheet.parentStyleSheet).toBe(parentStyleSheet)
    })
})
describe('CSSKeyframeRule', () => {
    it('has all properties', () => {

        const input = '@keyframes myAnimation { to { color: red; color: orange } }'
        const styleSheet = createStyleSheet(input)
        const { cssRules: [keyframesRule] } = styleSheet
        const { cssRules: [rule] } = keyframesRule
        const { cssText, keyText, parentRule, parentStyleSheet, style } = rule

        // CSSRule properties
        expect(cssText).toBe('to {\n  color: orange;\n}')
        expect(parentRule).toBe(keyframesRule)
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSKeyframeRule properties
        expect(keyText).toBe('to')
        expect(CSSStyleDeclaration.is(style)).toBeTruthy()
        expect(style).toHaveLength(1)

        style.color = 'green'

        // CSSKeyframeRule declarations should be shared with CSSStyleDeclaration
        expect(rule.cssText).toBe('to {\n  color: green;\n}')

        rule.keyText = 'from'

        expect(rule.keyText).toBe('from')
        expect(rule.cssText).toBe('from {\n  color: green;\n}')
    })
})
describe('CSSKeyframesRule', () => {
    it('has all properties', () => {

        const input = '@keyframes myAnimation { to { color: green } }'
        const styleSheet = createStyleSheet(input)
        const { cssRules: [rule] } = styleSheet
        const { cssRules, cssText, name, parentRule, parentStyleSheet } = rule

        // CSSRule properties
        expect(cssText).toBe('@keyframes myAnimation {\n  to {\n  color: green;\n}\n}')
        expect(parentRule).toBeNull()
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSKeyframesRule properties
        expect(CSSRuleList.is(cssRules)).toBeTruthy()
        expect(cssRules).toHaveLength(1)
        expect(name).toBe('myAnimation')

        rule.name = 'myAnimationName'

        expect(rule.name).toBe('myAnimationName')
        expect(rule.cssText).toBe('@keyframes myAnimationName {\n  to {\n  color: green;\n}\n}')
    })
    it('has all methods', () => {

        const { cssRules: [rule] } = createStyleSheet('@keyframes myAnimation {}')
        const { cssRules: keyframes } = rule
        const error = createError({ message: 'Failed to parse a rule', type: 'ParseError' })

        expect(keyframes).toHaveLength(0)

        rule.appendRule('to { color: orange }')

        expect(keyframes).toHaveLength(1)
        expect(keyframes[0].style.color).toBe('orange')

        // TODO: fix https://github.com/w3c/csswg-drafts/issues/6972
        expect(() => rule.appendRule('invalid')).toThrow(error)
        expect(keyframes).toHaveLength(1)

        rule.appendRule('to { color: green }')

        expect(keyframes).toHaveLength(2)
        expect(keyframes[1].style.color).toBe('green')
        expect(rule.findRule('to')).toBe(keyframes[1])

        rule.deleteRule('to')

        expect(keyframes).toHaveLength(1)
        expect(keyframes[0].style.color).toBe('orange')

        // TODO: remove eg. `50%` when the keyframe selector is `0%, 50%, 100%` (number and order must match)
        // TODO: remove eg. `0%,50%` when the keyframe selector is `0%, 50%` (not sensitive to whitespace)
        // TODO: same requirements for CSSKeyframeRule.findRule()
    })
})
describe('CSSMarginRule', () => {
    it('has all properties', () => {

        const input = '@page { @top-left { color: red; color: orange } }'
        const styleSheet = createStyleSheet(input)
        const { cssRules: [pageRule] } = styleSheet
        const { cssRules: [{ cssText, name, parentRule, parentStyleSheet, style }] } = pageRule

        // CSSRule properties
        expect(cssText).toBe('@top-left {\n  color: orange;\n}')
        expect(parentRule).toBe(pageRule)
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSMarginRule properties
        expect(name).toBe('top-left')
        expect(CSSStyleDeclaration.is(style)).toBeTruthy()
        expect(style).toHaveLength(1)

        style.color = 'green'

        // CSSMarginRule declarations should be shared with CSSStyleDeclaration
        expect(style.color).toBe('green')
    })
})
describe('CSSMediaRule', () => {
    it('has all properties', () => {

        const input = '@media all { .selector { color: green } }'
        const styleSheet = createStyleSheet(input)
        const { cssRules: [{ conditionText, cssRules, cssText, media, parentRule, parentStyleSheet }] } = styleSheet

        // CSSRule properties
        expect(cssText).toBe('@media all {\n  .selector {\n  color: green;\n}\n}')
        expect(parentRule).toBeNull()
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule properties
        expect(CSSRuleList.is(cssRules)).toBeTruthy()

        // CSSConditionRule properties
        expect(conditionText).toBe('all')

        // CSSMediaRule properties
        expect(MediaList.is(media)).toBeTruthy()
    })
    it('has all methods', () => {

        const { cssRules: [rule] } = createStyleSheet('@media all {}')
        const { cssRules } = rule
        const error = createError({ message: 'Failed to parse a rule', type: 'ParseError' })

        expect(cssRules).toHaveLength(0)

        rule.insertRule('.selector { color: orange }')

        expect(cssRules).toHaveLength(1)

        expect(() => rule.insertRule('invalid')).toThrow(error)
        expect(cssRules).toHaveLength(1)

        rule.insertRule('.selector { color: red }')

        expect(cssRules).toHaveLength(2)

        rule.insertRule('.selector { color: green }', 2)

        expect(cssRules).toHaveLength(3)
        expect(cssRules[0].style.color).toBe('red')
        expect(cssRules[1].style.color).toBe('orange')
        expect(cssRules[2].style.color).toBe('green')

        rule.deleteRule(0)

        expect(cssRules).toHaveLength(2)
        expect(cssRules[0].style.color).toBe('orange')
        expect(cssRules[1].style.color).toBe('green')
    })
    it.todo('should contain <stylesheet> at the top level of the style sheet')
    it.todo('should contain <style-block> when nested in a CSSStyleRule or CSSNestingRule')
})
describe('CSSNamespaceRule', () => {
    it('has all properties', () => {

        const input = '@namespace svg "http://www.w3.org/2000/svg";'
        const styleSheet = createStyleSheet(input)
        const { cssRules: [{ cssText, namespaceURI, prefix, parentRule, parentStyleSheet }] } = styleSheet

        // CSSRule properties
        expect(cssText).toBe('@namespace svg url("http://www.w3.org/2000/svg");')
        expect(parentRule).toBeNull()
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSNamespaceRule
        expect(namespaceURI).toBe('http://www.w3.org/2000/svg')
        expect(prefix).toBe('svg')
    })
    it('should register namespaces to use in selectors', () => {

        const input = `
            @namespace svg url("http://www.w3.org/2000/svg");
            svg|rect { fill: green }
            SVG|rect { fill: red }
        `
        const styleSheet = createStyleSheet(input)
        const { cssRules } = styleSheet

        expect(cssRules).toHaveLength(2)

        const [, { selectorText, style }] = cssRules

        expect(selectorText).toBe('svg|rect')
        expect(style.fill).toBe('green')
    })
})
describe('CSSNestingRule', () => {
    it('has all properties', () => {

        const input = '.selector { @nest .container & { color: red; color: orange } }'
        const styleSheet = createStyleSheet(input)
        const { cssRules: [styleRule] } = styleSheet
        const { cssRules: [rule] } = styleRule
        const { cssRules, cssText, parentRule, parentStyleSheet, selectorText, style } = rule

        // CSSRule properties
        expect(cssText).toBe('@nest .container & {\n  color: orange;\n}')
        expect(parentRule).toBe(styleRule)
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSNestingRule properties
        expect(CSSRuleList.is(cssRules)).toBeTruthy()
        expect(selectorText).toBe('.container &')
        expect(CSSStyleDeclaration.is(style)).toBeTruthy()
        expect(style).toHaveLength(1)

        style.color = 'green'

        // CSSNestingRule declarations should be shared with CSSStyleDeclaration
        expect(rule.cssText).toBe('@nest .container & {\n  color: green;\n}')

        rule.selectorText = '.container-element &'

        expect(rule.selectorText).toBe('.container-element &')
        expect(rule.cssText).toBe('@nest .container-element & {\n  color: green;\n}')
    })
    it('has all methods', () => {

        const { cssRules: [{ cssRules: [rule] }] } = createStyleSheet('.selector { @nest .container & {} }')
        const { cssRules } = rule
        const error = createError({ message: 'Failed to parse a rule', type: 'ParseError' })

        expect(cssRules).toHaveLength(0)

        rule.insertRule('@media screen {}')

        expect(cssRules).toHaveLength(1)

        expect(() => rule.insertRule('invalid')).toThrow(error)
        expect(cssRules).toHaveLength(1)

        rule.insertRule('@media print {}')

        expect(cssRules).toHaveLength(2)

        rule.insertRule('@media all {}', 2)

        expect(cssRules).toHaveLength(3)
        expect(cssRules[0].conditionText).toBe('print')
        expect(cssRules[1].conditionText).toBe('screen')
        expect(cssRules[2].conditionText).toBe('all')

        rule.deleteRule(0)

        expect(cssRules).toHaveLength(2)
        expect(cssRules[0].conditionText).toBe('screen')
        expect(cssRules[1].conditionText).toBe('all')
    })
})
describe('CSSPageRule', () => {
    it('has all properties', () => {

        const input = '@page intro { color: red; color: orange; @top-left {} }'
        const styleSheet = createStyleSheet(input)
        const { cssRules: [rule] } = styleSheet
        const { cssRules, cssText, parentRule, parentStyleSheet, selectorText, style } = rule

        // CSSRule properties
        expect(cssText).toBe('@page intro {\n  color: orange;\n  @top-left {}\n}')
        expect(parentRule).toBeNull()
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule properties
        expect(CSSRuleList.is(cssRules)).toBeTruthy()

        // CSSPageRule properties
        expect(selectorText).toBe('intro')
        expect(CSSStyleDeclaration.is(style)).toBeTruthy()
        expect(style).toHaveLength(1)

        style.color = 'green'

        // CSSPageRule declarations should be shared with CSSStyleDeclaration
        expect(rule.cssText).toBe('@page intro {\n  color: green;\n  @top-left {}\n}')

        rule.selectorText = 'outro'

        expect(rule.selectorText).toBe('outro')
        expect(rule.cssText).toBe('@page outro {\n  color: green;\n  @top-left {}\n}')
    })
    it('has all methods', () => {

        const { cssRules: [rule] } = createStyleSheet('@page {}')
        const { cssRules } = rule
        const error = createError({ message: 'Failed to parse a rule', type: 'ParseError' })

        expect(cssRules).toHaveLength(0)

        rule.insertRule('@top-left {}')

        expect(cssRules).toHaveLength(1)

        expect(() => rule.insertRule('invalid')).toThrow(error)
        expect(cssRules).toHaveLength(1)

        rule.insertRule('@top-left-corner {}')

        expect(cssRules).toHaveLength(2)

        rule.insertRule('@top-center {}', 2)

        expect(cssRules).toHaveLength(3)
        expect(cssRules[0].name).toBe('top-left-corner')
        expect(cssRules[1].name).toBe('top-left')
        expect(cssRules[2].name).toBe('top-center')

        rule.deleteRule(0)

        expect(cssRules).toHaveLength(2)
        expect(cssRules[0].name).toBe('top-left')
        expect(cssRules[1].name).toBe('top-center')
    })
})
describe('CSSPropertyRule', () => {})
describe('CSSStyleRule', () => {
    it('has all properties', () => {

        const input = '.selector { color: red; color: orange; & .child { color: red; color: orange } }'
        const styleSheet = createStyleSheet(input)
        const { cssRules: [styleRule] } = styleSheet
        const { cssRules: [nestedStyleRule] } = styleRule

        // CSSRule properties
        expect(styleRule.cssText).toBe('.selector {\n  color: orange;\n  & .child {\n  color: orange;\n}\n}')
        expect(nestedStyleRule.cssText).toBe('& .child {\n  color: orange;\n}')
        expect(styleRule.parentRule).toBeNull()
        expect(nestedStyleRule.parentRule).toBe(styleRule)
        expect(styleRule.parentStyleSheet).toBe(styleSheet)
        expect(nestedStyleRule.parentStyleSheet).toBe(styleSheet)

        // CSSStyleRule properties
        expect(CSSRuleList.is(styleRule.cssRules)).toBeTruthy()
        expect(CSSRuleList.is(nestedStyleRule.cssRules)).toBeTruthy()
        expect(styleRule.selectorText).toBe('.selector')
        expect(nestedStyleRule.selectorText).toBe('& .child')
        expect(CSSStyleDeclaration.is(styleRule.style)).toBeTruthy()
        expect(CSSStyleDeclaration.is(nestedStyleRule.style)).toBeTruthy()
        expect(styleRule.style).toHaveLength(1)
        expect(nestedStyleRule.style).toHaveLength(1)

        styleRule.style.color = 'green'
        nestedStyleRule.style.color = 'green'

        // CSSStyleRule declarations should be shared with CSSStyleDeclaration
        expect(styleRule.cssText).toBe('.selector {\n  color: green;\n  & .child {\n  color: green;\n}\n}')
        expect(nestedStyleRule.cssText).toBe('& .child {\n  color: green;\n}')

        styleRule.selectorText = '.selector-element'
        nestedStyleRule.selectorText = '& .child-element'

        expect(styleRule.selectorText).toBe('.selector-element')
        expect(nestedStyleRule.selectorText).toBe('& .child-element')
        expect(styleRule.cssText).toBe('.selector-element {\n  color: green;\n  & .child-element {\n  color: green;\n}\n}')
        expect(nestedStyleRule.cssText).toBe('& .child-element {\n  color: green;\n}')
    })
    it('has all methods', () => {

        const { cssRules: [rule] } = createStyleSheet('.selector {}')
        const { cssRules } = rule
        const error = createError({ message: 'Failed to parse a rule', type: 'ParseError' })

        expect(cssRules).toHaveLength(0)

        rule.insertRule('@media screen {}')

        expect(cssRules).toHaveLength(1)

        expect(() => rule.insertRule('invalid')).toThrow(error)
        expect(cssRules).toHaveLength(1)

        rule.insertRule('@media print {}')

        expect(cssRules).toHaveLength(2)

        rule.insertRule('@media all {}', 2)

        expect(cssRules).toHaveLength(3)
        expect(cssRules[0].conditionText).toBe('print')
        expect(cssRules[1].conditionText).toBe('screen')
        expect(cssRules[2].conditionText).toBe('all')

        rule.deleteRule(0)

        expect(cssRules).toHaveLength(2)
        expect(cssRules[0].conditionText).toBe('screen')
        expect(cssRules[1].conditionText).toBe('all')
    })
})
describe('CSSSupportsRule', () => {
    it('has all properties', () => {

        const input = '@supports (color: green) { .selector { color: green } }'
        const styleSheet = createStyleSheet(input)
        const { cssRules: [{ conditionText, cssRules, cssText, parentRule, parentStyleSheet }] } = styleSheet

        // CSSRule properties
        expect(cssText).toBe('@supports (color: green) {\n  .selector {\n  color: green;\n}\n}')
        expect(parentRule).toBeNull()
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule properties
        expect(CSSRuleList.is(cssRules)).toBeTruthy()

        // CSSConditionRule properties
        expect(conditionText).toBe('(color: green)')
    })
    it('has all methods', () => {

        const { cssRules: [rule] } = createStyleSheet('@supports (color: green) {}')
        const { cssRules } = rule
        const error = createError({ message: 'Failed to parse a rule', type: 'ParseError' })

        expect(cssRules).toHaveLength(0)

        rule.insertRule('.selector { color: orange }')

        expect(cssRules).toHaveLength(1)

        expect(() => rule.insertRule('invalid')).toThrow(error)
        expect(cssRules).toHaveLength(1)

        rule.insertRule('.selector { color: red }')

        expect(cssRules).toHaveLength(2)

        rule.insertRule('.selector { color: green }', 2)

        expect(cssRules).toHaveLength(3)
        expect(cssRules[0].style.color).toBe('red')
        expect(cssRules[1].style.color).toBe('orange')
        expect(cssRules[2].style.color).toBe('green')

        rule.deleteRule(0)

        expect(cssRules).toHaveLength(2)
        expect(cssRules[0].style.color).toBe('orange')
        expect(cssRules[1].style.color).toBe('green')
    })
    it.todo('should contain <stylesheet> at the top level of the style sheet')
    it.todo('should contain <style-block> when nested in a CSSStyleRule or CSSNestingRule')
})
