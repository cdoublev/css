
import {
    ACCESS_THIRD_PARTY_STYLESHEET_ERROR,
    EXTRA_RULE_ERROR,
    INSERT_INVALID_IMPORT_ERROR,
    INVALID_FONT_FEATURE_VALUE_ERROR,
    INVALID_NAMESPACE_STATE_ERROR,
    INVALID_RULE_ERROR,
    INVALID_RULE_INDEX_ERROR,
    INVALID_RULE_POSITION_ERROR,
    MISSING_RULE_ERROR,
    SET_INVALID_KEYFRAMES_NAME_ERROR,
    SET_INVALID_KEYFRAME_SELECTOR_ERROR,
    UPDATE_LOCKED_STYLESHEET_ERROR,
} from '../lib/error.js'
import {
    CSSFontFaceDescriptors,
    CSSFunctionDescriptors,
    CSSImportRule,
    CSSKeyframeProperties,
    CSSKeyframesRule,
    CSSLayerStatementRule,
    CSSMarginDescriptors,
    CSSNamespaceRule,
    CSSPageDescriptors,
    CSSPositionTryDescriptors,
    CSSRuleList,
    CSSStyleProperties,
    CSSStyleRule,
    CSSStyleSheet,
    MediaList,
} from '../lib/cssom/index.js'
import { install } from '@cdoublev/css'

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

/**
 * @param {string} text
 * @returns {string}
 *
 * It transforms `text` to lowercase, unfolds first-valid() argument, removes
 * newlines.
 *
 * This abstraction is not great but probably the best way to avoid increasing
 * code complexity in tests, until first-valid() can be replaced with another
 * <whole-value> substitution that do not require to be resolved at parse time.
 */
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/first-valid\(([^)]+)\)/g, '$1')
        .replace(/(\n|  +)+/g, ' ')
        .trim()
}

