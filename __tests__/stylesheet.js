
const { cssom, install } = require('../lib/index.js')
// Do not import CSSOM implementations before the above import
const {
    ACCESS_THIRD_PARTY_STYLESHEET_ERROR,
    INSERT_INVALID_IMPORT_ERROR,
    UPDATE_LOCKED_STYLESHEET_ERROR,
} = require('../lib/cssom/CSSStyleSheet-impl.js')
const { SET_INVALID_KEY_TEXT_ERROR } = require('../lib/cssom/CSSKeyframeRule-impl.js')
const {
    INVALID_NAMESPACE_STATE_ERROR,
    INVALID_RULE_INDEX_ERROR,
    INVALID_RULE_POSITION_ERROR,
    INVALID_RULE_SYNTAX_ERROR,
} = require('../lib/parse/syntax.js')
const createError = require('../lib/error.js')

const {
    CSSImportRule,
    CSSKeyframeRule,
    CSSKeyframesRule,
    CSSLayerBlockRule,
    CSSLayerStatementRule,
    CSSMarginRule,
    CSSMediaRule,
    CSSNamespaceRule,
    CSSPageRule,
    CSSRuleList,
    CSSStyleDeclaration,
    CSSStyleRule,
    CSSStyleSheet,
    CSSSupportsRule,
    MediaList,
} = cssom

/**
 * @param {string} [rules]
 * @param {object} [properties]
 * @returns {CSSStyleSheet}
 *
 * It returns a non-constructed CSSStyleSheet by using default values for the
 * required arguments.
 */
