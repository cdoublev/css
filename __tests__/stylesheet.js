
const { cssom, install } = require('../lib/index.js')
// Do not import CSSOM implementations before the above import
const {
    ACCESS_THIRD_PARTY_STYLESHEET_ERROR,
    INSERT_INVALID_IMPORT_ERROR,
    UPDATE_LOCKED_STYLESHEET_ERROR,
} = require('../lib/cssom/CSSStyleSheet-impl.js')
const {
    EXTRA_RULE_ERROR,
    INVALID_NAMESPACE_STATE_ERROR,
    INVALID_RULE_INDEX_ERROR,
    INVALID_RULE_POSITION_ERROR,
    INVALID_RULE_SYNTAX_ERROR,
    MISSING_RULE_ERROR,
    UNKNOWN_RULE_ERROR,
} = require('../lib/parse/parser.js')
const { SET_INVALID_KEY_TEXT_ERROR } = require('../lib/cssom/CSSKeyframeRule-impl.js')
const { SET_INVALID_NAME_ERROR } = require('../lib/cssom/CSSKeyframesRule-impl.js')
const { INVALID_FONT_FEATURE_VALUE_ERROR } = require('../lib/cssom/CSSFontFeatureValuesMap-impl.js')
const { cssPropertyToIDLAttribute } = require('../lib/utils/string.js')
const descriptors = require('../lib/descriptors/definitions.js')
const root = require('../lib/rules/definitions.js')