install()
globalThis.document = {
    _registeredPropertySet: [],
    href: 'https://github.com/cdoublev/',
}

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
    it('creates a constructed CSSStyleSheet with a MediaList', () => {

        const { media } = new globalThis.CSSStyleSheet({ media: 'all' })
        const styleSheet = new globalThis.CSSStyleSheet({ media })

        expect(styleSheet.media).not.toBe(media)
        expect(styleSheet.media.mediaText).toBe(media.mediaText)

        media.mediaText = '(width)'
        expect(media.mediaText).toBe('(width)')
        expect(styleSheet.media.mediaText).toBe('all')
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
        expect(CSSRuleList.is(styleSheet.rules)).toBeTruthy()
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
        const styleSheet = new globalThis.CSSStyleSheet
        styleSheet.replace('')
        expect(() => styleSheet.insertRule('style {}')).toThrow(UPDATE_LOCKED_STYLESHEET_ERROR)
        expect(() => styleSheet.deleteRule(0)).toThrow(UPDATE_LOCKED_STYLESHEET_ERROR)
    })
    it('throws an error when trying to insert an invalid rule according to the CSS grammar', () => {
        const styleSheet = createStyleSheet()
        expect(() => styleSheet.insertRule(' ')).toThrow(MISSING_RULE_ERROR)
        expect(() => styleSheet.insertRule('@charset "utf-8";')).toThrow(INVALID_RULE_ERROR)
        expect(() => styleSheet.insertRule('@top-left {}')).toThrow(INVALID_RULE_ERROR)
        expect(() => styleSheet.insertRule('@media;')).toThrow(INVALID_RULE_ERROR)
        expect(() => styleSheet.insertRule('style;')).toThrow(INVALID_RULE_ERROR)
        expect(() => styleSheet.insertRule('style {};')).toThrow(EXTRA_RULE_ERROR)
    })
    it('throws an error when trying to insert @import in a constructed style sheet', () => {
        const styleSheet = new globalThis.CSSStyleSheet
        expect(() => styleSheet.insertRule('@import "./global.css";')).toThrow(INSERT_INVALID_IMPORT_ERROR)
    })
    it('throws an error when trying to insert/delete a rule at an index greater than the length of rules', () => {
        const styleSheet = createStyleSheet()
        expect(() => styleSheet.insertRule('style {}', 1)).toThrow(INVALID_RULE_INDEX_ERROR)
        expect(() => styleSheet.deleteRule(0)).toThrow(INVALID_RULE_INDEX_ERROR)
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

        const namespaceRule = cssRules[0]

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
        const styleSheet = new globalThis.CSSStyleSheet
        styleSheet.replace('')
        return expect(styleSheet.replace('')).rejects.toMatchObject(UPDATE_LOCKED_STYLESHEET_ERROR)
    })
    it('replaces a rule asynchronously/synchronously', async () => {

        const styleSheet = new globalThis.CSSStyleSheet
        const { cssRules } = styleSheet

        expect(await styleSheet.replace('style { color: orange }')).toBe(styleSheet)
        expect(cssRules).toHaveLength(1)
        expect(cssRules[0].style.color).toBe('orange')

        styleSheet.replaceSync('style { color: green }')

        expect(cssRules).toHaveLength(1)
        expect(cssRules[0].style.color).toBe('green')
    })
    it('ignores opening and ending HTML comment tokens', () => {

        const styleSheet = new globalThis.CSSStyleSheet

        styleSheet.replaceSync('<!-- style {} -->')

        expect(styleSheet.cssRules).toHaveLength(1)
    })
    it('ignores import rules and invalid statements', () => {

        const styleSheet = new globalThis.CSSStyleSheet

        styleSheet.replaceSync(`
            @import "./global.css";
            @namespace <bad-string-or-url>;
            style { color: green }
            color: red;
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

describe('CSSColorProfileRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@color-profile --name { src: url("profile.icc") }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@color-profile --name { src: url("profile.icc"); }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSColorProfileRule
        expect(rule.name).toBe('--name')
        expect(rule.src).toBe('url("profile.icc")')
    })
})
describe('CSSContainerRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@container name { style {} }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@container name { style {} }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule
        expect(CSSRuleList.is(rule.cssRules)).toBeTruthy()

        // CSSConditionRule
        expect(rule.conditionText).toBe('name')
    })
})
describe('CSSCounterStyleRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@counter-style name { system: fixed; speak-as: auto }')
        let rule = styleSheet.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@counter-style name { speak-as: auto; system: fixed; }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSCounterStyleRule
        //   https://github.com/w3c/csswg-drafts/issues/9363
        rule.name = ''
        expect(rule.name).toBe('name')
        rule.name = '\n'
        expect(rule.name).toBe('\\a')
        //   Priority
        rule.system = 'fixed !important'
        //   Cascade or element-dependent substitution
        rule.system = 'initial'
        rule.system = 'var(--custom)'
        rule.system = 'attr(name)'
        //   Dependency-free pending substitution
        rule.system = 'env(name)'
        expect(rule.system).toBe('fixed')
        //   system: symbolic (default)
        rule = createStyleSheet('@counter-style name {}').cssRules[0]
        rule.additiveSymbols = '1 a'
        expect(rule.additiveSymbols).toBe('')
        rule.symbols = 'a'
        expect(rule.symbols).toBe('a')
        rule.system = 'fixed'
        rule.system = 'extends decimal'
        expect(rule.system).toBe('')
        rule.system = 'symbolic'
        expect(rule.system).toBe('symbolic')
        //   system: fixed
        rule = createStyleSheet('@counter-style name { system: fixed }').cssRules[0]
        rule.additiveSymbols = '1 a'
        expect(rule.additiveSymbols).toBe('')
        rule.symbols = 'a'
        expect(rule.symbols).toBe('a')
        rule.system = 'symbolic'
        rule.system = 'extends decimal'
        expect(rule.system).toBe('fixed')
        rule.system = 'first-valid(fixed 2)'
        expect(rule.system).toBe('fixed 2')
        rule.system = 'fixed calc(2)'
        expect(rule.system).toBe('fixed calc(2)')
        //   system: numeric (and alphabetic)
        rule = createStyleSheet('@counter-style name { system: numeric }').cssRules[0]
        rule.additiveSymbols = '1 a, 2 b'
        expect(rule.additiveSymbols).toBe('')
        rule.symbols = 'a'
        expect(rule.symbols).toBe('')
        rule.symbols = 'a b'
        expect(rule.symbols).toBe('a b')
        rule.system = 'symbolic'
        rule.system = 'extends decimal'
        expect(rule.system).toBe('numeric')
        // system: additive
        rule = createStyleSheet('@counter-style name { system: additive }').cssRules[0]
        rule.symbols = 'a'
        expect(rule.symbols).toBe('')
        rule.additiveSymbols = '1 a, 1 b'
        expect(rule.additiveSymbols).toBe('')
        rule.additiveSymbols = '1 a, 2 b'
        expect(rule.additiveSymbols).toBe('')
        rule.additiveSymbols = '1 a'
        expect(rule.additiveSymbols).toBe('1 a')
        rule.system = 'symbolic'
        expect(rule.system).toBe('additive')
        // system: extends <counter-style-name>
        rule = createStyleSheet('@counter-style name { system: extends decimal }').cssRules[0]
        rule.additiveSymbols = '1 a'
        expect(rule.additiveSymbols).toBe('')
        rule.symbols = 'a'
        expect(rule.symbols).toBe('')
        rule.system = 'symbolic'
        expect(rule.system).toBe('extends decimal')
        rule.system = 'extends disc'
        expect(rule.system).toBe('extends disc')
    })
})
describe('CSSFontFaceRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@font-face { src: url(serif.woff2) }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@font-face { src: url("serif.woff2"); }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSFontFaceRule
        expect(CSSFontFaceDescriptors.is(rule.style)).toBeTruthy()
    })
})
describe('CSSFontFeatureValuesRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet(`
            @font-feature-values name {
                @annotation { name: 1 }
                @annotation { name: 2 }
                font-display: block;
            }`)
        const rule = styleSheet.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@font-feature-values name { font-display: block; @annotation { name: 2; } }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSFontFeatureValuesRule
        expect(rule.fontFamily).toBe('name')

        // CSSFontFeatureValuesMap
        rule.styleset.set('double-W', 0)
        expect(rule.styleset.get('double-W')).toEqual([0])
        expect(rule.cssText).toBe('@font-feature-values name { font-display: block; @annotation { name: 2; } @styleset { double-W: 0; } }')
        rule.styleset.set('double-W', [0, 1])
        expect(rule.styleset.get('double-W')).toEqual([0, 1])
        expect(rule.cssText).toBe('@font-feature-values name { font-display: block; @annotation { name: 2; } @styleset { double-W: 0 1; } }')
        rule.styleset.delete('double-W')
        expect(rule.cssText).toBe('@font-feature-values name { font-display: block; @annotation { name: 2; } }')
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
    test('properties', () => {

        const styleSheet = createStyleSheet(`
            @font-palette-values --name {
                font-family: name;
                base-palette: light;
                override-colors: 0 green;
            }
        `)
        const rule = styleSheet.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@font-palette-values --name { base-palette: light; font-family: name; override-colors: 0 green; }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSFontPaletteValuesRule
        expect(rule.name).toBe('--name')
        expect(rule.fontFamily).toBe('name')
        expect(rule.basePalette).toBe('light')
        expect(rule.overrideColors).toBe('0 green')
    })
})
describe('CSSFunctionRule, CSSFunctionDeclarations', () => {
    test('properties', () => {

        const parameters = [
            ['--param\\ eter-1'],
            ['--parameter-2 type(*)', '--parameter-2'],
            ['--parameter-3 <number>'],
            ['--parameter-4 <number>: 1'],
            ['--parameter-5 type(<number>)', '--parameter-5 <number>'],
            ['--parameter-6 type(<number> | <percentage>)'],
            ['--parameter-7 type("<number>")', '--parameter-7 <number>'],
        ]
        const styleSheet = createStyleSheet(`
            @function --name(${parameters.map(([input]) => input).join(', ')}) returns type(*) {
                @media {}
                result: 1;
            }
        `)
        const rule = styleSheet.cssRules[0]
        const declarations = rule.cssRules[1]

        // CSSRule
        expect(rule.cssText).toBe(`@function --name(${parameters.map(([input, expected = input]) => expected).join(', ')}) { @media {} result: 1; }`)
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)
        expect(declarations.cssText).toBe('result: 1;')
        expect(declarations.parentRule).toBe(rule)
        expect(declarations.parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule
        expect(CSSRuleList.is(rule.cssRules)).toBeTruthy()

        // CSSFunctionRule
        expect(rule.name).toBe('--name')
        expect(rule.returnType).toBe('*')

        // CSSFunctionDeclarations
        expect(CSSFunctionDescriptors.is(declarations.style)).toBeTruthy()
    })
    test('methods', () => {

        const parameters = [
            '--param\\ eter-1',
            '--parameter-2 type(*)',
            '--parameter-3 <number>',
            '--parameter-4 <number>: 1',
            '--parameter-5 type(<number>)',
            '--parameter-6 type(<number> | <percentage>)',
        ]
        const rule = createStyleSheet(`@function --name(${parameters.join(', ')}) {}`).cssRules[0]

        expect(rule.getParameters()).toEqual([
            { defaultValue: null, name: '--param\\ eter-1', type: '*' },
            { defaultValue: null, name: '--parameter-2', type: '*' },
            { defaultValue: null, name: '--parameter-3', type: '<number>' },
            { defaultValue: '1', name: '--parameter-4', type: '<number>' },
            { defaultValue: null, name: '--parameter-5', type: '<number>' },
            { defaultValue: null, name: '--parameter-6', type: '<number> | <percentage>' },
        ])
    })
})
describe('CSSImportRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@import "./global.css";', { media: 'all' })
        const rule = styleSheet.cssRules[0]

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
    test('properties', () => {

        const styleSheet = createStyleSheet('@keyframes name { to { color: green } }')
        const parentRule = styleSheet.cssRules[0]
        const rule = parentRule.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('100% { color: green; }')
        expect(rule.parentRule).toBe(parentRule)
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSKeyframeRule
        expect(rule.keyText).toBe('100%')
        rule.keyText = 'from'
        expect(rule.keyText).toBe('0%')
        expect(rule.cssText).toBe('0% { color: green; }')
        expect(() => rule.keyText = '101%').toThrow(SET_INVALID_KEYFRAME_SELECTOR_ERROR)
        expect(CSSKeyframeProperties.is(rule.style)).toBeTruthy()
    })
})
describe('CSSKeyframesRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@keyframes name { 100% {} }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@keyframes name { 100% {} }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSKeyframesRule
        expect(CSSRuleList.is(rule.cssRules)).toBeTruthy()
        expect(rule).toHaveLength(1)
        expect(rule[0]).toBe(rule.cssRules[0])
        expect(rule.name).toBe('name')
        rule.name = '\n'
        expect(rule.name).toBe('\\a')
        expect(rule.cssText).toBe('@keyframes \\a { 100% {} }')
        expect(() => rule.name = '').toThrow(SET_INVALID_KEYFRAMES_NAME_ERROR)
    })
    test('methods', () => {

        const rule = createStyleSheet('@keyframes name {}').cssRules[0]
        const keyframes = rule.cssRules

        expect(keyframes).toHaveLength(0)

        rule.appendRule('to { color: orange }')

        expect(rule.findRule('to')).toBe(keyframes[0])
        expect(rule.findRule('100%')).toBe(keyframes[0])
        expect(keyframes).toHaveLength(1)
        expect(keyframes[0].style.color).toBe('orange')
        expect(() => rule.appendRule('invalid')).toThrow(INVALID_RULE_ERROR)

        rule.appendRule('to { color: green }')
        const to = keyframes[1]

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
    test('properties', () => {

        const styleSheet = createStyleSheet('@layer name { style {} }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@layer name { style {} }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule
        expect(CSSRuleList.is(rule.cssRules)).toBeTruthy()

        // CSSLayerBlockRule
        expect(rule.name).toBe('name')
    })
})
describe('CSSLayerStatementRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@layer name;')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@layer name;')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSLayerStatementRule
        expect(rule.nameList).toBe('name')
    })
})
describe('CSSMarginRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@page { @top-left { color: green } }')
        const parentRule = styleSheet.cssRules[0]
        const rule = parentRule.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@top-left { color: green; }')
        expect(rule.parentRule).toBe(parentRule)
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSMarginRule
        expect(rule.name).toBe('top-left')
        expect(CSSMarginDescriptors.is(rule.style)).toBeTruthy()
    })
})
describe('CSSMediaRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@media all { style {} }')
        const rule = styleSheet.cssRules[0]

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
        expect(rule.matches).toBeTruthy()
    })
})
describe('CSSNamespaceRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@namespace svg "http://www.w3.org/2000/svg";')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@namespace svg url("http://www.w3.org/2000/svg");')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSNamespaceRule
        expect(rule.namespaceURI).toBe('http://www.w3.org/2000/svg')
        expect(rule.prefix).toBe('svg')
    })
})
describe('CSSNestedDeclarations', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet(`
            style {
                @container name { color: green }
                @layer { color: green }
                @media { color: green }
                @scope { color: green }
                @starting-style { color: green }
                @supports (color: green) { color: green }
            }
        `)

        for (const parentRule of styleSheet.cssRules[0].cssRules) {

            const rule = parentRule.cssRules[0]

            // CSSRule
            expect(rule.cssText).toBe('color: green;')
            expect(rule.parentRule).toBe(parentRule)
            expect(rule.parentStyleSheet).toBe(styleSheet)

            // CSSNestedDeclarations
            expect(CSSStyleProperties.is(rule.style)).toBeTruthy()
        }
    })
})
describe('CSSPageRule, CSSPageDeclarations', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet(`
            @page intro {
                @top-left {}
                color: green;
            }
        `)
        const rule = styleSheet.cssRules[0]
        const declarations = rule.cssRules[1]

        // CSSRule
        expect(rule.cssText).toBe('@page intro { @top-left {} color: green; }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)
        expect(declarations.cssText).toBe('color: green;')
        expect(declarations.parentRule).toBe(rule)
        expect(declarations.parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule
        expect(CSSRuleList.is(rule.cssRules)).toBeTruthy()

        // CSSPageRule
        expect(rule.selectorText).toBe('intro')
        rule.selectorText = 'outro'
        expect(rule.selectorText).toBe('outro')
        expect(CSSPageDescriptors.is(rule.style)).toBeTruthy()

        // CSSPageDeclarations
        expect(CSSPageDescriptors.is(declarations.style)).toBeTruthy()
    })
})
describe('CSSPositionTryRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@position-try --name { top: 1px } }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@position-try --name { top: 1px; }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSPositionTryRule
        expect(rule.name).toBe('--name')
        expect(CSSPositionTryDescriptors.is(rule.style)).toBeTruthy()
    })
})
describe('CSSPropertyRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@property --name { syntax: "*"; inherits: true }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@property --name { syntax: "*"; inherits: true; }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSPropertyRule
        expect(rule.name).toBe('--name')
        expect(rule.syntax).toBe('"*"')
        expect(rule.inherits).toBe('true')
    })
})
describe('CSSScopeRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet(`
            @scope (start) to (end) {
                style {}
                color: green;
            }
        `)
        const rule = styleSheet.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@scope (start) to (end) { style {} color: green; }')
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
    test('properties', () => {

        const styleSheet = createStyleSheet('@starting-style { style {} }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@starting-style { style {} }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule
        expect(CSSRuleList.is(rule.cssRules)).toBeTruthy()
    })
})
describe('CSSStyleRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet(`
            style {
                @scope {
                    scoped {
                        nested {}
                    }
                }
                nested {}
                color: green;
            }
        `)
        const styleRule = styleSheet.cssRules[0]
        const { cssRules: [scopeRule, nestedStyleRule] } = styleRule
        const scopedStyleRule = scopeRule.cssRules[0]

        // CSSRule
        expect(styleRule.cssText).toBe('style { @scope { scoped { & nested {} } } & nested {} color: green; }')
        expect(scopedStyleRule.cssText).toBe('scoped { & nested {} }')
        expect(nestedStyleRule.cssText).toBe('& nested {}')
        expect(styleRule.parentRule).toBeNull()
        expect(scopedStyleRule.parentRule).toBe(scopeRule)
        expect(nestedStyleRule.parentRule).toBe(styleRule)
        expect(styleRule.parentStyleSheet).toBe(styleSheet)
        expect(scopedStyleRule.parentStyleSheet).toBe(styleSheet)
        expect(nestedStyleRule.parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule
        expect(CSSRuleList.is(styleRule.cssRules)).toBeTruthy()
        expect(CSSRuleList.is(scopedStyleRule.cssRules)).toBeTruthy()
        expect(CSSRuleList.is(nestedStyleRule.cssRules)).toBeTruthy()

        // CSSStyleRule
        expect(styleRule.selectorText).toBe('style')
        expect(scopedStyleRule.selectorText).toBe('scoped')
        expect(nestedStyleRule.selectorText).toBe('& nested')
        styleRule.selectorText = 'parent'
        scopedStyleRule.selectorText = 'scoped-parent'
        nestedStyleRule.selectorText = 'child'
        expect(styleRule.selectorText).toBe('parent')
        expect(scopedStyleRule.selectorText).toBe('scoped-parent')
        expect(nestedStyleRule.selectorText).toBe('& child')
        expect(CSSStyleProperties.is(styleRule.style)).toBeTruthy()
        expect(CSSStyleProperties.is(scopedStyleRule.style)).toBeTruthy()
        expect(CSSStyleProperties.is(nestedStyleRule.style)).toBeTruthy()
    })
    test('methods', () => {

        const { cssRules: [rule] } = createStyleSheet('style {}')
        const { cssRules } = rule

        expect(cssRules).toHaveLength(0)

        rule.insertRule('@media screen {}')

        expect(() => rule.insertRule('style {}', -1)).toThrow(INVALID_RULE_INDEX_ERROR)
        expect(() => rule.insertRule(' ')).toThrow(MISSING_RULE_ERROR)
        expect(() => rule.insertRule('style {};')).toThrow(EXTRA_RULE_ERROR)
        expect(() => rule.insertRule('style;')).toThrow(INVALID_RULE_ERROR)
        expect(() => rule.insertRule('@charset "utf-8";')).toThrow(INVALID_RULE_ERROR)
        expect(() => rule.insertRule('@import "./global.css";')).toThrow(INVALID_RULE_ERROR)
        expect(() => rule.insertRule('@media screen;')).toThrow(INVALID_RULE_ERROR)

        rule.insertRule('@media print {}')

        expect(cssRules).toHaveLength(2)

        rule.insertRule('@media all {}', 2)
        const mediaRule = cssRules[0]

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
    test('properties', () => {

        const styleSheet = createStyleSheet('@supports (color: green) { style {} }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        expect(rule.cssText).toBe('@supports (color: green) { style {} }')
        expect(rule.parentRule).toBeNull()
        expect(rule.parentStyleSheet).toBe(styleSheet)

        // CSSGroupingRule
        expect(CSSRuleList.is(rule.cssRules)).toBeTruthy()

        // CSSConditionRule
        expect(rule.conditionText).toBe('(color: green)')

        // CSSSupportsRule
        expect(rule.matches).toBeTruthy()
    })
})
describe('CSSViewTransitionRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@view-transition { navigation: none; types: type-1 type-2 }')
        const rule = styleSheet.cssRules[0]

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
 * @see {@link https://github.com/w3c/csswg-drafts/issues/8778}
 *
 * The specification wants the setter of CSSRule.cssText to do nothing, which
 * requires implementing it in every CSSRule subclass, since a property cannot
 * be set when its setter is defined on the parent class and its getter on the
 * subclass: in strict mode, this throws an error.
 *
 * Instead, CSSRule.cssText is defined as read-only, which produces the expected
 * behavior, but throws an error in strict mode.
 */
test('Setting CSSRule.cssText does nothing', () => {
    const rule = createStyleSheet('style {}').cssRules[0]
    expect(() => rule.cssText = 'override {}').toThrow()
})

describe('CSS grammar - syntax', () => {
    test('at-rule start with <at-keyword-token> and only end with ; or {} block', () => {
        const { cssRules } = createStyleSheet(`
            @media ; {}
            style-1 {}
            @media } style {}
            style-2 {}
        `)
        expect(cssRules).toHaveLength(3)
        expect(cssRules[0].cssText).toBe('style-1 {}')
        expect(cssRules[1].cssText).toBe('@media not all {}')
        expect(cssRules[2].cssText).toBe('style-2 {}')
    })
    test('qualified rules start with anything but <at-keyword-token> and only end with {} block', () => {
        const { cssRules } = createStyleSheet(`
            color: red ; style {}
            style-1 {}
            color: red } style {}
            style-2 {}
        `)
        expect(cssRules).toHaveLength(2)
        expect(cssRules[0].cssText).toBe('style-1 {}')
        expect(cssRules[1].cssText).toBe('style-2 {}')
    })
    test('top-level rule starting like a custom property declaration', () => {
        const { cssRules } = createStyleSheet(`
            --custom:hover {}
            --custom: hover {}
            --custom :hover {}
            --custom a:hover {}
        `)
        expect(cssRules).toHaveLength(1)
        expect(cssRules[0].cssText).toBe('--custom a:hover {}')
    })
    test('} breaks consuming a declaration and a nested rule prelude', () => {
        const { cssRules } = createStyleSheet(`
            style-1 {
                --custom: };
            } {}
            style-2 {
                style } {}
                style-3 {
                    style (}) {};
                    color: green;
                    @media } {}
                style-4 {}
            } {}
            @font-face {
                src: }, local("monospace");
            }
        `)
        expect(cssRules).toHaveLength(5)
        expect(cssRules[0].cssText).toBe('style-1 { --custom: ; }')
        expect(cssRules[1].cssText).toBe('style-2 {}')
        expect(cssRules[2].cssText).toBe('style-3 { color: green; }')
        expect(cssRules[3].cssText).toBe('style-4 {}')
        expect(cssRules[4].cssText).toBe('@font-face {}')
    })
    test('; breaks consuming a declaration and a nested rule prelude', () => {
        const { cssRules } = createStyleSheet(`
            style {
                color;
                color: orange;
                style: ; color: green; {}
                style (; color: red;) {}
                @media ; {}
            }
            @font-face {
                src: ;, local("serif");
            }
        `)
        expect(cssRules).toHaveLength(2)
        expect(cssRules[0].cssText).toBe('style { color: green; }')
        expect(cssRules[1].cssText).toBe('@font-face {}')
    })
    test('! does not break consuming a declaration value', () => {
        // but is interpreted as a bad token if not followed by `important`
        // or if followed by `important` followed by other tokens than `;` or `}`.
        const styleSheet = createStyleSheet(`
            style {
                color: var(--custom) !;
                color: !important var(--custom);
                --custom: ! important;
            }
            @font-face {
                src: !, !important, local("serif");
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('style { --custom:  !important; }')
        expect(styleSheet.cssRules[1].cssText).toBe('@font-face { src: local("serif"); }')
    })
    test('! and ; are not interpreted as bad tokens when nested in a block or function', () => {

        const values = ['fn(!)', '[!]', '{!}', 'fn(;)', '[;]', '{;}']
        const declarations = values.map((value, index) => `--custom-${index}: ${value}`).join('; ')
        const { cssRules } = createStyleSheet(`
            style { ${declarations}; }
            @media (;) {}
        `)

        expect(cssRules[0].cssText).toBe(`style { ${declarations}; }`)
        expect(cssRules[1].cssText).toBe('@media (;) {}')
    })
    test('positioned {} block in a declaration value not for a custom property', () => {
        // It is always consumed as a rule
        const { cssRules } = createStyleSheet(`
            style {
                color: ({} 1) var(--custom) (1 {});
                color: {} var(--custom);
                color:var(--custom) {}
                color: ] style {}
                style:hover {}
            }
            @font-face {
                src: local("serif");
                src: {}, local("monospace");
            }
        `)
        expect(cssRules[0].cssText).toBe('style { color: ({} 1) var(--custom) (1 {}); & style:hover {} }')
        expect(cssRules[1].cssText).toBe('@font-face { src: local("serif"); }')
    })
    test('positioned {} block in a declaration value for a custom property', () => {
        // It is never consumed as a qualified rule in a nested context
        const styleSheet = createStyleSheet(`
            style {
                --custom: 1 {} 1;
                --custom: ] style {}
                style:hover {}
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('style { --custom: 1 {} 1; }')
    })
    test('unclosed rule, declaration, function', () => {
        let styleSheet = createStyleSheet('style { & { color: var(--custom) fn(')
        expect(styleSheet.cssRules[0].cssText).toBe('style { & { color: var(--custom) fn(); } }')
        styleSheet = createStyleSheet('style { & { color: var(--custom, fn(')
        expect(styleSheet.cssRules[0].cssText).toBe('style { & { color: var(--custom, fn()); } }')
    })
})

describe('CSS grammar - semantic', () => {
    // Style sheet contents
    test('top-level - invalid contents', () => {
        const styleSheet = createStyleSheet(`
            @charset "utf-8";
            @namespace svg "http://www.w3.org/2000/svg" {}
            @media;
            @annotation {}
            @top-left {}
            0% {}
        `)
        expect(styleSheet.cssRules).toHaveLength(0)
    })
    test('top-level - opening and ending HTML comment tokens', () => {

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
    test('top-level - ignored @import following any other non-ignored rule than @layer', () => {

        const { cssRules } = createStyleSheet(`
            @namespace svg "http://www.w3.org/2000/svg";
            @import "./global.css";
        `)

        expect(cssRules).toHaveLength(1)
        expect(CSSNamespaceRule.is(cssRules[0])).toBeTruthy()
    })
    test('top-level - ignored @import following @layer interleaved after another @import', () => {

        const { cssRules } = createStyleSheet(`
            @import "./global.css";
            @layer name;
            @import "./page.css";
        `)

        expect(cssRules).toHaveLength(2)
        expect(CSSLayerStatementRule.is(cssRules[1])).toBeTruthy()
    })
    test('top-level - @import following @layer or ignored rules', () => {

        const { cssRules } = createStyleSheet(`
            @layer name;
            @charset "utf-8";
            @namespace <bad-string-or-url>;
            @import "./global.css";
        `)

        expect(cssRules).toHaveLength(2)
        expect(CSSImportRule.is(cssRules[1])).toBeTruthy()
    })
    test('top-level - @import following ignored rules interleaved after another @import', () => {

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
    test('top-level - ignored @namespace following any other non-ignored rule than @import or @layer', () => {

        const { cssRules } = createStyleSheet(`
            style {}
            @namespace svg "http://www.w3.org/2000/svg";
        `)

        expect(cssRules).toHaveLength(1)
        expect(CSSStyleRule.is(cssRules[0])).toBeTruthy()
    })
    test('top-level - ignored @namespace following @layer interleaved after another @namespace', () => {

        const { cssRules } = createStyleSheet(`
            @namespace html "https://www.w3.org/1999/xhtml/";
            @layer name;
            @namespace svg "http://www.w3.org/2000/svg";
        `)

        expect(cssRules).toHaveLength(2)
        expect(CSSLayerStatementRule.is(cssRules[1])).toBeTruthy()
    })
    test('top-level - ignored @namespace following @layer interleaved after @import', () => {

        const { cssRules } = createStyleSheet(`
            @import "./global.css";
            @layer name;
            @namespace svg "http://www.w3.org/2000/svg";
        `)

        expect(cssRules).toHaveLength(2)
        expect(CSSLayerStatementRule.is(cssRules[1])).toBeTruthy()
    })
    test('top-level - @namespace following @import, @layer, or ignored rule(s)', () => {

        const { cssRules } = createStyleSheet(`
            @layer name;
            @import "./global.css";
            @charset "utf-8";
            @namespace svg "http://www.w3.org/2000/svg";
        `)

        expect(cssRules).toHaveLength(3)
        expect(CSSNamespaceRule.is(cssRules[2])).toBeTruthy()
    })
    test('top-level - @namespace following ignored rules interleaved after another @namespace', () => {

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
    test('@color-profile - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @color-profile --name {

                style {}
                color: red;

                components: none;
                components: var(--custom);
                components: attr(name);
                components: toggle(name);
                components: name !important;

                src: url("profile.icc");
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@color-profile --name { src: url("profile.icc"); }')
    })
    test('@color-profile - valid block contents', () => {
        const input = `
            @COLOR-PROFILE --name {
                COMPONENTS: {env(name)};
                src: first-valid(url("profile.icc"));
            }
        `
        const styleSheet = createStyleSheet(input)
        expect(styleSheet.cssRules[0].cssText).toBe(normalizeText(input))
    })
    test('@container - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @container name {

                @media;

                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @top-left {}
                0% {}

                color: red;

                @media {}
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@container name { @media {} }')
    })
    test('@container - valid block contents', () => {
        const rules = [
            '@color-profile --name {}',
            '@container name {}',
            '@counter-style name {}',
            '@font-face {}',
            '@font-feature-values name {}',
            '@font-palette-values --name { font-family: name; }',
            '@function --name() {}',
            '@keyframes name {}',
            '@layer name;',
            '@media {}',
            '@page {}',
            '@position-try --name {}',
            '@property --name { syntax: "*"; inherits: false; }',
            '@scope {}',
            '@starting-style {}',
            '@supports (color: green) {}',
            '@view-transition {}',
            'style:hover {}',
        ]
        const input = `@CONTAINER name { ${rules.join(' ')} }`
        const styleSheet = createStyleSheet(input)
        expect(styleSheet.cssRules[0].cssText).toBe(input.toLowerCase())
    })
    test('@counter-style - invalid block contents', () => {
        const { cssRules: [rule1, rule2] } = createStyleSheet(`
            @counter-style name-one {

                style {}
                color: red;

                pad: initial;
                pad: var(--custom);
                pad: attr(name);
                pad: toggle(symbolic);
                pad: calc-interpolate(0, 0: 1) ' ';
                pad: sibling-count() ' ';
                pad: 1 ' ' !important;
                range: 1 0;

                system: numeric;
            }
            @counter-style name-two {
                system: numeric;
                additive-symbols: 1 one, 2 two;
            }
        `)
        expect(rule1.cssText).toBe('@counter-style name-one { system: numeric; }')
        expect(rule2.cssText).toBe('@counter-style name-two { system: numeric; }')
    })
    test('@counter-style - valid block contents', () => {
        const input = `
            @COUNTER-STYLE name {
                PAD: {env(name)};
                system: first-valid(numeric);
            }
        `
        const styleSheet = createStyleSheet(input)
        expect(styleSheet.cssRules[0].cssText).toBe(normalizeText(input))
    })
    test('@font-face - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @font-face {

                style {}
                color: red;

                font-weight: initial;
                size-adjust: initial;
                font-weight: var(--custom);
                size-adjust: var(--custom);
                font-weight: attr(name);
                size-adjust: attr(name);
                font-weight: toggle(1);
                size-adjust: toggle(1%);
                font-weight: calc-interpolate(0, 0: 1);
                size-adjust: calc-interpolate(0, 0: 1%);
                font-weight: sibling-count();
                size-adjust: calc(1% * sibling-count());
                font-weight: 1 !important;
                size-adjust: 1px !important;

                font-family: name;
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@font-face { font-family: name; }')
    })
    test('@font-face - valid block contents', () => {
        const declarations = [
            'FONT-WEIGHT: {env(name)}',
            'SIZE-ADJUST: {env(name)}',
            'font-weight: first-valid(1)',
            'size-adjust: first-valid(1%)',
        ]
        declarations.forEach(declaration => {
            const input = `@FONT-FACE { ${declaration}; }`
            const styleSheet = createStyleSheet(input)
            expect(styleSheet.cssRules[0].cssText).toBe(normalizeText(input))
        })
    })
    test('@font-feature-values - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @font-feature-values name {

                @media;

                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @color-profile --name {}
                @container name {}
                @counter-style name {}
                @font-face {}
                @font-feature-values name {}
                @font-palette-values --name { font-family: name; }
                @function --name() {}
                @keyframes name {}
                @layer name;
                @media {}
                @page {}
                @position-try --name {}
                @property --name { syntax: "*"; inherits: false; }
                @scope {}
                @starting-style {}
                @supports (color: red) {}
                @top-left {}
                @view-transition {}
                style {}
                0% {}

                color: red;

                font-display: initial;
                font-display: var(--custom);
                font-display: attr(name);
                font-display: toggle(name);
                font-display: swap !important;

                font-display: block;
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@font-feature-values name { font-display: block; }')
    })
    test('@font-feature-values - valid block contents', () => {

        const rules = [
            '@annotation { boxed: 0; }',
            '@character-variant { alpha-2: 0 1; }',
            '@ornaments { bullet: 0; }',
            '@styleset { double-W: 0 1 2; }',
            '@stylistic { alt-g: 0; }',
            '@swash { cool: 0; }',
        ]
        const input = `@FONT-FEATURE-VALUES name { ${rules.join(' ')} }`
        const styleSheet = createStyleSheet(input)
        expect(styleSheet.cssRules[0].cssText).toBe(input.toLowerCase())

        const declarations = [
            'FONT-DISPLAY: {env(name)}',
            'font-display: first-valid(block)',
        ]
        declarations.forEach(declaration => {
            const input = `@FONT-FEATURE-VALUES name { ${declaration}; }`
            const styleSheet = createStyleSheet(input)
            expect(styleSheet.cssRules[0].cssText).toBe(normalizeText(input))
        })
    })
    test('@font-palette-values - missing declaration for font-family', () => {
        expect(createStyleSheet('@font-palette-values --name {}').cssRules).toHaveLength(0)
    })
    test('@font-palette-values - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @font-palette-values --name {

                style {}
                color: red;
                override-colors: 0 color-interpolate(0, 0: red);
                override-colors: 0 currentcolor;
                override-colors: 0 AccentColor;
                override-colors: 0 light-dark(red, red);
                override-colors: 0 contrast-color(red);
                override-colors: 0 device-cmyk(0 0 0 0);

                base-palette: initial;
                base-palette: var(--custom);
                base-palette: attr(name);
                base-palette: toggle(1);
                base-palette: calc-interpolate(0, 0: 1);
                base-palette: sibling-count();
                base-palette: 1 !important;

                font-family: name;
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@font-palette-values --name { font-family: name; }')
    })
    test('@font-palette-values - valid block contents', () => {
        const input = `
            @FONT-PALETTE-VALUES --name {
                BASE-PALETTE: {env(name)};
                font-family: first-valid(name);
            }
        `
        const styleSheet = createStyleSheet(input)
        expect(styleSheet.cssRules[0].cssText).toBe(normalizeText(input))
    })
    test('@function - invalid prelude', () => {
        const styleSheet = createStyleSheet('@function --name(--parameter-1, --parameter-2, --parameter-2) {}')
        expect(styleSheet.cssRules).toHaveLength(0)
    })
    test('@function - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @function --name() {

                @media;

                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @color-profile --name {}
                @counter-style name {}
                @font-face {}
                @font-feature-values name {}
                @font-palette-values --name { font-family: name }
                @function --name() {}
                @keyframes name {}
                @layer name;
                @page {}
                @position-try --name {}
                @property --name { syntax: "*"; inherits: false }
                @top-left {}
                @scope {}
                @starting-style {}
                @view-transition {}
                0% {}
                style {}

                color: red;

                result: 1 !important;

                @media {}
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@function --name() { @media {} }')
    })
    test('@function - valid block contents', () => {
        const contents = [
            '@container name {}',
            '@media {}',
            '@supports (color: green) {}',
            '--custom: 1;',
            'RESULT: {env(name)};',
        ]
        const input = `@FUNCTION --name() { ${contents.join(' ')} }`
        const styleSheet = createStyleSheet(input)
        expect(styleSheet.cssRules[0].cssText).toBe(input.toLowerCase())
    })
    test('@keyframes - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @keyframes name {

                @media;

                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @color-profile --name {}
                @container name {}
                @counter-style name {}
                @font-face {}
                @font-feature-values name {}
                @font-palette-values --name { font-family: name }
                @function --name() {}
                @keyframes name {}
                @layer name;
                @media {}
                @page {}
                @position-try --name {}
                @property --name { syntax: "*"; inherits: false }
                @top-left {}
                @scope {}
                @starting-style {}
                @supports (color: red) {}
                @view-transition {}
                style {}

                color: red;

                0% {}
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@keyframes name { 0% {} }')
    })
    test('@keyframes - valid block contents', () => {
        const styleSheet = createStyleSheet('@KEYFRAMES name { 0% {} }')
        expect(styleSheet.cssRules[0].cssText).toBe('@keyframes name { 0% {} }')
    })
    test('@layer - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @layer {

                @media;

                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @top-left {}
                0% {}

                color: red;

                @media {}
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@layer { @media {} }')
    })
    test('@layer - valid block contents', () => {
        const rules = [
            '@color-profile --name {}',
            '@container name {}',
            '@counter-style name {}',
            '@font-face {}',
            '@font-feature-values name {}',
            '@font-palette-values --name { font-family: name; }',
            '@function --name() {}',
            '@keyframes name {}',
            '@layer name;',
            '@media {}',
            '@page {}',
            '@position-try --name {}',
            '@property --name { syntax: "*"; inherits: false; }',
            '@scope {}',
            '@starting-style {}',
            '@supports (color: green) {}',
            '@view-transition {}',
            'style:hover {}',
        ]
        const input = `@LAYER { ${rules.join(' ')} }`
        const styleSheet = createStyleSheet(input)
        expect(styleSheet.cssRules[0].cssText).toBe(input.toLowerCase())
    })
    test('@media - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @media {

                @media;

                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @top-left {}
                0% {}

                color: red;

                @media {}
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@media { @media {} }')
    })
    test('@media - valid block contents', () => {
        const rules = [
            '@color-profile --name {}',
            '@container name {}',
            '@counter-style name {}',
            '@font-face {}',
            '@font-feature-values name {}',
            '@font-palette-values --name { font-family: name; }',
            '@function --name() {}',
            '@keyframes name {}',
            '@layer name;',
            '@media {}',
            '@page {}',
            '@position-try --name {}',
            '@property --name { syntax: "*"; inherits: false; }',
            '@scope {}',
            '@starting-style {}',
            '@supports (color: green) {}',
            '@view-transition {}',
            'style:hover {}',
        ]
        const input = `@MEDIA { ${rules.join(' ')} }`
        const styleSheet = createStyleSheet(input)
        expect(styleSheet.cssRules[0].cssText).toBe(input.toLowerCase())
    })
    test('@page - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @page {

                @media;

                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @color-profile --name {}
                @container name {}
                @counter-style name {}
                @font-face {}
                @font-feature-values name {}
                @font-palette-values --name { font-family: name }
                @function --name() {}
                @keyframes name {}
                @layer name;
                @media {}
                @page {}
                @position-try --name {}
                @property --name { syntax: "*"; inherits: false }
                @scope {}
                @starting-style {}
                @supports (color: red) {}
                @view-transition {}
                0% {}
                style {}

                top: 1px;

                @top-left {}
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@page { @top-left {} }')
    })
    test('@page - valid block contents', () => {
        const contents = [
            '@top-left {}',
            '--custom: 1;',
            'MARGIN-TOP: initial;',
            'SIZE: initial;',
            'margin-top: {env(name)};',
            'size: {env(name)};',
            'margin-top: var(--custom);',
            'size: var(--custom);',
            'margin-top: attr(name);',
            'size: attr(name);',
            'margin-top: first-valid(1px);',
            'size: first-valid(1px);',
            'margin-top: toggle(1px);',
            'size: toggle(1px);',
            'margin-top: calc-interpolate(0, 0: 1px);',
            'size: calc-interpolate(0, 0: 1px);',
            'margin-top: calc(1px * sibling-count());',
            'size: calc(1px * sibling-count());',
            'margin-top: 1px !important;',
            'size: 1px !important;',
        ]
        contents.forEach(content => {
            const input = `@PAGE { ${content} }`
            const styleSheet = createStyleSheet(input)
            expect(styleSheet.cssRules[0].cssText).toBe(normalizeText(input))
        })
    })
    test('@position-try - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @position-try --name {

                style {}
                color: red;
                top: 1px !important;

                bottom: 1px;
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@position-try --name { bottom: 1px; }')
    })
    test('@position-try - valid block contents', () => {
        const declarations = [
            'TOP: initial',
            'top: {env(name)}',
            'top: var(--custom)',
            'top: attr(name)',
            'top: first-valid(1px)',
            'top: toggle(1px)',
            'top: calc-interpolate(0, 0: 1px)',
            'top: calc(1px * sibling-count())',
        ]
        declarations.forEach(declaration => {
            const input = `@POSITION-TRY --name { ${declaration}; }`
            const styleSheet = createStyleSheet(input)
            expect(styleSheet.cssRules[0].cssText).toBe(normalizeText(input))
        })
    })
    test('@property - missing declaration for inherits', () => {
        expect(createStyleSheet('@property --name { syntax: "*"; initial-value: 1; }').cssRules).toHaveLength(0)
    })
    test('@property - missing declaration for syntax', () => {
        expect(createStyleSheet('@property --name { inherits: true; initial-value: 1; }').cssRules).toHaveLength(0)
    })
    test('@property - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @property --name {

                syntax: "*";
                inherits: true;

                style {}
                color: red;

                syntax: "initial";
                inherits: initial;
                inherits: var(--custom);
                inherits: attr(name);
                inherits: false !important;
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@property --name { syntax: "*"; inherits: true; }')
    })
    test('@property - valid block contents', () => {
        const declarations = [
            'INHERITS: {env(name)}',
            'inherits: first-valid(false)',
        ]
        declarations.forEach(declaration => {
            const input = `@PROPERTY --name { syntax: "*"; ${declaration}; }`
            const styleSheet = createStyleSheet(input)
            expect(styleSheet.cssRules[0].cssText).toBe(normalizeText(input))
        })
    })
    test('@property - invalid and valid initial-value', () => {

        const invalid = [
            // Invalid syntax
            ['', '<length>'],
            ['1', '<length>'],
            ['initial', '<length>'],
            ['attr(name)', '<length>'],
            ['env(name)', '<length>'],
            ['random-item(--key, 1px)', '<length>'],
            ['var(--custom)', '<length>'],
            ['first-valid(1px)', '<length>'],
            ['interpolate(0, 0: 1px)', '<length>'],
            ['toggle(1px)', '<length>'],
            // Computationally dependent
            ['1em', '<length>'],
            ['calc(1em + 1px)', '<length>'],
            ['translate(1em)', '<transform-function>'],
            ['rgb(calc(1em / 1px) 0 0)', '<color>'],
            // https://github.com/w3c/css-houdini-drafts/issues/1076
            ['initial', '*'],
        ]
        const valid = [
            // Empty value
            ['', '*'],
            [' ', '*'],
            // Positioned {} block
            ['1 {}', '*'],
            // Computationally independent
            ['1in', '<length>'],
            ['1%', '<length-percentage>'],
            ['calc(1% + 1px)', '<length-percentage>'],
            ['calc-interpolate(0, 0: 1px)', '<length>'],
            ['random(1px, 1px)', '<length>'],
            ['calc(1px * sibling-count())', '<length>'],
            ['translate(1px)', '<transform-function>'],
            // Substitutions
            ['env(name)', '*'],
            ['var(--custom)', '*'],
            ['first-valid(1px)', '*'],
        ]
        const cases = [invalid, valid]

        cases.forEach((group, index) =>
            group.forEach(([value, syntax]) => {
                const styleSheet = createStyleSheet(`
                    @property --name {
                        syntax: "${syntax}";
                        initial-value: 1px;
                        initial-value: ${value};
                        inherits: true;
                    }
                `)
                expect(styleSheet.cssRules).toHaveLength(index)
            }))
    })
    test('@scope - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @scope {

                @media;

                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @top-left {}
                0% {}

                @media {}
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@scope { @media {} }')
    })
    test('@scope - valid block contents', () => {

        const rules = [
            '@color-profile --name {}',
            '@container name {}',
            '@counter-style name {}',
            '@font-face {}',
            '@font-feature-values name {}',
            '@font-palette-values --name { font-family: name; }',
            '@function --name() {}',
            '@keyframes name {}',
            '@layer name;',
            '@media {}',
            '@page {}',
            '@position-try --name {}',
            '@property --name { syntax: "*"; inherits: false; }',
            '@scope {}',
            '@starting-style {}',
            '@supports (color: green) {}',
            '@view-transition {}',
            'style:hover {}',
        ]
        const input = `@SCOPE { ${rules.join(' ')} }`
        const styleSheet = createStyleSheet(input)

        expect(styleSheet.cssRules[0].cssText).toBe(input.toLowerCase())

        const declarations = [
            '--custom: 1',
            'TOP: {env(name)}',
            'top: first-valid(1px)',
            'top: initial',
            'top: inherit(--custom)',
            'top: var(--custom)',
            'top: attr(name)',
            'top: toggle(1px)',
            'top: calc-interpolate(0, 0: 1px)',
            'top: calc(1px * sibling-count())',
            'top: 1px !important',
        ]
        declarations.forEach(declaration => {
            const input = `@SCOPE { ${declaration}; }`
            const styleSheet = createStyleSheet(input)
            expect(styleSheet.cssRules[0].cssText).toBe(normalizeText(input))
        })
    })
    test('@starting-style - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @starting-style {

                @media;

                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @top-left {}
                0% {}

                color: red;

                @media {}
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@starting-style { @media {} }')
    })
    test('@starting-style - valid block contents', () => {
        const rules = [
            '@color-profile --name {}',
            '@container name {}',
            '@counter-style name {}',
            '@font-face {}',
            '@font-feature-values name {}',
            '@font-palette-values --name { font-family: name; }',
            '@function --name() {}',
            '@keyframes name {}',
            '@layer name;',
            '@media {}',
            '@page {}',
            '@position-try --name {}',
            '@property --name { syntax: "*"; inherits: false; }',
            '@scope {}',
            '@starting-style {}',
            '@supports (color: green) {}',
            '@view-transition {}',
            'style:hover {}',
        ]
        const input = `@STARTING-STYLE { ${rules.join(' ')} }`
        const styleSheet = createStyleSheet(input)
        expect(styleSheet.cssRules[0].cssText).toBe(input.toLowerCase())
    })
    test('@supports - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @supports (color: green) {

                @media;

                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @top-left {}
                0% {}

                color: red;

                @media {}
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@supports (color: green) { @media {} }')
    })
    test('@supports - valid block contents', () => {
        const rules = [
            '@color-profile --name {}',
            '@container name {}',
            '@counter-style name {}',
            '@font-face {}',
            '@font-feature-values name {}',
            '@font-palette-values --name { font-family: name; }',
            '@function --name() {}',
            '@keyframes name {}',
            '@layer name;',
            '@media {}',
            '@page {}',
            '@position-try --name {}',
            '@property --name { syntax: "*"; inherits: false; }',
            '@scope {}',
            '@starting-style {}',
            '@supports (color: green) {}',
            '@view-transition {}',
            'style:hover {}',
        ]
        const input = `@SUPPORTS (color: green) { ${rules.join(' ')} }`
        const styleSheet = createStyleSheet(input)
        expect(styleSheet.cssRules[0].cssText).toBe(input.toLowerCase())
    })
    test('@view-transition - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @view-transition {

                style {}
                color: red;

                types: initial;
                types: var(--custom);
                types: attr(name);
                types: toggle(name);
                types: name !important;

                navigation: auto;
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@view-transition { navigation: auto; }')
    })
    test('@view-transition - valid block contents', () => {
        const declarations = [
            'NAVIGATION: {env(name)}',
            'navigation: first-valid(auto)',
        ]
        declarations.forEach(declaration => {
            const input = `@VIEW-TRANSITION { ${declaration}; }`
            const styleSheet = createStyleSheet(input)
            expect(styleSheet.cssRules[0].cssText).toBe(normalizeText(input))
        })
    })
    test('font feature value type rule - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @font-feature-values name {
                @ANNOTATION {

                    style {}
                    color: red;

                    name: initial;
                    name: var(--custom);
                    name: attr(name);
                    name: toggle(name);
                    name: calc-interpolate(0, 0: 1) 1;
                    name: sibling-count() 1;
                    name: 0 !important;

                    name: -1;
                    name: 1 2;
                }
                @character-variant {
                    name:  -1 2;
                    name: 100 1;
                    name: 1 2 3;
                }
                @ornaments {
                    name: -1;
                    name:  1 2;
                }
                @styleset {
                    name: -1 2 3 4 5;
                    name: 21 2 3 4 5;
                }
                @stylistic {
                    name: -1;
                    name:  1 2;
                }
                @swash {
                    name: -1;
                    name:  1 2;
                }
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@font-feature-values name {}')
    })
    test('font feature value type rule - valid block contents', () => {
        const contents = [
            '@ANNOTATION { name: 1; }',
            '@character-variant { name: 1 2; }',
            '@ornaments { name: 1; }',
            '@styleset { name: 1 2 3 4 5; }',
            '@stylistic { name: 1; }',
            '@swash { name: 1; }',
        ]
        const input = `@font-feature-values name { ${contents.join(' ')} }`
        const styleSheet = createStyleSheet(input)
        expect(styleSheet.cssRules[0].cssText).toBe(input.toLowerCase())
    })
    test('keyframe rule - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @keyframes name {
                FROM {

                    style {}
                    animation-delay: 1s;
                    top: 1px !important;

                    animation-timing-function: linear;
                }
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@keyframes name { 0% { animation-timing-function: linear; } }')
    })
    test('keyframe rule - valid block contents', () => {
        const declarations = [
            '--custom: 1',
            'TOP: initial',
            'top: {env(name)}',
            'top: var(--custom)',
            'top: attr(name)',
            'top: first-valid(1px)',
            'top: toggle(1px)',
            'top: calc-interpolate(0, 0: 1px)',
            'top: calc(1px * sibling-count())',
            'color: color-interpolate(0, 0: green)',
        ]
        declarations.forEach(declaration => {
            const styleSheet = createStyleSheet(`@keyframes name { FROM { ${declaration}; } }`)
            expect(styleSheet.cssRules[0].cssText).toBe(`@keyframes name { 0% { ${normalizeText(declaration)}; } }`)
        })
    })
    test('margin rule - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            @page {
                @top-left {
                    style {}
                    top: 1px;
                    margin-bottom: 1px;
                }
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('@page { @top-left { margin-bottom: 1px; } }')
    })
    test('margin rule - valid block contents', () => {
        const declarations = [
            '--custom: 1',
            'MARGIN-TOP: initial',
            'margin-top: {env(name)}',
            'margin-top: var(--custom)',
            'margin-top: attr(name)',
            'margin-top: first-valid(1px)',
            'margin-top: toggle(1px)',
            'margin-top: calc-interpolate(0, 0: 1px)',
            'margin-top: calc(1px * sibling-count())',
            'margin-top: 1px !important',
        ]
        declarations.forEach(declaration => {
            const input = `@page { @TOP-LEFT { ${declaration}; } }`
            const styleSheet = createStyleSheet(input)
            expect(styleSheet.cssRules[0].cssText).toBe(normalizeText(input))
        })
    })
    test('nested group rule - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            style {
                @media {

                    @media;

                    @charset "utf-8";
                    @import "./global.css";
                    @namespace svg "http://www.w3.org/2000/svg";
                    @annotation {}
                    @color-profile --name {}
                    @counter-style name {}
                    @font-face {}
                    @font-feature-values name {}
                    @font-palette-values --name { font-family: name }
                    @function --name() {}
                    @keyframes name {}
                    @layer name;
                    @page {}
                    @position-try --name {}
                    @property --name { syntax: "*"; inherits: false }
                    @top-left {}
                    @view-transition {}
                    0% {}

                    @media {}
                }
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('style { @media { @media {} } }')
    })
    test('nested group rule - valid block contents', () => {

        const rules = [
            '@CONTAINER name {}',
            '@layer {}',
            '@media {}',
            '@scope {}',
            '@starting-style {}',
            '@supports (color: green) {}',
            '& style {}',
        ]
        const input = `style { @media { ${rules.join(' ')} } }`
        const styleSheet = createStyleSheet(input)

        expect(styleSheet.cssRules[0].cssText).toBe(input.toLowerCase())

        const declarations = [
            '--custom: 1',
            'TOP: initial',
            'top: {env(name)}',
            'top: var(--custom)',
            'top: attr(name)',
            'top: first-valid(1px)',
            'top: toggle(1px)',
            'top: calc-interpolate(0, 0: 1px)',
            'top: calc(1px * sibling-count())',
            'color: color-interpolate(0, 0: green)',
            'top: 1px !important',
        ]
        declarations.forEach(declaration => {
            const input = `style { @media { & { ${declaration}; } } }`
            const styleSheet = createStyleSheet(input)
            expect(styleSheet.cssRules[0].cssText).toBe(normalizeText(input))
        })
    })
    test('nested style rule - invalid prelude containing an undeclared namespace prefix', () => {
        const styleSheet = createStyleSheet(`
            @namespace svg "http://www.w3.org/2000/svg";
            style {
                html|nested {}
                svg|nested {}
            }
        `)
        expect(styleSheet.cssRules[1].cssText).toBe('style { & svg|nested {} }')
    })
    test('nested style rule - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            style {
                & {

                    @media;

                    @charset "utf-8";
                    @import "./global.css";
                    @namespace svg "http://www.w3.org/2000/svg";
                    @annotation {}
                    @color-profile --name {}
                    @counter-style name {}
                    @font-face {}
                    @font-feature-values name {}
                    @font-palette-values --name { font-family: name }
                    @function --name() {}
                    @keyframes name {}
                    @layer name;
                    @page {}
                    @position-try --name {}
                    @property --name { syntax: "*"; inherits: false }
                    @top-left {}
                    @view-transition {}
                    0% {}

                    @media {}
                }
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('style { & { @media {} } }')
    })
    test('nested style rule - valid block contents', () => {

        const rules = [
            '@CONTAINER name {}',
            '@layer {}',
            '@media {}',
            '@scope {}',
            '@starting-style {}',
            '@supports (color: green) {}',
            '& style {}',
        ]
        const input = `style { & { ${rules.join(' ')} } }`
        const styleSheet = createStyleSheet(input)

        expect(styleSheet.cssRules[0].cssText).toBe(input.toLowerCase())

        const declarations = [
            '--custom: 1',
            'TOP: initial',
            'top: {env(name)}',
            'top: var(--custom)',
            'top: attr(name)',
            'top: first-valid(1px)',
            'top: toggle(1px)',
            'top: calc-interpolate(0, 0: 1px)',
            'top: calc(1px * sibling-count())',
            'color: color-interpolate(0, 0: green)',
            'top: 1px !important',
        ]
        declarations.forEach(declaration => {
            const input = `style { & { ${declaration}; } }`
            const styleSheet = createStyleSheet(input)
            expect(styleSheet.cssRules[0].cssText).toBe(normalizeText(input))
        })
    })
    test('nested style rule - invalid contents between valid declarations', () => {
        const styleSheet = createStyleSheet(`
            style {

                color: orange;

                @media;
                . {}
                --custom: { var() };

                color: green;
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('style { color: green; }')
    })
    test('style rule - invalid prelude containing an undeclared namespace prefix', () => {

        const { cssRules } = createStyleSheet(`
            @namespace svg "http://www.w3.org/2000/svg";
            svg|rect { fill: green }
            SVG|rect { fill: red }
            @namespace html "https://www.w3.org/1999/xhtml/";
            html|type {}
        `)

        expect(cssRules).toHaveLength(2)

        const styleRule = cssRules[1]

        expect(CSSStyleRule.is(styleRule)).toBeTruthy()

        const { selectorText, style } = styleRule

        expect(selectorText).toBe('svg|rect')
        expect(style.fill).toBe('green')
    })
    test('style rule - invalid block contents', () => {
        const styleSheet = createStyleSheet(`
            style {

                @media;

                @charset "utf-8";
                @import "./global.css";
                @namespace svg "http://www.w3.org/2000/svg";
                @annotation {}
                @color-profile --name {}
                @counter-style name {}
                @font-face {}
                @font-feature-values name {}
                @font-palette-values --name { font-family: name }
                @function --name() {}
                @keyframes name {}
                @layer name;
                @page {}
                @position-try --name {}
                @property --name { syntax: "*"; inherits: false }
                @top-left {}
                @view-transition {}
                0% {}

                @media {}
            }
        `)
        expect(styleSheet.cssRules[0].cssText).toBe('style { @media {} }')
    })
    test('style rule - valid block contents', () => {

        const rules = [
            '@CONTAINER name {}',
            '@layer {}',
            '@media {}',
            '@scope {}',
            '@starting-style {}',
            '@supports (color: green) {}',
            '& style {}',
        ]
        const input = `style { ${rules.join(' ')} }`
        const styleSheet = createStyleSheet(input)

        expect(styleSheet.cssRules[0].cssText).toBe(input.toLowerCase())

        const declarations = [
            '--custom: 1',
            'TOP: initial',
            'top: {env(name)}',
            'top: var(--custom)',
            'top: attr(name)',
            'top: first-valid(1px)',
            'top: toggle(1px)',
            'top: calc-interpolate(0, 0: 1px)',
            'top: calc(1px * sibling-count())',
            'top: 1px !important',
        ]
        declarations.forEach(declaration => {
            const input = `style { ${declaration}; }`
            const styleSheet = createStyleSheet(input)
            expect(styleSheet.cssRules[0].cssText).toBe(normalizeText(input))
        })
    })
    // Legacy names
    test('legacy rule name', () => {
        const rule = createStyleSheet('@-webkit-keyframes name {}').cssRules[0]
        expect(CSSKeyframesRule.is(rule)).toBeTruthy()
        expect(rule.cssText).toBe('@keyframes name {}')
    })
    test('legacy property name', () => {
        const styleSheet = createStyleSheet('style { -webkit-order: 1 }')
        expect(styleSheet.cssRules[0].cssText).toBe('style { order: 1; }')
    })
})