function createStyleSheet(rules = '', properties = {}) {
    properties = {
        location: 'https://github.com/cdoublev/stylesheet.css',
        media: '',
        originClean: true,
        rules,
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
        const styleSheet = new globalThis.CSSStyleSheet(options)

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
        const styleSheet = createStyleSheet('', properties)

        expect(CSSStyleSheet.is(styleSheet)).toBeTruthy()

        // StyleSheet properties
        expect(styleSheet.disabled).toBeFalsy()
        expect(styleSheet.href).toBe(location)
        expect(MediaList.is(styleSheet.media)).toBeTruthy()
        expect(styleSheet.media.mediaText).toBe(media)
        expect(styleSheet.ownerNode).toBe(ownerNode)
        expect(styleSheet.parentStyleSheet).toBeNull()
        expect(styleSheet.title).toBe(title)
        expect(styleSheet.type).toBe('text/css')

        // CSSStyleSheet properties
        expect(CSSRuleList.is(styleSheet.cssRules)).toBeTruthy()
        expect(styleSheet.ownerRule).toBeNull()
    })
})
describe('CSSStyleSheet.insertRule(), CSSStyleSheet.deleteRule()', () => {
    it('inserts and deletes a rule', () => {

        const styleSheet = createStyleSheet()
        const { cssRules } = styleSheet

        styleSheet.insertRule('@namespace svg "http://www.w3.org/2000/svg";', 0)

        expect(cssRules).toHaveLength(1)

        const [namespaceRule] = cssRules

        expect(CSSNamespaceRule.is(namespaceRule)).toBeTruthy()

        styleSheet.insertRule('@namespace html "https://www.w3.org/1999/xhtml/";')

        expect(cssRules[1]).toBe(namespaceRule)

        styleSheet.deleteRule(1)

        expect(cssRules).toHaveLength(1)
        expect(namespaceRule.parentStyleSheet).toBeNull()

        styleSheet.insertRule('@import "./page.css";')
        styleSheet.insertRule('@layer reset;')
        styleSheet.insertRule('@namespace svg "http://www.w3.org/2000/svg";', 3)
        styleSheet.insertRule('@layer base;', 4)
        styleSheet.insertRule('svg|rect {}', 5)

        expect(cssRules).toHaveLength(6)
    })
    it('returns a syntax error when trying to insert an invalid rule according to the CSS syntax', () => {

        const styleSheet = createStyleSheet()
        const error = createError(INVALID_RULE_SYNTAX_ERROR)

        expect(styleSheet.insertRule('color: red')).toEqual(error)
    })
    it('throws an error when trying to insert/delete a rule in a stylesheet whose origin is not clean', () => {

        const styleSheet = createStyleSheet('', { originClean: false })
        const error = createError(ACCESS_THIRD_PARTY_STYLESHEET_ERROR)

        expect(() => styleSheet.insertRule('style {}')).toThrow(error)
        expect(() => styleSheet.deleteRule(0)).toThrow(error)
    })
    it('throws an error when trying to insert/delete a rule while modifications on the stylesheet are not allowed', () => {

        const styleSheet = new globalThis.CSSStyleSheet()
        const error = createError(UPDATE_LOCKED_STYLESHEET_ERROR)

        styleSheet.replace('')

        expect(() => styleSheet.insertRule('style {}')).toThrow(error)
        expect(() => styleSheet.deleteRule(0)).toThrow(error)
    })
    it('throws an error when trying to insert @import in a constructed style sheet', () => {

        const styleSheet = new globalThis.CSSStyleSheet()
        const error = createError(INSERT_INVALID_IMPORT_ERROR)

        expect(() => styleSheet.insertRule('@import "./global.css";')).toThrow(error)
    })
    it('throws an error when trying to insert/delete a rule at an index greater than the length of rules', () => {

        const styleSheet = createStyleSheet()
        const error = createError(INVALID_RULE_INDEX_ERROR)

        expect(() => styleSheet.insertRule('style {}', 1)).toThrow(error)
        expect(() => styleSheet.deleteRule(0)).toThrow(error)
    })
    it('throws an error when trying to insert an invalid rule according to the CSS grammar', () => {

        const styleSheet = createStyleSheet()
        const error = createError(INVALID_RULE_SYNTAX_ERROR)

        expect(() => styleSheet.insertRule('@charset "utf-8";')).toThrow(error)
    })
    it('throws an error when trying to insert any other rule than @import or @layer before @import', () => {

        const styleSheet = createStyleSheet('@import "./global.css";')
        const error = createError(INVALID_RULE_POSITION_ERROR)

        expect(() => styleSheet.insertRule('@namespace svg "http://www.w3.org/2000/svg";')).toThrow(error)
        expect(() => styleSheet.insertRule('style {}')).toThrow(error)
    })
    it('throws an error when trying to insert any other rule than @import, @namespace, or @layer before @namespace', () => {

        const styleSheet = createStyleSheet('@namespace svg "http://www.w3.org/2000/svg";')
        const error = createError(INVALID_RULE_POSITION_ERROR)

        expect(() => styleSheet.insertRule('style {}')).toThrow(error)
    })
    it('throws an error when trying to insert @import after any other rule than @import or @layer', () => {

        const styleSheet = createStyleSheet('@namespace svg "http://www.w3.org/2000/svg";')
        const error = createError(INVALID_RULE_POSITION_ERROR)

        expect(() => styleSheet.insertRule('@import "./global.css";', 1)).toThrow(error)
    })
    it('throws an error when trying to insert @layer between @import and @import', () => {

        const styleSheet = createStyleSheet(`
            @import "./global.css";
            @import "./page.css";
        `)
        const error = createError(INVALID_RULE_POSITION_ERROR)

        expect(() => styleSheet.insertRule('@layer base;', 1)).toThrow(error)
    })
    it('throws an error when trying to insert @layer between @import and @namespace', () => {

        const styleSheet = createStyleSheet(`
            @import "./global.css";
            @namespace svg "http://www.w3.org/2000/svg";
        `)
        const error = createError(INVALID_RULE_POSITION_ERROR)

        expect(() => styleSheet.insertRule('@layer base;', 1)).toThrow(error)
    })
    it('throws an error when trying to insert @layer between @namespace and @namespace', () => {

        const styleSheet = createStyleSheet(`
            @namespace html "https://www.w3.org/1999/xhtml/";
            @namespace svg "http://www.w3.org/2000/svg";
        `)
        const error = createError(INVALID_RULE_POSITION_ERROR)

        expect(() => styleSheet.insertRule('@layer base;', 1)).toThrow(error)
    })
    it('throws an error when trying to insert @namespace if any other rule than @import, @layer, or @namespace exists', () => {

        const styleSheet = createStyleSheet('style {}')
        const error = createError(INVALID_NAMESPACE_STATE_ERROR)

        expect(() => styleSheet.insertRule('@namespace svg "http://www.w3.org/2000/svg";')).toThrow(error)
    })
})
describe('CSSStyleSheet.replace(), CSSStyleSheet.replaceSync()', () => {
    it('replaces a rule asynchronously/synchronously', async () => {

        const styleSheet = new globalThis.CSSStyleSheet()
        const { cssRules } = styleSheet

        expect(await styleSheet.replace('style { color: orange }')).toBe(styleSheet)
        expect(cssRules).toHaveLength(1)
        expect(cssRules[0].style.color).toBe('orange')

        styleSheet.replaceSync('style { color: green }')

        expect(cssRules).toHaveLength(1)
        expect(cssRules[0].style.color).toBe('green')
    })
    it('throws an error when trying to replace rules of a non-constructed stylesheet', () => {

        const styleSheet = createStyleSheet()
        const error = createError(UPDATE_LOCKED_STYLESHEET_ERROR)

        expect(() => styleSheet.replaceSync('')).toThrow(error)
    })
    it('throws an error when trying to replace rules concurrently', async () => {

        const styleSheet = new globalThis.CSSStyleSheet()
        const error = createError(UPDATE_LOCKED_STYLESHEET_ERROR)

        styleSheet.replace('')

        return expect(styleSheet.replace('')).rejects.toMatchObject(error)
    })
    it('ignores import rules and invalid statements', () => {

        const styleSheet = new globalThis.CSSStyleSheet()
        const { cssRules } = styleSheet
        const rules = `
            @import "./global.css";
            @namespace <bad-string-or-url>;
            style { color: green }
            color: red
        `

        styleSheet.replaceSync(rules)

        expect(CSSStyleRule.is(cssRules[0])).toBeTruthy()
    })
})