const {
    CSSColorProfileRule,
    CSSContainerRule,
    CSSCounterStyleRule,
    CSSImportRule,
    CSSFontFaceDescriptors,
    CSSFontFaceRule,
    CSSFontFeatureValuesMap,
    CSSFontFeatureValuesRule,
    CSSFontPaletteValuesRule,
    CSSFunctionRule,
    CSSKeyframeProperties,
    CSSKeyframeRule,
    CSSKeyframesRule,
    CSSLayerBlockRule,
    CSSLayerStatementRule,
    CSSMarginDescriptors,
    CSSMarginRule,
    CSSMediaRule,
    CSSNamespaceRule,
    CSSPageDescriptors,
    CSSPageRule,
    CSSPositionTryDescriptors,
    CSSPositionTryRule,
    CSSPropertyRule,
    CSSRuleList,
    CSSScopeRule,
    CSSStartingStyleRule,
    CSSStyleProperties,
    CSSStyleRule,
    CSSStyleSheet,
    CSSSupportsRule,
    CSSViewTransitionRule,
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

install()
globalThis.document = { href: 'https://github.com/cdoublev/' }

describe('CSSStyleSheet', () => {
    it('creates a constructed CSSStyleSheet', () => {

        const media = 'all'
        const options = { baseURL: 'css', disabled: true, media }
        const styleSheet = new globalThis.CSSStyleSheet(options)

        // StyleSheet properties
        expect(styleSheet.disabled).toBeTruthy()
        expect(styleSheet.href).toBe(document.href)
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
    it('throws an error when trying to insert/delete a rule in a style sheet whose origin is not clean', () => {
        const styleSheet = createStyleSheet('', { originClean: false })
        expect(() => styleSheet.insertRule('style {}')).toThrow(ACCESS_THIRD_PARTY_STYLESHEET_ERROR)
        expect(() => styleSheet.deleteRule(0)).toThrow(ACCESS_THIRD_PARTY_STYLESHEET_ERROR)
    })
    it('throws an error when trying to insert/delete a rule while modifications on the style sheet are not allowed', () => {
        const styleSheet = new globalThis.CSSStyleSheet()
        styleSheet.replace('')
        expect(() => styleSheet.insertRule('style {}')).toThrow(UPDATE_LOCKED_STYLESHEET_ERROR)
        expect(() => styleSheet.deleteRule(0)).toThrow(UPDATE_LOCKED_STYLESHEET_ERROR)
    })
    it('throws an error when trying to insert an invalid rule according to the CSS syntax', () => {
        const styleSheet = createStyleSheet()
        expect(() => styleSheet.insertRule(' ')).toThrow(MISSING_RULE_ERROR)
        expect(() => styleSheet.insertRule('style;')).toThrow(INVALID_RULE_SYNTAX_ERROR)
        expect(() => styleSheet.insertRule('style {};')).toThrow(EXTRA_RULE_ERROR)
    })
    it('throws an error when trying to insert @import in a constructed style sheet', () => {
        const styleSheet = new globalThis.CSSStyleSheet()
        expect(() => styleSheet.insertRule('@import "./global.css";')).toThrow(INSERT_INVALID_IMPORT_ERROR)
    })
    it('throws an error when trying to insert/delete a rule at an index greater than the length of rules', () => {
        const styleSheet = createStyleSheet()
        expect(() => styleSheet.insertRule('style {}', 1)).toThrow(INVALID_RULE_INDEX_ERROR)
        expect(() => styleSheet.deleteRule(0)).toThrow(INVALID_RULE_INDEX_ERROR)
    })
    it('throws an error when trying to insert an invalid rule according to the CSS grammar', () => {
        const styleSheet = createStyleSheet()
        expect(() => styleSheet.insertRule('@charset "utf-8";')).toThrow(UNKNOWN_RULE_ERROR)
        expect(() => styleSheet.insertRule('@top-left {}')).toThrow(UNKNOWN_RULE_ERROR)
        expect(() => styleSheet.insertRule('@media screen;')).toThrow('Missing rule block')
    })
    it('throws an error when trying to insert any other rule than @import or @layer before @import', () => {
        const styleSheet = createStyleSheet('@import "./global.css";')
        expect(() => styleSheet.insertRule('@namespace svg "http://www.w3.org/2000/svg";'))
            .toThrow(INVALID_RULE_POSITION_ERROR)
        expect(() => styleSheet.insertRule('style {}'))
            .toThrow(INVALID_RULE_POSITION_ERROR)
    })
    it('throws an error when trying to insert any other rule than @import, @layer, @namespace, before @namespace', () => {
        const styleSheet = createStyleSheet('@namespace svg "http://www.w3.org/2000/svg";')
        expect(() => styleSheet.insertRule('style {}')).toThrow(INVALID_RULE_POSITION_ERROR)
    })
    it('throws an error when trying to insert @import after any other rule than @import or @layer', () => {
        const styleSheet = createStyleSheet('@namespace svg "http://www.w3.org/2000/svg";')
        expect(() => styleSheet.insertRule('@import "./global.css";', 1)).toThrow(INVALID_RULE_POSITION_ERROR)
    })
    it('throws an error when trying to insert @layer between @import and @import', () => {
        const styleSheet = createStyleSheet(`
            @import "./global.css";
            @import "./page.css";
        `)
        expect(() => styleSheet.insertRule('@layer base;', 1)).toThrow(INVALID_RULE_POSITION_ERROR)
    })
    it('throws an error when trying to insert @layer between @import and @namespace', () => {
        const styleSheet = createStyleSheet(`
            @import "./global.css";
            @namespace svg "http://www.w3.org/2000/svg";
        `)
        expect(() => styleSheet.insertRule('@layer base;', 1)).toThrow(INVALID_RULE_POSITION_ERROR)
    })
    it('throws an error when trying to insert @layer between @namespace and @namespace', () => {
        const styleSheet = createStyleSheet(`
            @namespace html "https://www.w3.org/1999/xhtml/";
            @namespace svg "http://www.w3.org/2000/svg";
        `)
        expect(() => styleSheet.insertRule('@layer base;', 1)).toThrow(INVALID_RULE_POSITION_ERROR)
    })
    it('throws an error when trying to insert @namespace if any other rule than @import, @layer, @namespace, exists', () => {
        const styleSheet = createStyleSheet('style {}')
        expect(() => styleSheet.insertRule('@namespace svg "http://www.w3.org/2000/svg";'))
            .toThrow(INVALID_NAMESPACE_STATE_ERROR)
    })
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
})
describe('CSSStyleSheet.replace(), CSSStyleSheet.replaceSync()', () => {
    it('throws an error when trying to replace rules of a non-constructed style sheet', () => {
        const styleSheet = createStyleSheet()
        expect(() => styleSheet.replaceSync('')).toThrow(UPDATE_LOCKED_STYLESHEET_ERROR)
    })
    it('throws an error when trying to replace rules concurrently', async () => {
        const styleSheet = new globalThis.CSSStyleSheet()
        styleSheet.replace('')
        return expect(styleSheet.replace('')).rejects.toMatchObject(UPDATE_LOCKED_STYLESHEET_ERROR)
    })
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
    it('ignores opening and ending HTML comment tokens', () => {

        const styleSheet = new globalThis.CSSStyleSheet()

        styleSheet.replaceSync('<!-- style {} -->')

        expect(styleSheet.cssRules).toHaveLength(1)
    })
    it('ignores import rules and invalid statements', () => {

        const styleSheet = new globalThis.CSSStyleSheet()

        styleSheet.replaceSync(`
            @import "./global.css";
            @namespace <bad-string-or-url>;
            style { color: green }
            color: red
        `)

        expect(CSSStyleRule.is(styleSheet.cssRules[0])).toBeTruthy()
    })
})

describe('CSSRuleList.item()', () => {
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

describe('CSS grammar', () => {
    // Style sheet contents
    it('ignores invalid contents at the top-level of the style sheet', () => {

        const { cssRules } = createStyleSheet(`
            /* invalid */
            @unknown {}
            @unknown;
            @namespace svg "http://www.w3.org/2000/svg" {}
            @media;
            style; {}
            @annotation {}
            @charset "utf-8";
            @top-left {}
            0% {}
            color: red; {}
            --custom:hover {}

            /* invalid before valid */
            @invalid } style {}
            style-1 { @layer reset }
            @invalid } @layer reset;
            style-2 { style }
            invalid } style {}
            style-3 { --custom:
        `)

        expect(cssRules).toHaveLength(3)
        expect(cssRules[0].cssText).toBe('style-1 {}')
        expect(cssRules[1].cssText).toBe('style-2 {}')
        expect(cssRules[2].cssText).toBe('style-3 { --custom: ; }')
    })
    it('ignores opening and ending HTML comment tokens at the top-level of the style sheet', () => {

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
    it('ignores @import following any other non-ignored rule than @layer', () => {

        const { cssRules } = createStyleSheet(`
            @namespace svg "http://www.w3.org/2000/svg";
            @import "./global.css";
        `)

        expect(cssRules).toHaveLength(1)
        expect(CSSNamespaceRule.is(cssRules[0])).toBeTruthy()
    })
    it('ignores @import following @layer interleaved after another @import', () => {

        const { cssRules } = createStyleSheet(`
            @import "./global.css";
            @layer reset;
            @import "./page.css";
        `)

        expect(cssRules).toHaveLength(2)
        expect(CSSLayerStatementRule.is(cssRules[1])).toBeTruthy()
    })
    it('does not ignore @import following @layer or ignored rules', () => {

        const { cssRules } = createStyleSheet(`
            @layer reset;
            @charset "utf-8";
            @namespace <bad-string-or-url>;
            @import "./global.css";
        `)

        expect(cssRules).toHaveLength(2)
        expect(CSSImportRule.is(cssRules[1])).toBeTruthy()
    })
    it('does not ignore @import following ignored rules interleaved after another @import', () => {

        const { cssRules } = createStyleSheet(`
            @import "./global.css";
            @charset "utf-8";
            @namespace <bad-string-or-url>;
            @layer <bad-ident>;
            @import "./page.css";
        `)

        expect(cssRules).toHaveLength(2)
        expect(CSSImportRule.is(cssRules[1])).toBeTruthy()
    })
    it('ignores @namespace following any other non-ignored rule than @import or @layer', () => {

        const { cssRules } = createStyleSheet(`
            style {}
            @namespace svg "http://www.w3.org/2000/svg";
        `)

        expect(cssRules).toHaveLength(1)
        expect(CSSStyleRule.is(cssRules[0])).toBeTruthy()
    })
    it('ignores @namespace following @layer interleaved after another @namespace', () => {

        const { cssRules } = createStyleSheet(`
            @namespace html "https://www.w3.org/1999/xhtml/";
            @layer reset;
            @namespace svg "http://www.w3.org/2000/svg";
        `)

        expect(cssRules).toHaveLength(2)
        expect(CSSLayerStatementRule.is(cssRules[1])).toBeTruthy()
    })
    it('ignores @namespace following @layer interleaved after @import', () => {

        const { cssRules } = createStyleSheet(`
            @import "./global.css";
            @layer reset;
            @namespace svg "http://www.w3.org/2000/svg";
        `)

        expect(cssRules).toHaveLength(2)
        expect(CSSLayerStatementRule.is(cssRules[1])).toBeTruthy()
    })
    it('does not ignore @namespace following @import, @layer, or ignored rule(s)', () => {

        const { cssRules } = createStyleSheet(`
            @layer reset;
            @import "./global.css";
            @charset "utf-8";
            @namespace svg "http://www.w3.org/2000/svg";
        `)

        expect(cssRules).toHaveLength(3)
        expect(CSSNamespaceRule.is(cssRules[2])).toBeTruthy()
    })
    it('does not ignore @namespace following ignored rules interleaved after another @namespace', () => {

        const { cssRules } = createStyleSheet(`
            @namespace html "https://www.w3.org/1999/xhtml/";
            @charset "utf-8";
            @import <bad-string-or-url>;
            @layer <bad-string-or-url>;
            @namespace svg "http://www.w3.org/2000/svg";
        `)

        expect(cssRules).toHaveLength(2)
        expect(CSSNamespaceRule.is(cssRules[1])).toBeTruthy()
    })
    // Rule contents
    it('ignores invalid contents in @color-profile', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @COLOR-PROFILE --profile {

                /* invalid */
                style {}
                color: red;
                rendering-itent: invalid;
                --custom: value;
                rendering-itent: var(--custom);
                src: url("profile-important.icc") !important;

                /* valid */
                SRC: url("profile.icc");
            }
        `)

        expect(rule.cssRules).toBeUndefined()
        expect(rule.style).toBeUndefined()
        expect(rule.color).toBeUndefined()
        expect(rule.renderingIntent).toBe('')
        expect(rule.src).toBe('url("profile.icc")')
    })
    it('ignores invalid contents in @container', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @CONTAINER layout (1px < width) {

                /* invalid */
                @unknown {}
                @unknown;
                @media;
                style;
                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @top-left {}
                0% {}
                color: red;
                --custom:hover {};

                /* valid */
                @color-profile --profile {}
                @container (1px < width) {}
                @counter-style counter {}
                @font-face {}
                @font-feature-values family {}
                @font-palette-values --palette { font-family: my-font }
                @function --name {}
                @keyframes animation {}
                @layer reset;
                @media {}
                @page {}
                @position-try --position {}
                @property --custom { syntax: "*"; inherits: false }
                @scope {}
                @starting-style {}
                @supports (color: green) {}
                @view-transition {}
                style {}
            }
        `)

        const valid = [
            CSSColorProfileRule,
            CSSContainerRule,
            CSSCounterStyleRule,
            CSSFontFaceRule,
            CSSFontFeatureValuesRule,
            CSSFontPaletteValuesRule,
            CSSFunctionRule,
            CSSKeyframesRule,
            CSSLayerStatementRule,
            CSSMediaRule,
            CSSPageRule,
            CSSPositionTryRule,
            CSSPropertyRule,
            CSSScopeRule,
            CSSStartingStyleRule,
            CSSSupportsRule,
            CSSViewTransitionRule,
            CSSStyleRule,
        ]

        expect(rule.cssRules).toHaveLength(valid.length)
        valid.forEach((CSSRule, index) => expect(CSSRule.is(rule.cssRules[index])).toBeTruthy())
        expect(rule.style).toBeUndefined()
    })
    it('ignores invalid contents in @counter-style', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @COUNTER-STYLE counter {

                /* invalid */
                style {}
                color: red;
                additive-symbols: 1 one, 2 two;
                range: 1 0;
                --custom: value;
                additive-symbols: var(--custom);
                system: cyclic !important;

                /* valid */
                SYSTEM: numeric;
            }
        `)

        expect(rule.cssRules).toBeUndefined()
        expect(rule.style).toBeUndefined()
        expect(rule.color).toBeUndefined()
        Object.keys(descriptors['@counter-style']).forEach(name =>
            expect(rule[cssPropertyToIDLAttribute(name)]).toBe(name === 'system' ? 'numeric' : ''))
    })
    it('ignores invalid contents in @font-face', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @FONT-FACE {

                /* invalid */
                style {}
                color: red;
                src: invalid;
                --custom: value;
                font-style: var(--custom);
                font-family: my-important-font !important;

                /* valid */
                FONT-FAMILY: my-font;
            }
        `)

        expect(rule.cssRules).toBeUndefined()
        expect(rule.style).toHaveLength(1)
        expect(rule.style.color).toBeUndefined()
        expect(rule.style.getPropertyValue('--custom')).toBe('')
        expect(rule.style.fontStyle).toBe('')
        expect(rule.style.fontFamily).toBe('my-font')
    })
    it('ignores invalid contents in @font-feature-values', () => {

        const { value: { rules } } = root.rules.find(rule => rule.name === '@font-feature-values')
        const { cssRules: [rule] } = createStyleSheet(`
            @FONT-FEATURE-VALUES family {

                /* valid */
                ${rules.map(rule => `${rule.name.toUpperCase()} {}`).join(' ')}
                FONT-DISPLAY: block;

                /* invalid */
                @unknown {}
                @unknown;
                @media;
                style;
                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @color-profile --profile {}
                @container (1px < width) {}
                @counter-style counter {}
                @font-face {}
                @font-feature-values family {}
                @font-palette-values --palette { font-family: my-font }
                @function --name {}
                @keyframes animation {}
                @layer reset;
                @media {}
                @page {}
                @position-try --position {}
                @property --custom { syntax: "*"; inherits: false }
                @top-left {}
                @scope {}
                @starting-style {}
                @supports (color: red) {}
                @view-transition {}
                0% {}
                style {}
                color: red;
                --custom: value;
                font-display: var(--custom);
                font-display: auto !important;
            }
        `)

        expect(rule.cssRules).toBeUndefined()
        expect(rule.style).toBeUndefined()
        expect(rule.fontFamily).toBe('family')
        rules.forEach(definition => {
            const child = rule[cssPropertyToIDLAttribute(definition.name.slice(1))]
            expect(CSSFontFeatureValuesMap.is(child)).toBeTruthy()
        })
    })
    it('ignores invalid contents in @font-palette-values', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @FONT-PALETTE-VALUES --palette {

                /* invalid */
                style {}
                color: red;
                base-palette: invalid;
                --custom: value;
                base-palette: var(--custom);
                font-family: my-important-font !important;

                /* valid */
                FONT-FAMILY: my-font;
            }
        `)

        expect(rule.cssRules).toBeUndefined()
        expect(rule.style).toBeUndefined()
        expect(rule.color).toBeUndefined()
        expect(rule.basePalette).toBe('')
        expect(rule.fontFamily).toBe('my-font')
    })
    it('ignores invalid contents in @function', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @FUNCTION --name {

                /* invalid */
                @unknown {}
                @unknown;
                @media;
                style;
                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @color-profile --profile {}
                @counter-style counter {}
                @font-face {}
                @font-feature-values family {}
                @font-palette-values --palette { font-family: my-font }
                @function --name {}
                @keyframes animation {}
                @layer reset;
                @page {}
                @position-try --position {}
                @property --custom { syntax: "*"; inherits: false }
                @top-left {}
                @scope {}
                @starting-style {}
                @view-transition {}
                0% {}
                style {}
                color: red;
                result: 0 !important;

                /* valid */
                @container (1px < width) {}
                @media {}
                @supports (color: green) {}
                --custom: {} var(--custom);
                RESULT: { var(--custom) };

                /* invalid */
                result: {} var(--custom);
            }
        `)

        const valid = [
            CSSContainerRule,
            CSSMediaRule,
            CSSSupportsRule,
        ]

        expect(rule.cssRules).toHaveLength(valid.length)
        valid.forEach((CSSRule, index) => expect(CSSRule.is(rule.cssRules[index])).toBeTruthy())
        // TODO: add support for `CSSNestedDeclarations`
        // expect(rule.cssText).toBe('@function --name { @container (1px < width) {} @media {} @supports (color: green) {} --custom: {} var(--custom); result: { var(--custom) } }')
    })
    it('ignores invalid contents in @keyframes', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @KEYFRAMES animation {

                /* invalid */
                @unknown {}
                @unknown;
                @media;
                style;
                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @color-profile --profile {}
                @container (1px < width) {}
                @counter-style counter {}
                @font-face {}
                @font-feature-values family {}
                @font-palette-values --palette { font-family: my-font }
                @function --name {}
                @keyframes animation {}
                @layer reset;
                @media {}
                @page {}
                @position-try --position {}
                @property --custom { syntax: "*"; inherits: false }
                @top-left {}
                @scope {}
                @starting-style {}
                @supports (color: red) {}
                @view-transition {}
                style {}
                color: red;
                --custom:hover {};

                /* valid */
                FROM {}
            }
        `)

        expect(rule.cssRules).toHaveLength(1)
        expect(CSSKeyframeRule.is(rule.cssRules[0])).toBeTruthy()
        expect(rule.style).toBeUndefined()
    })
    it('ignores invalid contents in @layer', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @LAYER {

                /* invalid */
                @unknown {}
                @unknown;
                @media;
                style;
                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @top-left {}
                0% {}
                color: red;
                --custom:hover {};

                /* valid */
                @color-profile --profile {}
                @container (1px < width) {}
                @counter-style counter {}
                @font-face {}
                @font-feature-values family {}
                @font-palette-values --palette { font-family: my-font }
                @function --name {}
                @keyframes animation {}
                @layer reset;
                @media {}
                @page {}
                @position-try --position {}
                @property --custom { syntax: "*"; inherits: false }
                @scope {}
                @starting-style {}
                @supports (color: green) {}
                @view-transition {}
                style {}
            }
        `)

        const valid = [
            CSSColorProfileRule,
            CSSContainerRule,
            CSSCounterStyleRule,
            CSSFontFaceRule,
            CSSFontFeatureValuesRule,
            CSSFontPaletteValuesRule,
            CSSFunctionRule,
            CSSKeyframesRule,
            CSSLayerStatementRule,
            CSSMediaRule,
            CSSPageRule,
            CSSPositionTryRule,
            CSSPropertyRule,
            CSSScopeRule,
            CSSStartingStyleRule,
            CSSSupportsRule,
            CSSViewTransitionRule,
            CSSStyleRule,
        ]

        expect(rule.cssRules).toHaveLength(valid.length)
        valid.forEach((CSSRule, index) => expect(CSSRule.is(rule.cssRules[index])).toBeTruthy())
        expect(rule.style).toBeUndefined()
    })
    it('ignores invalid contents in @media', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @MEDIA {

                /* invalid */
                @unknown {}
                @unknown;
                @media;
                style;
                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @top-left {}
                0% {}
                color: red;
                --custom:hover {};

                /* valid */
                @color-profile --profile {}
                @container (1px < width) {}
                @counter-style counter {}
                @font-face {}
                @font-feature-values family {}
                @font-palette-values --palette { font-family: my-font }
                @function --name {}
                @keyframes animation {}
                @layer reset;
                @media {}
                @page {}
                @position-try --position {}
                @property --custom { syntax: "*"; inherits: false }
                @scope {}
                @starting-style {}
                @supports (color: green) {}
                @view-transition {}
                style {}
            }
        `)

        const valid = [
            CSSColorProfileRule,
            CSSContainerRule,
            CSSCounterStyleRule,
            CSSFontFaceRule,
            CSSFontFeatureValuesRule,
            CSSFontPaletteValuesRule,
            CSSFunctionRule,
            CSSKeyframesRule,
            CSSLayerStatementRule,
            CSSMediaRule,
            CSSPageRule,
            CSSPositionTryRule,
            CSSPropertyRule,
            CSSScopeRule,
            CSSStartingStyleRule,
            CSSSupportsRule,
            CSSViewTransitionRule,
            CSSStyleRule,
        ]

        expect(rule.cssRules).toHaveLength(valid.length)
        valid.forEach((CSSRule, index) => expect(CSSRule.is(rule.cssRules[index])).toBeTruthy())
        expect(rule.style).toBeUndefined()
    })
    it('ignores invalid contents in @page', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @PAGE {

                /* invalid */
                @unknown {}
                @unknown;
                @media;
                style;
                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @color-profile --profile {}
                @container (1px < width) {}
                @counter-style counter {}
                @font-face {}
                @font-feature-values family {}
                @font-palette-values --palette { font-family: my-font }
                @function --name {}
                @keyframes animation {}
                @layer reset;
                @media {}
                @page {}
                @position-try --position {}
                @property --custom { syntax: "*"; inherits: false }
                @scope {}
                @starting-style {}
                @supports (color: red) {}
                @view-transition {}
                0% {}
                style {}
                top: 1px;
                margin-top: invalid;
                margin-bottom: {} var(--custom) !important;

                /* valid */
                @TOP-LEFT {}
                --custom: {} var(--custom);
                MARGIN-BOTTOM: { var(--custom) };
                margin-right: 1px !important;
                margin-right: 2px;
            }
        `)

        expect(rule.cssRules).toHaveLength(1)
        expect(CSSMarginRule.is(rule.cssRules[0])).toBeTruthy()
        expect(rule.style).toHaveLength(3)
        expect(rule.style.getPropertyValue('--custom')).toBe('{} var(--custom)')
        expect(rule.style.marginBottom).toBe('{var(--custom)}')
        expect(rule.style.marginRight).toBe('1px')
    })
    it('ignores invalid contents in @position-try', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @POSITION-TRY --position {

                /* invalid */
                style {}
                color: red;
                bottom: invalid;
                --custom: value;
                top: {} var(--custom) !important;

                /* valid */
                TOP: { var(--custom) }; */
            }
        `)

        expect(rule.cssRules).toBeUndefined()
        expect(rule.style).toHaveLength(1)
        expect(rule.style.top).toBe('{var(--custom)}')
    })
    it('ignores invalid contents in @property', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @PROPERTY --custom {

                /* valid */
                inherits: true;
                SYNTAX: "*";

                /* invalid */
                style {}
                color: red;
                inherits: invalid;
                --custom: value;
                inherits: var(--custom);
                syntax: "<number>" !important;
            }
        `)

        expect(rule.cssRules).toBeUndefined()
        expect(rule.style).toBeUndefined()
        expect(rule.color).toBeUndefined()
        expect(rule.initialValue).toBeNull()
        expect(rule.inherits).toBe('true')
        expect(rule.syntax).toBe('"*"')
    })
    it('ignores invalid contents in @scope', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @SCOPE {

                /* invalid */
                @unknown {}
                @unknown;
                @media;
                style;
                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @top-left {}
                0% {}
                color: red;
                --custom:hover {};

                /* valid */
                @color-profile --profile {}
                @container (1px < width) {}
                @counter-style counter {}
                @font-face {}
                @font-feature-values family {}
                @font-palette-values --palette { font-family: my-font }
                @function --name {}
                @keyframes animation {}
                @layer reset;
                @media {}
                @page {}
                @position-try --position {}
                @property --custom { syntax: "*"; inherits: false }
                @scope {}
                @starting-style {}
                @supports (color: green) {}
                @view-transition {}
                style {}
            }
        `)

        const valid = [
            CSSColorProfileRule,
            CSSContainerRule,
            CSSCounterStyleRule,
            CSSFontFaceRule,
            CSSFontFeatureValuesRule,
            CSSFontPaletteValuesRule,
            CSSFunctionRule,
            CSSKeyframesRule,
            CSSLayerStatementRule,
            CSSMediaRule,
            CSSPageRule,
            CSSPositionTryRule,
            CSSPropertyRule,
            CSSScopeRule,
            CSSStartingStyleRule,
            CSSSupportsRule,
            CSSViewTransitionRule,
            CSSStyleRule,
        ]

        expect(rule.cssRules).toHaveLength(valid.length)
        valid.forEach((CSSRule, index) => expect(CSSRule.is(rule.cssRules[index])).toBeTruthy())
        expect(rule.style).toBeUndefined()
    })
    it('ignores invalid contents in @starting-style', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @STARTING-STYLE {

                /* invalid */
                @unknown {}
                @unknown;
                @media;
                style;
                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @top-left {}
                0% {}
                color: red;
                --custom:hover {};

                /* valid */
                @color-profile --profile {}
                @container (1px < width) {}
                @counter-style counter {}
                @font-face {}
                @font-feature-values family {}
                @font-palette-values --palette { font-family: my-font }
                @function --name {}
                @keyframes animation {}
                @layer reset;
                @media {}
                @page {}
                @position-try --position {}
                @property --custom { syntax: "*"; inherits: false }
                @scope {}
                @starting-style {}
                @supports (color: green) {}
                @view-transition {}
                style {}
            }
        `)

        const valid = [
            CSSColorProfileRule,
            CSSContainerRule,
            CSSCounterStyleRule,
            CSSFontFaceRule,
            CSSFontFeatureValuesRule,
            CSSFontPaletteValuesRule,
            CSSFunctionRule,
            CSSKeyframesRule,
            CSSLayerStatementRule,
            CSSMediaRule,
            CSSPageRule,
            CSSPositionTryRule,
            CSSPropertyRule,
            CSSScopeRule,
            CSSStartingStyleRule,
            CSSSupportsRule,
            CSSViewTransitionRule,
            CSSStyleRule,
        ]

        expect(rule.cssRules).toHaveLength(valid.length)
        valid.forEach((CSSRule, index) => expect(CSSRule.is(rule.cssRules[index])).toBeTruthy())
        expect(rule.style).toBeUndefined()
    })
    it('ignores invalid contents in @supports', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @SUPPORTS (COLOR: green) {

                /* invalid */
                @unknown {}
                @unknown;
                @media;
                style;
                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @top-left {}
                0% {}
                color: red;
                --custom:hover {};

                /* valid */
                @color-profile --profile {}
                @container (1px < width) {}
                @counter-style counter {}
                @font-face {}
                @font-feature-values family {}
                @font-palette-values --palette { font-family: my-font }
                @function --name {}
                @keyframes animation {}
                @layer reset;
                @media {}
                @page {}
                @position-try --position {}
                @property --custom { syntax: "*"; inherits: false }
                @scope {}
                @starting-style {}
                @supports (color: green) {}
                @view-transition {}
                style {}
            }
        `)

        const valid = [
            CSSColorProfileRule,
            CSSContainerRule,
            CSSCounterStyleRule,
            CSSFontFaceRule,
            CSSFontFeatureValuesRule,
            CSSFontPaletteValuesRule,
            CSSFunctionRule,
            CSSKeyframesRule,
            CSSLayerStatementRule,
            CSSMediaRule,
            CSSPageRule,
            CSSPositionTryRule,
            CSSPropertyRule,
            CSSScopeRule,
            CSSStartingStyleRule,
            CSSSupportsRule,
            CSSViewTransitionRule,
            CSSStyleRule,
        ]

        expect(rule.cssRules).toHaveLength(valid.length)
        valid.forEach((CSSRule, index) => expect(CSSRule.is(rule.cssRules[index])).toBeTruthy())
        expect(rule.style).toBeUndefined()
    })
    it('ignores invalid contents in @view-transition', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @VIEW-TRANSITION {

                /* invalid */
                style {}
                color: red;
                navigation: invalid;
                --custom: value;
                navigation: var(--custom);
                types: important-type !important;

                /* valid */
                TYPES: type;
            }
        `)

        expect(rule.cssRules).toBeUndefined()
        expect(rule.style).toBeUndefined()
        expect(rule.color).toBeUndefined()
        expect(rule.navigation).toBeUndefined()
        expect(rule.types).toEqual(['type'])
    })
    it('ignores invalid contents in a rule nested in @font-feature-values', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            @font-feature-values family {
                @annotation {

                    /* invalid */
                    style {}
                    name: var(--custom);
                    name: invalid;
                    name: 0 !important;

                    /* valid */
                    name: 1;

                    /* invalid */
                    name: -1;
                    name: 1 2;
                }
                @character-variant {
                    name:   1 2;
                    name:  -1 2;
                    name: 100 1;
                    name: 1 2 3;
                }
                @ornaments {
                    name:  1;
                    name: -1;
                    name:  1 2;
                }
                @styleset {
                    name:  1 2 3 4 5;
                    name: -1 2 3 4 5;
                    name: 21 2 3 4 5;
                }
                @stylistic {
                    name:  1;
                    name: -1;
                    name:  1 2;
                }
                @swash {
                    name:  1;
                    name: -1;
                    name:  1 2;
                }
            }
        `)

        const valid = [
            ['annotation', 'name', [1]],
            ['characterVariant', 'name', [1, 2]],
            ['ornaments', 'name', [1]],
            ['styleset', 'name', [1, 2, 3, 4, 5]],
            ['stylistic', 'name', [1]],
            ['swash', 'name', [1]],
        ]

        valid.forEach(([type, descriptor, value]) => expect(rule[type].get(descriptor)).toEqual(value))
    })
    it('ignores invalid contents in a keyframe rule', () => {

        const { cssRules: [{ cssRules: [rule] }] } = createStyleSheet(`
            @keyframes animation {
                0% {

                    /* invalid */
                    style {}
                    animation-delay: 1s;
                    right: invalid;
                    top: {} var(--custom);
                    animation-timing-function: linear !important;

                    /* valid */
                    --custom: {} var(--custom);
                    bottom: { var(--custom) };
                    ANIMATION-TIMING-FUNCTION: ease;
                }
            }
        `)

        expect(rule.cssRules).toBeUndefined()
        expect(rule.style).toHaveLength(3)
        expect(rule.style.getPropertyValue('--custom')).toBe('{} var(--custom)')
        expect(rule.style.bottom).toBe('{var(--custom)}')
        expect(rule.style.animationTimingFunction).toBe('ease')
    })
    it('ignores invalid contents in a margin rule', () => {

        const { cssRules: [{ cssRules: [rule] }] } = createStyleSheet(`
            @page {
                @top-left {

                    /* invalid */
                    style {}
                    top: 1px;
                    margin-top: invalid;
                    margin-bottom: {} var(--custom) !important;

                    /* valid */
                    --custom: {} var(--custom);
                    MARGIN-BOTTOM: { var(--custom) };
                    margin-right: 1px !important;
                    margin-right: 2px;
                }
            }
        `)

        expect(rule.cssRules).toBeUndefined()
        expect(rule.style).toHaveLength(3)
        expect(rule.style.getPropertyValue('--custom')).toBe('{} var(--custom)')
        expect(rule.style.marginBottom).toBe('{var(--custom)}')
        expect(rule.style.marginRight).toBe('1px')
    })
    it('ignores invalid contents in a nested group rule', () => {

        const { cssRules: [{ cssRules: [rule] }] } = createStyleSheet(`
            style {
                @media {

                    /* invalid */
                    @unknown {}
                    @unknown;
                    @media;
                    style;
                    @charset "utf-8";
                    @import "./global.css";
                    @namespace svg "http://www.w3.org/2000/svg";
                    @annotation {}
                    @color-profile --profile {}
                    @counter-style counter {}
                    @font-face {}
                    @font-feature-values family {}
                    @font-palette-values --palette { font-family: my-font }
                    @function --name {}
                    @keyframes animation {}
                    @layer reset;
                    @page {}
                    @position-try --position {}
                    @property --custom { syntax: "*"; inherits: false }
                    @top-left {}
                    @view-transition {}
                    0% {}
                    top: invalid;
                    bottom: {} var(--custom) !important;

                    /* valid */
                    @container (1px < width) {}
                    @layer {}
                    @media {}
                    @scope {}
                    @starting-style {}
                    @supports (color: green) {}
                    style:hover {}
                    --custom:hover {};
                    BOTTOM: { var(--custom) };
                    right: 1px !important;
                    right: 2px;
                }
            }
        `)

        const valid = [
            CSSStyleRule,
            CSSContainerRule,
            CSSLayerBlockRule,
            CSSMediaRule,
            CSSScopeRule,
            CSSStartingStyleRule,
            CSSSupportsRule,
            CSSStyleRule,
        ]

        expect(rule.cssRules).toHaveLength(valid.length)
        valid.forEach((CSSRule, index) => expect(CSSRule.is(rule.cssRules[index])).toBeTruthy())
        expect(rule.cssRules[0].style).toHaveLength(3)
        expect(rule.cssRules[0].style.getPropertyValue('--custom')).toBe('hover {}')
        expect(rule.cssRules[0].style.bottom).toBe('{var(--custom)}')
        expect(rule.cssRules[0].style.right).toBe('1px')
        expect(rule.style).toBeUndefined()
    })
    it('ignores invalid contents in a nested style rule', () => {

        const { cssRules: [{ cssRules: [rule] }] } = createStyleSheet(`
            style {
                & {

                    /* invalid */
                    @unknown {}
                    @unknown;
                    @media;
                    style;
                    @charset "utf-8";
                    @import "./global.css";
                    @namespace svg "http://www.w3.org/2000/svg";
                    @annotation {}
                    @color-profile --profile {}
                    @counter-style counter {}
                    @font-face {}
                    @font-feature-values family {}
                    @font-palette-values --palette { font-family: my-font }
                    @function --name {}
                    @keyframes animation {}
                    @layer reset;
                    @page {}
                    @position-try --position {}
                    @property --custom { syntax: "*"; inherits: false }
                    @top-left {}
                    @view-transition {}
                    0% {}
                    top: invalid;
                    bottom: {} var(--custom) !important;

                    /* valid */
                    @container (1px < width) {}
                    @layer {}
                    @media {}
                    @scope {}
                    @starting-style {}
                    @supports (color: green) {}
                    style:hover {}
                    --custom:hover {};
                    BOTTOM: { var(--custom) };
                    right: 1px !important;
                    right: 2px;
                }
            }
        `)

        const valid = [
            CSSContainerRule,
            CSSLayerBlockRule,
            CSSMediaRule,
            CSSScopeRule,
            CSSStartingStyleRule,
            CSSSupportsRule,
            CSSStyleRule,
        ]

        expect(rule.cssRules).toHaveLength(valid.length)
        valid.forEach((CSSRule, index) => expect(CSSRule.is(rule.cssRules[index])).toBeTruthy())
        expect(rule.style).toHaveLength(3)
        expect(rule.style.getPropertyValue('--custom')).toBe('hover {}')
        expect(rule.style.bottom).toBe('{var(--custom)}')
        expect(rule.style.right).toBe('1px')
    })
    it('ignores invalid contents in a style rule', () => {

        const { cssRules: [rule] } = createStyleSheet(`
            style {

                /* invalid */
                @unknown {}
                @unknown;
                @media;
                style;
                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @color-profile --profile {}
                @counter-style counter {}
                @font-face {}
                @font-feature-values family {}
                @font-palette-values --palette { font-family: my-font }
                @function --name {}
                @keyframes animation {}
                @layer reset;
                @page {}
                @position-try --position {}
                @property --custom { syntax: "*"; inherits: false }
                @top-left {}
                @view-transition {}
                0% {}
                top: invalid;
                bottom: {} var(--custom) !important;

                /* valid */
                @container (1px < width) {}
                @layer {}
                @media {}
                @scope {}
                @starting-style {}
                @supports (color: green) {}
                style:hover {}
                --custom:hover {};
                BOTTOM: { var(--custom) };
                right: 1px !important;
                right: 2px;
            }
        `)

        const valid = [
            CSSContainerRule,
            CSSLayerBlockRule,
            CSSMediaRule,
            CSSScopeRule,
            CSSStartingStyleRule,
            CSSSupportsRule,
            CSSStyleRule,
        ]

        expect(rule.cssRules).toHaveLength(valid.length)
        valid.forEach((CSSRule, index) => expect(CSSRule.is(rule.cssRules[index])).toBeTruthy())
        expect(rule.style).toHaveLength(3)
        expect(rule.style.getPropertyValue('--custom')).toBe('hover {}')
        expect(rule.style.bottom).toBe('{var(--custom)}')
        expect(rule.style.right).toBe('1px')
    })
    it('ignores @font-palette-values missing a declaration for font-family', () => {
        expect(createStyleSheet('@font-palette-values --palette {}').cssRules).toHaveLength(0)
    })
    it('ignores @property missing a declaration for inherits', () => {
        expect(createStyleSheet('@property --custom { syntax: "*"; initial-value: 1; }').cssRules).toHaveLength(0)
    })
    it('ignores @property missing a declaration for initial-value', () => {

        const invalid = [
            // Invalid syntax
            [''],
            ['initial'],
            ['initial', '*'],
            ['var(--custom)'],
            ['1'],
            // Computationally dependent
            ['1em'],
            ['smaller', 'smaller'],
            ['calc(1px + 1em)'],
        ]
        const valid = [
            // Empty value
            ['', '*'],
            [' ', '*'],
            // Computationally independent
            ['1in', '<length>'],
            ['small', 'small'],
        ]
        const cases = [invalid, valid]

        cases.forEach((group, index) =>
            group.forEach(([value, syntax = '<length>']) => {
                const styleSheet = createStyleSheet(`
                    @property --custom {
                        syntax: "${syntax}";
                        initial-value: ${value};
                        inherits: true;
                    }
                `)
                expect(styleSheet.cssRules).toHaveLength(index)
            }))
    })
    it('ignores @property missing a declaration for syntax', () => {

        expect(createStyleSheet('@property --custom { inherits: true; initial-value: 1; }').cssRules).toHaveLength(0)

        const invalid = [
            [''],
            // Invalid CSS type
            ['<'],
            // Unsupported CSS type
            ['<any-value>'],
            ['<LENGTH>', '1px'],
            // Invalid <custom-ident>
            ['initial'],
            ['default'],
            ['1identifier'],
            ['!identifier'],
            ['-1identifier'],
            ['-!identifier'],
            ['\\\n'],
            ['-\\\n'],
            // Unsupported CSS value definition syntaxes
            ['a b'],
            ['a && b', 'a b'],
            ['a || b', 'a b'],
            [','],
            ["'/'", '/'],
            ['fn()', 'fn()'],
            ['a?'],
            ['a{2}', 'a a'],
            ['a*'],
            ['a+#', 'a'],
            ['a#?'],
            // Pre-muliplied CSS type
            ['<transform-list>+', 'translateX(1px)'],
        ]
        const valid = [
            ['  *  ', 'a'],
            ['  a+  ', 'a'],
            ['a#', 'a'],
            ['a | b', 'b'],
            ['<length>', '1px'],
            ['<length>', 'calc(1px)'],
            ['<length>+', '1px'],
            ['<length>#', '1px'],
        ]
        const cases = [invalid, valid]

        cases.forEach((group, index) =>
            group.forEach(([syntax, value = syntax]) => {
                const styleSheet = createStyleSheet(`
                    @property --custom {
                        syntax: "${syntax}";
                        initial-value: ${value};
                        inherits: true;
                    }
                `)
                expect(styleSheet.cssRules).toHaveLength(index)
            }))
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

        const { selectorText, style } = styleRule

        expect(selectorText).toBe('svg|rect')
        expect(style.fill).toBe('green')
    })
    // Legacy rules
    it('parses a vendor prefixed rule', () => {
        const { cssRules: [keyframesRule] } = createStyleSheet('@-webkit-keyframes animation {}')
        expect(CSSKeyframesRule.is(keyframesRule)).toBeTruthy()
        expect(keyframesRule.cssText).toBe('@keyframes animation {}')
    })
})

describe('CSSColorProfileRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@color-profile --profile { src: url("profile.icc") }')
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@color-profile --profile { src: url("profile.icc"); }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSColorProfileRule
        expect(rule.components).toBe('')
        expect(rule.name).toBe('--profile')
        expect(rule.src).toBe('url("profile.icc")')
        expect(rule.renderingIntent).toBe('')
    })
})
describe('CSSContainerRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@container layout (1px < width) { style {} }')
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@container layout (1px < width) { style {} }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule
        expect(CSSRuleList.is(rule.cssRules)).toBeTruthy()

        // CSSConditionRule
        expect(rule.conditionText).toBe('layout (1px < width)')

        // CSSContainerRule
        expect(rule.containerName).toBe('layout')
        expect(rule.containerQuery).toBe('(1px < width)')
    })
})
describe('CSSCounterStyleRule', () => {
    it('has all properties', () => {

        let styleSheet = createStyleSheet('@counter-style counter { system: fixed 1; speak-as: auto }')
        let { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@counter-style counter { speak-as: auto; system: fixed; }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSCounterStyleRule
        expect(rule.name).toBe('counter')
        rule.name = 'decimal'
        expect(rule.name).toBe('counter')
        rule.name = ''
        expect(rule.name).toBe('counter')
        rule.name = '\n'
        expect(rule.name).toBe('\\a')
        rule.speakAs = 'none'
        expect(rule.speakAs).toBe('auto')

        // Fixed
        rule.system = 'fixed 2'
        expect(rule.system).toBe('fixed')
        rule.symbols = 'one two'
        expect(rule.symbols).toBe('one two')
        rule.system = 'fixed 2'
        expect(rule.system).toBe('fixed 2')
        rule.symbols = 'one two'
        expect(rule.symbols).toBe('one two')
        rule.additiveSymbols = '1 one'
        expect(rule.additiveSymbols).toBe('')
        rule.system = 'numeric'
        rule.system = 'additive'
        rule.system = 'extends decimal'
        expect(rule.system).toBe('fixed 2')

        // Cyclic (or symbolic)
        styleSheet = createStyleSheet('@counter-style counter {}')
        rule = styleSheet.cssRules[0]
        rule.system = 'cyclic'
        expect(rule.system).toBe('')
        rule.symbols = 'one'
        expect(rule.symbols).toBe('one')
        rule.system = 'cyclic'
        expect(rule.system).toBe('cyclic')
        rule.symbols = 'one two'
        expect(rule.symbols).toBe('one two')
        rule.system = 'numeric'
        rule.system = 'fixed'
        rule.system = 'extends decimal'
        expect(rule.system).toBe('cyclic')

        // Numeric (or alphabetic)
        styleSheet = createStyleSheet('@counter-style counter {}')
        rule = styleSheet.cssRules[0]
        rule.system = 'numeric'
        expect(rule.system).toBe('')
        rule.symbols = 'one'
        expect(rule.symbols).toBe('one')
        rule.system = 'numeric'
        expect(rule.system).toBe('')
        rule.symbols = 'one two'
        expect(rule.symbols).toBe('one two')
        rule.system = 'numeric'
        expect(rule.system).toBe('numeric')
        rule.symbols = 'one'
        expect(rule.symbols).toBe('one two')
        rule.symbols = 'one two three'
        expect(rule.symbols).toBe('one two three')
        rule.system = 'cyclic'
        rule.system = 'fixed'
        rule.system = 'extends decimal'
        expect(rule.system).toBe('numeric')

        // Additive
        styleSheet = createStyleSheet('@counter-style counter {}')
        rule = styleSheet.cssRules[0]
        rule.system = 'additive'
        expect(rule.system).toBe('')
        rule.additiveSymbols = '1 one'
        expect(rule.additiveSymbols).toBe('1 one')
        rule.system = 'additive'
        expect(rule.system).toBe('additive')
        rule.additiveSymbols = '2 two, 1 one'
        expect(rule.additiveSymbols).toBe('2 two, 1 one')
        rule.symbols = 'one two'
        expect(rule.symbols).toBe('')
        rule.system = 'cyclic'
        rule.system = 'fixed'
        rule.system = 'extends decimal'
        expect(rule.system).toBe('additive')

        // Extended counter style
        styleSheet = createStyleSheet('@counter-style counter { symbols: one; additive-symbols: 1 one }')
        rule = styleSheet.cssRules[0]
        rule.system = 'extends decimal'
        expect(rule.system).toBe('')
        styleSheet = createStyleSheet('@counter-style counter {}')
        rule = styleSheet.cssRules[0]
        rule.system = 'extends decimal'
        expect(rule.system).toBe('extends decimal')
        rule.symbols = 'one'
        expect(rule.symbols).toBe('')
        rule.additiveSymbols = '1 one'
        expect(rule.additiveSymbols).toBe('')
        rule.system = 'extends circle'
        expect(rule.system).toBe('extends circle')
        rule.system = 'extends none'
        rule.system = 'cyclic'
        rule.system = 'additive'
        rule.system = 'fixed'
        expect(rule.system).toBe('extends circle')
    })
})
describe('CSSFontFaceRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@font-face { src: url(serif.woff2) }')
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@font-face { src: url("serif.woff2"); }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSFontFaceRule
        expect(CSSFontFaceDescriptors.is(rule.style)).toBeTruthy()
        expect(rule.style).toHaveLength(1)
        rule.style.removeProperty('src')
        expect(rule.cssText).toBe('@font-face {}')
    })
})
describe('CSSFontFeatureValuesRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@font-feature-values family { font-display: block }')
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@font-feature-values family { font-display: block; }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSFontFeatureValuesRule
        expect(rule.fontFamily).toBe('family')

        // CSSFontFeatureValuesMap
        rule.styleset.set('double-W', 0)
        expect(rule.styleset.get('double-W')).toEqual([0])
        expect(rule.cssText).toBe('@font-feature-values family { font-display: block; @styleset { double-W: 0; } }')
        rule.styleset.set('double-W', [0, 1])
        expect(rule.styleset.get('double-W')).toEqual([0, 1])
        expect(rule.cssText).toBe('@font-feature-values family { font-display: block; @styleset { double-W: 0 1; } }')
        rule.styleset.delete('double-W')
        expect(rule.cssText).toBe('@font-feature-values family { font-display: block; }')
        expect(() => rule.annotation.set('boxed', [0, 1])).toThrow(INVALID_FONT_FEATURE_VALUE_ERROR)
        expect(() => rule.annotation.set('boxed', [-1])).toThrow(INVALID_FONT_FEATURE_VALUE_ERROR)
        expect(() => rule.characterVariant.set('alpha-2', [0, 1, 2])).toThrow(INVALID_FONT_FEATURE_VALUE_ERROR)
        expect(() => rule.characterVariant.set('alpha-2', [-1, 0])).toThrow(INVALID_FONT_FEATURE_VALUE_ERROR)
        expect(() => rule.characterVariant.set('alpha-2', [100, 0])).toThrow(INVALID_FONT_FEATURE_VALUE_ERROR)
        expect(() => rule.ornaments.set('bullet', [0, 1])).toThrow(INVALID_FONT_FEATURE_VALUE_ERROR)
        expect(() => rule.ornaments.set('bullet', [-1])).toThrow(INVALID_FONT_FEATURE_VALUE_ERROR)
        expect(() => rule.styleset.set('double-W', [-1, 0])).toThrow(INVALID_FONT_FEATURE_VALUE_ERROR)
        expect(() => rule.styleset.set('double-W', [21, 0])).toThrow(INVALID_FONT_FEATURE_VALUE_ERROR)
        expect(() => rule.stylistic.set('alt-g', [0, 1])).toThrow(INVALID_FONT_FEATURE_VALUE_ERROR)
        expect(() => rule.stylistic.set('alt-g', [-1])).toThrow(INVALID_FONT_FEATURE_VALUE_ERROR)
        expect(() => rule.swash.set('cool', [0, 1])).toThrow(INVALID_FONT_FEATURE_VALUE_ERROR)
        expect(() => rule.swash.set('cool', [-1])).toThrow(INVALID_FONT_FEATURE_VALUE_ERROR)
    })
})
describe('CSSFontPaletteValuesRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet(`
            @font-palette-values --palette {
                font-family: my-font;
                base-palette: light;
                override-colors: 0 green;
            }
        `)
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@font-palette-values --palette { base-palette: light; font-family: my-font; override-colors: 0 green; }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSFontPaletteValuesRule
        expect(rule.fontFamily).toBe('my-font')
        expect(rule.basePalette).toBe('light')
        expect(rule.overrideColors).toBe('0 green')
    })
})
describe('CSSImportRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@import "./global.css";', { media: 'all' })
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@import url("./global.css");')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSImportRule
        expect(rule.href).toBe('./global.css')
        // TODO: implement fetching a style sheet referenced by `@import`
        // expect(CSSStyleSheet.is(rule.styleSheet)).toBeTruthy()
        // expect(rule.styleSheet.ownerRule).toBe(rule)
        // expect(rule.styleSheet.media).toBe(rule.media)
        // expect(rule.styleSheet.parentStyleSheet).toBe(rule.parentStyleSheet)
    })
})
describe('CSSKeyframeRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@keyframes animation { to { color: green } }')
        const { cssRules: [parentRule] } = styleSheet
        const { cssRules: [rule] } = parentRule

        // CSSRule
        expect(rule.cssText).toBe('100% { color: green; }')
        expect(rule.parentRule).toBe(parentRule)
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSKeyframeRule
        expect(rule.keyText).toBe('100%')
        rule.keyText = 'from'
        expect(rule.keyText).toBe('0%')
        expect(rule.cssText).toBe('0% { color: green; }')
        expect(() => rule.keyText = '101%').toThrow(SET_INVALID_KEY_TEXT_ERROR)
        expect(CSSKeyframeProperties.is(rule.style)).toBeTruthy()
        rule.style.color = ''
        expect(rule.cssText).toBe('0% {}')
    })
})
describe('CSSKeyframesRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@keyframes animation { to {} }')
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@keyframes animation { 100% {} }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSKeyframesRule
        expect(CSSRuleList.is(rule.cssRules)).toBeTruthy()
        expect(rule).toHaveLength(1)
        expect(rule[0]).toBe(rule.cssRules[0])
        expect(rule.name).toBe('animation')
        rule.name = '\n'
        expect(rule.name).toBe('\\a')
        expect(rule.cssText).toBe('@keyframes \\a { 100% {} }')
        expect(() => rule.name = '').toThrow(SET_INVALID_NAME_ERROR)
    })
    it('has all methods', () => {

        const { cssRules: [rule] } = createStyleSheet('@keyframes animation {}')
        const { cssRules: keyframes } = rule

        expect(keyframes).toHaveLength(0)

        rule.appendRule('to { color: orange }')

        expect(rule.findRule('to')).toBe(keyframes[0])
        expect(rule.findRule('100%')).toBe(keyframes[0])
        expect(keyframes).toHaveLength(1)
        expect(keyframes[0].style.color).toBe('orange')
        expect(() => rule.appendRule('invalid')).toThrow(INVALID_RULE_SYNTAX_ERROR)

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

        const styleSheet = createStyleSheet('@layer reset { style {} }')
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@layer reset { style {} }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule
        expect(CSSRuleList.is(rule.cssRules)).toBeTruthy()

        // CSSLayerBlockRule
        expect(rule.name).toBe('reset')
    })
})
describe('CSSLayerStatementRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@layer reset;')
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@layer reset;')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSLayerStatementRule
        expect(rule.nameList).toBe('reset')
    })
})
describe('CSSMarginRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@page { @top-left { color: green } }')
        const { cssRules: [parentRule] } = styleSheet
        const { cssRules: [rule] } = parentRule

        // CSSRule
        expect(rule.cssText).toBe('@top-left { color: green; }')
        expect(rule.parentRule).toBe(parentRule)
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSMarginRule
        expect(rule.name).toBe('top-left')
        expect(CSSMarginDescriptors.is(rule.style)).toBeTruthy()
        rule.style.color = ''
        expect(rule.cssText).toBe('@top-left {}')
    })
})
describe('CSSMediaRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@media all { style {} }')
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@media all { style {} }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule
        expect(CSSRuleList.is(rule.cssRules)).toBeTruthy()

        // CSSConditionRule
        expect(rule.conditionText).toBe('all')

        // CSSMediaRule
        expect(MediaList.is(rule.media)).toBeTruthy()
    })
})
describe('CSSNamespaceRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@namespace svg "http://www.w3.org/2000/svg";')
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@namespace svg url("http://www.w3.org/2000/svg");')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSNamespaceRule
        expect(rule.namespaceURI).toBe('http://www.w3.org/2000/svg')
        expect(rule.prefix).toBe('svg')
    })
})
describe('CSSPageRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@page intro { color: green; @top-left {} }')
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@page intro { color: green; @top-left {} }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule
        expect(CSSRuleList.is(rule.cssRules)).toBeTruthy()

        // CSSPageRule
        expect(rule.selectorText).toBe('intro')
        rule.selectorText = 'outro'
        expect(rule.selectorText).toBe('outro')
        expect(CSSPageDescriptors.is(rule.style)).toBeTruthy()
    })
})
describe('CSSPositionTryRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@position-try --position { top: 1px } }')
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@position-try --position { top: 1px; }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSPositionTryRule
        expect(rule.name).toBe('--position')
        expect(CSSPositionTryDescriptors.is(rule.style)).toBeTruthy()
        rule.style.top = ''
        expect(rule.cssText).toBe('@position-try --position {}')
    })
})
describe('CSSPropertyRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet(`
            @property --custom {
                syntax: "*";
                inherits: true;
            }
        `)
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@property --custom { syntax: "*"; inherits: true; }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSPropertyRule
        expect(rule.name).toBe('--custom')
        expect(rule.syntax).toBe('"*"')
        expect(rule.inherits).toBe('true')
        expect(rule.initialValue).toBeNull()
    })
})
describe('CSSScopeRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@scope (start) to (end) { style { child {} } }')
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@scope (start) to (end) { :scope style { & child {} } }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule
        expect(CSSRuleList.is(rule.cssRules)).toBeTruthy()

        // CSSLayerBlockRule
        expect(rule.end).toBe('end')
        expect(rule.start).toBe('start')
    })
})
describe('CSSStartingStyleRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@starting-style { style {} }')
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@starting-style { style {} }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule
        expect(CSSRuleList.is(rule.cssRules)).toBeTruthy()
    })
})
describe('CSSStyleRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet(`
            style {
                color: red;
                & {
                    color: green;
                }
            }
        `)
        const { cssRules: [styleRule] } = styleSheet
        const { cssRules: [nestedStyleRule] } = styleRule

        // CSSRule
        expect(styleRule.cssText).toBe('style { color: red; & { color: green; } }')
        expect(nestedStyleRule.cssText).toBe('& { color: green; }')
        expect(styleRule.parentRule).toBeNull()
        expect(nestedStyleRule.parentRule).toBe(styleRule)
        expect(styleRule.parentStyleSheet).toBe(styleSheet)
        expect(nestedStyleRule.parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule
        expect(CSSRuleList.is(styleRule.cssRules)).toBeTruthy()
        expect(CSSRuleList.is(nestedStyleRule.cssRules)).toBeTruthy()

        // CSSStyleRule
        expect(styleRule.selectorText).toBe('style')
        expect(nestedStyleRule.selectorText).toBe('&')
        expect(CSSStyleProperties.is(styleRule.style)).toBeTruthy()
        expect(CSSStyleProperties.is(nestedStyleRule.style)).toBeTruthy()
        expect(styleRule.style).toHaveLength(1)
        expect(nestedStyleRule.style).toHaveLength(1)

        styleRule.selectorText = 'parent'
        nestedStyleRule.selectorText = 'child'

        expect(styleRule.selectorText).toBe('parent')
        expect(nestedStyleRule.selectorText).toBe('& child')

        styleRule.style.color = ''
        nestedStyleRule.style.color = ''

        expect(styleRule.cssText).toBe('parent { & child {} }')
    })
    it('has all methods', () => {

        const { cssRules: [rule] } = createStyleSheet('style {}')
        const { cssRules } = rule

        expect(cssRules).toHaveLength(0)

        rule.insertRule('@media screen {}')

        expect(() => rule.insertRule('style {}', -1)).toThrow(INVALID_RULE_INDEX_ERROR)
        expect(() => rule.insertRule(' ')).toThrow(MISSING_RULE_ERROR)
        expect(() => rule.insertRule('style {};')).toThrow(EXTRA_RULE_ERROR)
        expect(() => rule.insertRule('style;')).toThrow(INVALID_RULE_SYNTAX_ERROR)
        expect(() => rule.insertRule('@charset "utf-8";')).toThrow(UNKNOWN_RULE_ERROR)
        expect(() => rule.insertRule('@import "./global.css";')).toThrow(UNKNOWN_RULE_ERROR)
        expect(() => rule.insertRule('@media screen;')).toThrow('Missing rule block')

        rule.insertRule('@media print {}')

        expect(cssRules).toHaveLength(2)

        rule.insertRule('@media all {}', 2)
        const [mediaRule] = cssRules

        expect(cssRules).toHaveLength(3)
        expect(mediaRule.conditionText).toBe('print')
        expect(cssRules[1].conditionText).toBe('screen')
        expect(cssRules[2].conditionText).toBe('all')

        rule.deleteRule(0)

        expect(cssRules).toHaveLength(2)
        expect(mediaRule.parentRule).toBeNull()
        expect(cssRules[0].conditionText).toBe('screen')
        expect(cssRules[1].conditionText).toBe('all')
    })
})
describe('CSSSupportsRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@supports (color: green) { style {} }')
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@supports (color: green) { style {} }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule
        expect(CSSRuleList.is(rule.cssRules)).toBeTruthy()

        // CSSConditionRule
        expect(rule.conditionText).toBe('(color: green)')
    })
})
describe('CSSViewTransitionRule', () => {
    it('has all properties', () => {

        const styleSheet = createStyleSheet('@view-transition { navigation: none; types: type-1 type-2 }')
        const { cssRules: [rule] } = styleSheet

        // CSSRule
        expect(rule.cssText).toBe('@view-transition { navigation: none; types: type-1 type-2; }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSViewTransitionRule
        expect(rule.navigation).toBe('none')
        expect(rule.types).toEqual(['type-1', 'type-2'])
        expect(() => rule.types.push('type-3')).toThrow(TypeError)
    })
})

/**
 * The following does not conform to the specification, which expects the setter
 * to do nothing and requires implementing it in each CSSRule child classes.
 *
 * @see {@link https://github.com/w3c/csswg-drafts/issues/8778}
 */
it('throws an error when setting CSSRule.cssText', () => {
    const { cssRules: [cssRule] } = createStyleSheet('style {}')
    expect(() => cssRule.cssText = 'override {}').toThrow()
})