describe('CSSRuleList.item(), CSSRuleList[', () => {
    it('returns the rule at the given index', () => {
        const { cssRules } = createStyleSheet(`
            #rule-1 {}
            #rule-2 {}
        `)
        expect(cssRules.item(1)).toBe(cssRules[1])
        expect(cssRules.item(2)).toBeNull()
    })
})
describe('CSSRuleList.length', () => {
    it('returns the length of the rule list', () => {
        const { cssRules } = createStyleSheet(`
            #rule-1 {}
            #rule-2 {}
        `)
        expect(cssRules).toHaveLength(2)
    })
})

describe('grammar rules', () => {
    it('does not ignore a rule wrapped in an HTML comment at the top-level of the style sheet', () => {

        // CSS Syntax throws invalid tokens away until reading `;`
        const { cssRules } = createStyleSheet(`
            <!-- style {} -->
            style {
                <!-- color: red; -->;
                color: green;
                <!-- color: red; -->
            }
        `)

        expect(cssRules).toHaveLength(2)
        expect(cssRules[1].style.color).toBe('green')
    })
    it('ignores a rule whose name is unrecognized', () => {

        const { cssRules } = createStyleSheet(`
            @unknown {}
            @unknown;
        `)

        expect(cssRules).toHaveLength(0)
    })
    it('ignores a rule whose prelude or block value is invalid according to its definition', () => {

        const { cssRules } = createStyleSheet(`
            @namespace ns {}
            @media all;
            style;
        `)

        expect(cssRules).toHaveLength(0)
    })
    it('ignores @charset', () => {

        const { cssRules: [importRule, namespaceRule, styleRule] } = createStyleSheet(`
            @import "./global.css";
            @charset "utf-8";
            @namespace svg "http://www.w3.org/2000/svg";
            @charset "utf-8";
            style {}
            @charset "utf-8";
        `)

        expect(CSSImportRule.is(importRule)).toBeTruthy()
        expect(CSSNamespaceRule.is(namespaceRule)).toBeTruthy()
        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
    })
    it('ignores @import following any other non-ignored rule than @layer', () => {

        const { cssRules: [namespaceRule, styleRule] } = createStyleSheet(`
            @namespace svg "http://www.w3.org/2000/svg";
            @import "./global.css";
            style {}
        `)

        expect(CSSNamespaceRule.is(namespaceRule)).toBeTruthy()
        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
    })
    it('ignores @import following @layer interleaved after another @import', () => {

        const { cssRules: [, layerRule, styleRule] } = createStyleSheet(`
            @import "./global.css";
            @layer reset;
            @import "./page.css";
            style {}
        `)

        expect(CSSLayerStatementRule.is(layerRule)).toBeTruthy()
        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
    })
    it('does not ignore @import following @layer or ignored rules', () => {

        const { cssRules: [, importRule, layerRule] } = createStyleSheet(`
            @layer reset;
            @charset "utf-8";
            @namespace <bad-string-or-url>;
            @import "./global.css";
            @layer base;
        `)

        expect(CSSImportRule.is(importRule)).toBeTruthy()
        expect(CSSLayerStatementRule.is(layerRule)).toBeTruthy()
    })
    it('does not ignore @import following ignored rules interleaved after another @import', () => {

        const { cssRules: [, importRule, styleRule] } = createStyleSheet(`
            @import "./global.css";
            @charset "utf-8";
            @namespace <bad-string-or-url>;
            @layer <bad-ident>;
            @import "./page.css";
            style {}
        `)

        expect(CSSImportRule.is(importRule)).toBeTruthy()
        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
    })
    it('ignores @namespace following any other non-ignored rule than @import or @layer', () => {

        const { cssRules: [styleRule1, styleRule2] } = createStyleSheet(`
            style {}
            @namespace svg "http://www.w3.org/2000/svg";
            style {}
        `)

        expect(CSSStyleRule.is(styleRule1)).toBeTruthy()
        expect(CSSStyleRule.is(styleRule2)).toBeTruthy()
    })
    it('ignores @namespace following @layer interleaved after another @namespace', () => {

        const { cssRules: [, layerRule, styleRule] } = createStyleSheet(`
            @namespace html "https://www.w3.org/1999/xhtml/";
            @layer reset;
            @namespace svg "http://www.w3.org/2000/svg";
            style {}
        `)

        expect(CSSLayerStatementRule.is(layerRule)).toBeTruthy()
        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
    })
    it('ignores @namespace following @layer interleaved after @import', () => {

        const { cssRules: [, layerRule, styleRule] } = createStyleSheet(`
            @import "./global.css";
            @layer reset;
            @namespace svg "http://www.w3.org/2000/svg";
            style {}
        `)

        expect(CSSLayerStatementRule.is(layerRule)).toBeTruthy()
        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
    })
    it('does not ignore @namespace following @import, @layer, or ignored rule(s)', () => {

        const { cssRules: [,, namespaceRule, layerRule] } = createStyleSheet(`
            @layer reset;
            @charset "utf-8";
            @import "./global.css";
            @namespace svg "http://www.w3.org/2000/svg";
            @layer base;
        `)

        expect(CSSNamespaceRule.is(namespaceRule)).toBeTruthy()
        expect(CSSLayerStatementRule.is(layerRule)).toBeTruthy()
    })
    it('does not ignore @namespace following ignored rules interleaved after another @namespace', () => {

        const { cssRules: [, namespaceRule, layerRule] } = createStyleSheet(`
            @namespace html "https://www.w3.org/1999/xhtml/";
            @charset "utf-8";
            @import <bad-string-or-url>;
            @layer <bad-string-or-url>;
            @namespace svg "http://www.w3.org/2000/svg";
            @layer base;
        `)

        expect(CSSNamespaceRule.is(namespaceRule)).toBeTruthy()
        expect(CSSLayerStatementRule.is(layerRule)).toBeTruthy()
    })
    it('ignores a rule not allowed at the top-level of the style sheet', () => {

        const { cssRules } = createStyleSheet(`
            @top-left {}
            & { color: green }
            0% {}
        `)

        expect(cssRules).toHaveLength(1)
        expect(CSSStyleRule.is(cssRules[0])).toBeTruthy()
    })
    it('ignores a rule not allowed in @layer', () => {

        const { cssRules: [{ cssRules }] } = createStyleSheet(`
            @layer reset {
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @top-left {}
                & { color: green }
                0% {}
            }
        `)

        expect(cssRules).toHaveLength(1)
        expect(CSSStyleRule.is(cssRules[0])).toBeTruthy()
    })
    it('ignores a rule not allowed in @media', () => {

        const { cssRules: [{ cssRules }] } = createStyleSheet(`
            @media all {
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @top-left {}
                & { color: green }
                0% {}
            }
        `)

        expect(cssRules).toHaveLength(1)
        expect(CSSStyleRule.is(cssRules[0])).toBeTruthy()
    })
    it('ignores a rule not allowed in @supports', () => {

        const { cssRules: [{ cssRules }] } = createStyleSheet(`
            @supports (color: green) {
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @top-left {}
                & { color: green }
                0% {}
            }
        `)

        expect(cssRules).toHaveLength(1)
        expect(CSSStyleRule.is(cssRules[0])).toBeTruthy()
    })
    it('ignores a rule not allowed in @keyframes', () => {

        // CSS Syntax throws invalid tokens away until reading `;`
        const { cssRules: [{ cssRules }] } = createStyleSheet(`
            @keyframes myAnimation {
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @keyframes subAnimation {}
                @layer reset;
                @media all {}
                @top-left {}
                @supports (color: red) {}
                style {}
                0% { color: green }
                & {}
            }
        `)

        expect(cssRules).toHaveLength(1)
        expect(CSSKeyframeRule.is(cssRules[0])).toBeTruthy()
    })
    it('ignores a rule not allowed in @page', () => {

        // CSS Syntax throws invalid tokens away until reading `;`
        const { cssRules: [{ cssRules }] } = createStyleSheet(`
            @page {
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @keyframes myAnimation {}
                @layer reset;
                @media all {}
                @supports (color: red) {}
                & {};
                @top-left { color: green }
                color: green;
                0% {}
            }
        `)

        expect(cssRules).toHaveLength(1)
        expect(CSSMarginRule.is(cssRules[0])).toBeTruthy()
    })
    it('ignores a rule not allowed in a keyframe rule', () => {

        // CSS Syntax throws invalid tokens away until reading `;`
        const { cssRules: [{ cssRules: [{ cssRules, style: { color } }] }] } = createStyleSheet(`
            @keyframes myAnimation {
                0% {
                    @import "./global.css";
                    @namespace svg "http://www.w3.org/2000/svg";
                    @keyframes myAnimation {}
                    @layer reset;
                    @media all {}
                    @top-left {}
                    @supports (color: red) {}
                    & {};
                    color: green;
                    0% {}
                }
            }
        `)

        expect(cssRules).toBeUndefined()
        expect(color).toBe('green')
    })
    it('ignores a rule not allowed in a margin rule', () => {

        // CSS Syntax throws invalid tokens away until reading `;`
        const { cssRules: [{ cssRules: [{ cssRules, style: { color } }] }] } = createStyleSheet(`
            @page {
                @top-left {
                    @import "./global.css";
                    @namespace svg "http://www.w3.org/2000/svg";
                    @keyframes myAnimation {}
                    @layer reset;
                    @media all {}
                    @top-left {}
                    @supports (color: red) {}
                    & {};
                    color: green;
                    0% {}
                }
            }
        `)

        expect(cssRules).toBeUndefined()
        expect(color).toBe('green')
    })
    it('ignores a rule not allowed in a style rule', () => {

        // CSS Syntax throws invalid tokens away until reading `;`
        const { cssRules: [{ cssRules, style }] } = createStyleSheet(`
            style {
                top: 1px;
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @keyframes myAnimation {}
                @layer reset;
                @top-left {}
                identifier {};
                function() {};
                & { color: green }
                @layer { color: green }
                @media all { color: green }
                @supports (color: green) { color: green }
                0% {};
                bottom: 1px;
            }
        `)

        expect(style.top).toBe('1px')
        expect(style.bottom).toBe('1px')
        expect(cssRules).toHaveLength(4)

        const [styleRule, layerRule, mediaRule, supportsRule] = cssRules

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
        expect(CSSLayerBlockRule.is(layerRule)).toBeTruthy()
        expect(CSSMediaRule.is(mediaRule)).toBeTruthy()
        expect(CSSSupportsRule.is(supportsRule)).toBeTruthy()
    })
    it('ignores a rule not allowed in a nested style rule', () => {

        // CSS Syntax throws invalid tokens away until reading `;`
        const { cssRules: [{ cssRules: [styleRule] }] } = createStyleSheet(`
            style {
                & {
                    top: 1px;
                    @import "./global.css";
                    @namespace svg "http://www.w3.org/2000/svg";
                    @keyframes myAnimation {}
                    @layer reset;
                    @top-left {}
                    identifier {};
                    & { color: green }
                    bottom: 2px;
                    0% {};
                    bottom: 1px;
                }
            }
        `)

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()

        const { cssRules: [nestedStyleRule], style } = styleRule

        expect(CSSStyleRule.is(nestedStyleRule)).toBeTruthy()
        expect(style.top).toBe('1px')
        expect(style.bottom).toBe('1px')
    })
    it('ignores a rule not allowed in a conditional rule nested in a style rule', () => {

        // CSS Syntax throws invalid tokens away until reading `;`
        const { cssRules: [{ cssRules: [mediaRule] }] } = createStyleSheet(`
            style {
                @media all {
                    top: 1px;
                    @import "./global.css";
                    @namespace svg "http://www.w3.org/2000/svg";
                    @keyframes myAnimation {}
                    @layer reset;
                    @top-left {}
                    identifier {};
                    @media all { color: green }
                    0% {};
                    bottom: 1px;
                }
            }
        `)

        expect(CSSMediaRule.is(mediaRule)).toBeTruthy()

        const { cssRules: [implicitStyleRule, nestedMediaRule] } = mediaRule

        expect(CSSStyleRule.is(implicitStyleRule)).toBeTruthy()
        expect(implicitStyleRule.style.top).toBe('1px')
        expect(implicitStyleRule.style.bottom).toBe('1px')
        expect(CSSMediaRule.is(nestedMediaRule)).toBeTruthy()
    })
    it('ignores a style rule whose prelude includes an undeclared namespace prefix', () => {

        const input = `
            @namespace svg "http://www.w3.org/2000/svg";
            svg|rect { fill: green }
            SVG|rect { fill: red }
            @namespace html "https://www.w3.org/1999/xhtml/";
            html|type {}
        `
        const { cssRules } = createStyleSheet(input)

        expect(cssRules).toHaveLength(2)

        const [, styleRule] = cssRules

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()

        const { selectorText, style: { fill } } = styleRule

        expect(selectorText).toBe('svg|rect')
        expect(fill).toBe('green')
    })
    it('ignores a declaration at the top-level of the style sheet', () => {

        // CSS Syntax throws invalid tokens away until reading `{}`
        const { cssRules: [styleRule] } = createStyleSheet(`
            color: red; {}
            style {}
            color: red;
        `)

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
    })
    it('ignores a declaration in <stylesheet>', () => {

        // CSS Syntax throws invalid tokens away until reading `{}`
        const { cssRules: [mediaRule] } = createStyleSheet(`
            @media all {
                color: red; {}
                style {}
                color: red;
            }
        `)

        expect(CSSMediaRule.is(mediaRule)).toBeTruthy()
        expect(CSSStyleRule.is(mediaRule.cssRules[0])).toBeTruthy()
    })
    it('ignores a declaration in <rule-list>', () => {

        // CSS Syntax throws invalid tokens away until reading `{}`
        const { cssRules: [keyframesRule] } = createStyleSheet(`
            @keyframes myAnimation {
                color: red; {}
                to {}
                color: red;
            }
        `)

        expect(CSSKeyframesRule.is(keyframesRule)).toBeTruthy()
        expect(CSSKeyframeRule.is(keyframesRule.cssRules[0])).toBeTruthy()
    })
    it('ignores a declaration for an unknown property', () => {

        const { cssRules: [styleRule] } = createStyleSheet(`
            style {
                unknown-before: red;
                color: green;
                unknown-after: red;
            }
        `)

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
        expect(styleRule.style).toHaveLength(1)
        expect(styleRule.style.color).toBe('green')
    })
    it('ignores a declaration of an invalid value', () => {

        const { cssRules: [styleRule] } = createStyleSheet(`
            style {
                top: invalid;
                color: green;
                bottom: invalid;
            }
        `)

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()
        expect(styleRule.style).toHaveLength(1)
        expect(styleRule.style.color).toBe('green')
    })
    it('ignores a declaration for a disallowed property or of an invalid value in a keyframe rule', () => {

        // `!important` is invalid in a keyframe rule
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
        expect(keyframeRule.style).toHaveLength(1)
        expect(keyframeRule.style.color).toBe('green')
    })
    it('ignores a declaration for a disallowed property or of an invalid value in @page', () => {

        // `!important` is invalid in @page
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
    it('ignores a declaration for a disallowed property or of an invalid value in margin at-rules', () => {

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
    it('replaces a declaration for `display` in a keyframe rule', () => {
        const { cssRules: [{ cssRules: [{ style: { display } }] }] } = createStyleSheet(`
            @keyframes myAnimation {
                to {
                    display: none;
                }
            }
        `)
        expect(display).toBe('revert-layer')
    })
    it('parses a vendor prefixed rule', () => {
        const { cssRules: [keyframesRule] } = createStyleSheet('@-webkit-keyframes myAnimation {}')
        expect(CSSKeyframesRule.is(keyframesRule)).toBeTruthy()
        expect(keyframesRule.cssText).toBe('@keyframes myAnimation {}')
    })
})

describe('CSSCounterStyleRule', () => {})
describe('CSSFontFaceRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@font-face { src: url(serif.woff2); }')
        const { cssRules: [rule] } = styleSheet
        const { cssText, parentRule, parentStyleSheet, style } = rule

        // CSSRule properties
        expect(cssText).toBe('@font-face {\n  src: url("serif.woff2");\n}')
        expect(parentRule).toBeNull()
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSFontFaceRule properties
        expect(CSSStyleDeclaration.is(style)).toBeTruthy()
        expect(style).toHaveLength(1)
    })
})
describe('CSSFontFeatureValuesRule', () => {})
describe('CSSImportRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@import "./global.css";', { media: 'all' })
        const { cssRules: [rule] } = styleSheet
        const { cssText, href, media, parentRule, parentStyleSheet, styleSheet: importedStyleSheet } = rule

        // CSSRule properties
        expect(cssText).toBe('@import url("./global.css");')
        expect(parentRule).toBeNull()
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSImportRule proeprties
        expect(href).toBe('./global.css')
        // expect(media).toBe(importedStyleSheet.media)
        // expect(CSSStyleSheet.is(importedStyleSheet)).toBeTruthy()

        // const { ownerRule, parentStyleSheet } = importedStyleSheet

        // expect(importedStyleSheet.ownerRule).toBe(rule)
        // expect(importedStyleSheet.parentStyleSheet).toBe(parentStyleSheet)
    })
})
describe('CSSKeyframeRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@keyframes myAnimation { to { color: red; color: orange } }')
        const { cssRules: [keyframesRule] } = styleSheet
        const { cssRules: [rule] } = keyframesRule
        const { cssText, keyText, parentRule, parentStyleSheet, style } = rule

        // CSSRule properties
        expect(cssText).toBe('100% {\n  color: orange;\n}')
        expect(parentRule).toBe(keyframesRule)
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSKeyframeRule properties
        expect(keyText).toBe('100%')
        expect(CSSStyleDeclaration.is(style)).toBeTruthy()
        expect(style).toHaveLength(1)

        style.color = 'green'

        // CSSKeyframeRule declarations must be shared with CSSStyleDeclaration
        expect(rule.cssText).toBe('100% {\n  color: green;\n}')

        rule.keyText = 'from'

        expect(rule.keyText).toBe('0%')
        expect(rule.cssText).toBe('0% {\n  color: green;\n}')
    })
    it('throws an error when trying to set an invalid keyframe selector', () => {

        const styleSheet = createStyleSheet('@keyframes myAnimation { to {} }')
        const { cssRules: [{ cssRules: [keyframeRule] }] } = styleSheet

        expect(() => keyframeRule.keyText = '101%').toThrow(createError(SET_INVALID_KEY_TEXT_ERROR))
    })
})
describe('CSSKeyframesRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@keyframes myAnimation { to {} }')
        const { cssRules: [rule] } = styleSheet
        const { cssRules, cssText, name, parentRule, parentStyleSheet } = rule

        // CSSRule properties
        expect(cssText).toBe('@keyframes myAnimation {\n  100% {}\n}')
        expect(parentRule).toBeNull()
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSKeyframesRule properties
        expect(CSSRuleList.is(cssRules)).toBeTruthy()
        expect(rule).toHaveLength(1)
        expect(rule[0]).toBe(cssRules[0])
        expect(cssRules).toHaveLength(1)
        expect(name).toBe('myAnimation')

        rule.name = 'myAnimationName'

        expect(rule.name).toBe('myAnimationName')
        expect(rule.cssText).toBe('@keyframes myAnimationName {\n  100% {}\n}')
    })
    it('has all methods', () => {

        const { cssRules: [rule] } = createStyleSheet('@keyframes myAnimation {}')
        const { cssRules: keyframes } = rule
        const error = createError(INVALID_RULE_SYNTAX_ERROR, true)

        expect(keyframes).toHaveLength(0)

        rule.appendRule('to { color: orange }')

        expect(rule.findRule('to')).toBe(keyframes[0])
        expect(rule.findRule('100%')).toBe(keyframes[0])
        expect(keyframes).toHaveLength(1)
        expect(keyframes[0].style.color).toBe('orange')
        expect(() => rule.appendRule('invalid')).toThrow(error)

        rule.appendRule('to { color: green }')
        const [, to] = keyframes

        expect(keyframes).toHaveLength(2)
        expect(to.style.color).toBe('green')
        expect(rule.findRule('to')).toBe(to)

        rule.deleteRule('to')

        expect(keyframes).toHaveLength(1)
        expect(to.parentRule).toBeNull()
        expect(rule.findRule('to')).toBe(keyframes[0])

        rule.appendRule('50%, 100% {}')

        expect(keyframes).toHaveLength(2)
        expect(rule.findRule('50%')).toBeNull()
        expect(rule.findRule('100%, 50%')).toBeNull()
        expect(rule.findRule('50%, 100%')).toBe(keyframes[1])
        expect(rule.findRule('50%,100%')).toBe(keyframes[1])

        rule.deleteRule('50%')

        expect(keyframes).toHaveLength(2)

        rule.deleteRule('50%, 100%')

        expect(keyframes).toHaveLength(1)
    })
})
describe('CSSLayerBlockRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet(`
            @layer reset {
                style {}
            }`)
        const { cssRules: [{ cssRules, cssText, name, parentRule, parentStyleSheet }] } = styleSheet

        // CSSRule properties
        expect(cssText).toBe('@layer reset {\n  style {}\n}')
        expect(parentRule).toBeNull()
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule properties
        expect(CSSRuleList.is(cssRules)).toBeTruthy()

        // CSSLayerBlockRule properties
        expect(name).toBe('reset')
    })
})
describe('CSSLayerStatementRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@layer reset;')
        const { cssRules: [{ cssText, nameList, parentRule, parentStyleSheet }] } = styleSheet

        // CSSRule properties
        expect(cssText).toBe('@layer reset;')
        expect(parentRule).toBeNull()
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSLayerStatementRule properties
        expect(nameList).toBe('reset')
    })
})
describe('CSSMarginRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@page { @top-left { color: red; color: orange } }')
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

        // CSSMarginRule declarations must be shared with CSSStyleDeclaration
        expect(style.color).toBe('green')
    })
})
describe('CSSMediaRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@media all { style {} }')
        const { cssRules: [{ conditionText, cssRules, cssText, media, parentRule, parentStyleSheet }] } = styleSheet

        // CSSRule properties
        expect(cssText).toBe('@media all {\n  style {}\n}')
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
        const error = createError(INVALID_RULE_SYNTAX_ERROR, true)

        expect(cssRules).toHaveLength(0)

        rule.insertRule('style { color: orange }')

        expect(cssRules).toHaveLength(1)
        expect(() => rule.insertRule('invalid')).toThrow(error)

        rule.insertRule('style { color: red }')

        expect(cssRules).toHaveLength(2)

        rule.insertRule('style { color: green }', 2)
        const [styleRule] = cssRules

        expect(cssRules).toHaveLength(3)
        expect(styleRule.style.color).toBe('red')
        expect(cssRules[1].style.color).toBe('orange')
        expect(cssRules[2].style.color).toBe('green')

        rule.deleteRule(0)

        expect(cssRules).toHaveLength(2)
        expect(styleRule.parentRule).toBeNull()
        expect(cssRules[0].style.color).toBe('orange')
        expect(cssRules[1].style.color).toBe('green')
    })
})
describe('CSSNamespaceRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@namespace svg "http://www.w3.org/2000/svg";')
        const { cssRules: [{ cssText, namespaceURI, prefix, parentRule, parentStyleSheet }] } = styleSheet

        // CSSRule properties
        expect(cssText).toBe('@namespace svg url("http://www.w3.org/2000/svg");')
        expect(parentRule).toBeNull()
        expect(parentStyleSheet).toBe(styleSheet)

        // CSSNamespaceRule
        expect(namespaceURI).toBe('http://www.w3.org/2000/svg')
        expect(prefix).toBe('svg')
    })
})
describe('CSSPageRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@page intro { color: red; color: orange; @top-left {} }')
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

        // CSSPageRule declarations must be shared with CSSStyleDeclaration
        expect(rule.cssText).toBe('@page intro {\n  color: green;\n  @top-left {}\n}')

        rule.selectorText = 'outro'

        expect(rule.selectorText).toBe('outro')
        expect(rule.cssText).toBe('@page outro {\n  color: green;\n  @top-left {}\n}')
    })
    it('has all methods', () => {

        const { cssRules: [rule] } = createStyleSheet('@page {}')
        const { cssRules } = rule
        const error = createError(INVALID_RULE_SYNTAX_ERROR, true)

        expect(cssRules).toHaveLength(0)

        rule.insertRule('@top-left {}')

        expect(cssRules).toHaveLength(1)
        expect(() => rule.insertRule('invalid')).toThrow(error)

        rule.insertRule('@top-left-corner {}')

        expect(cssRules).toHaveLength(2)

        rule.insertRule('@top-center {}', 2)
        const [marginRule] = cssRules

        expect(cssRules).toHaveLength(3)
        expect(marginRule.name).toBe('top-left-corner')
        expect(cssRules[1].name).toBe('top-left')
        expect(cssRules[2].name).toBe('top-center')

        rule.deleteRule(0)

        expect(cssRules).toHaveLength(2)
        expect(marginRule.parentRule).toBeNull()
        expect(cssRules[0].name).toBe('top-left')
        expect(cssRules[1].name).toBe('top-center')
    })
})
describe('CSSPropertyRule', () => {})
describe('CSSStyleRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet(`
            style {
                color: red;
                color: orange;
                & .child {
                    color: red;
                    color: orange
                }
            }
        `)
        const { cssRules: [styleRule] } = styleSheet
        const { cssRules: [nestedStyleRule] } = styleRule

        // CSSRule properties
        expect(styleRule.cssText).toBe('style {\n  color: orange;\n  & .child {\n  color: orange;\n}\n}')
        expect(nestedStyleRule.cssText).toBe('& .child {\n  color: orange;\n}')
        expect(styleRule.parentRule).toBeNull()
        expect(nestedStyleRule.parentRule).toBe(styleRule)
        expect(styleRule.parentStyleSheet).toBe(styleSheet)
        expect(nestedStyleRule.parentStyleSheet).toBe(styleSheet)

        // CSSStyleRule properties
        expect(CSSRuleList.is(styleRule.cssRules)).toBeTruthy()
        expect(CSSRuleList.is(nestedStyleRule.cssRules)).toBeTruthy()
        expect(styleRule.selectorText).toBe('style')
        expect(nestedStyleRule.selectorText).toBe('& .child')
        expect(CSSStyleDeclaration.is(styleRule.style)).toBeTruthy()
        expect(CSSStyleDeclaration.is(nestedStyleRule.style)).toBeTruthy()
        expect(styleRule.style).toHaveLength(1)
        expect(nestedStyleRule.style).toHaveLength(1)

        styleRule.style.color = 'green'
        nestedStyleRule.style.color = 'green'

        // CSSStyleRule declarations must be shared with CSSStyleDeclaration
        expect(styleRule.cssText).toBe('style {\n  color: green;\n  & .child {\n  color: green;\n}\n}')
        expect(nestedStyleRule.cssText).toBe('& .child {\n  color: green;\n}')

        styleRule.selectorText = 'parent'
        nestedStyleRule.selectorText = '& child'

        expect(styleRule.selectorText).toBe('parent')
        expect(nestedStyleRule.selectorText).toBe('& child')
        expect(styleRule.cssText).toBe('parent {\n  color: green;\n  & child {\n  color: green;\n}\n}')
        expect(nestedStyleRule.cssText).toBe('& child {\n  color: green;\n}')

        nestedStyleRule.selectorText = 'identifier'
        nestedStyleRule.selectorText = 'function()'

        expect(nestedStyleRule.selectorText).toBe('& child')
    })
    it('has all methods', () => {

        const { cssRules: [rule] } = createStyleSheet('style {}')
        const { cssRules } = rule
        const error = createError(INVALID_RULE_SYNTAX_ERROR, true)

        expect(cssRules).toHaveLength(0)

        rule.insertRule('@media screen {}')

        expect(cssRules).toHaveLength(1)
        expect(() => rule.insertRule('invalid')).toThrow(error)

        rule.insertRule('@media print {}')

        expect(cssRules).toHaveLength(2)

        rule.insertRule('@media all {}', 2)
        const [styleRule] = cssRules

        expect(cssRules).toHaveLength(3)
        expect(styleRule.conditionText).toBe('print')
        expect(cssRules[1].conditionText).toBe('screen')
        expect(cssRules[2].conditionText).toBe('all')

        rule.deleteRule(0)

        expect(cssRules).toHaveLength(2)
        expect(styleRule.parentRule).toBeNull()
        expect(cssRules[0].conditionText).toBe('screen')
        expect(cssRules[1].conditionText).toBe('all')
    })
})
describe('CSSSupportsRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@supports (color: green) { style {} }')
        const { cssRules: [{ conditionText, cssRules, cssText, parentRule, parentStyleSheet }] } = styleSheet

        // CSSRule properties
        expect(cssText).toBe('@supports (color: green) {\n  style {}\n}')
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
        const error = createError(INVALID_RULE_SYNTAX_ERROR, true)

        expect(cssRules).toHaveLength(0)

        rule.insertRule('style { color: orange }')

        expect(cssRules).toHaveLength(1)
        expect(() => rule.insertRule('invalid')).toThrow(error)

        rule.insertRule('style { color: red }')

        expect(cssRules).toHaveLength(2)

        rule.insertRule('style { color: green }', 2)
        const [styleRule] = cssRules

        expect(cssRules).toHaveLength(3)
        expect(styleRule.style.color).toBe('red')
        expect(cssRules[1].style.color).toBe('orange')
        expect(cssRules[2].style.color).toBe('green')

        rule.deleteRule(0)

        expect(cssRules).toHaveLength(2)
        expect(styleRule.parentRule).toBeNull()
        expect(cssRules[0].style.color).toBe('orange')
        expect(cssRules[1].style.color).toBe('green')
    })
})
