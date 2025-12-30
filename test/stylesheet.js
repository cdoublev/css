
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
    StyleSheetList,
} from '../lib/cssom/index.js'
import { after, afterEach, describe, it, test } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs/promises'
import http from 'node:http'
import { install } from '@cdoublev/css'
import path from 'node:path'
import { wrapperForImpl } from '../lib/cssom/utils.js'

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
        encoding: globalThis.document.characterSet,
        location: baseURL,
        media: '',
        rules,
        ...properties,
    }
    const styleSheet = CSSStyleSheet.create(globalThis, undefined, properties)
    styleSheets._list.push(styleSheet)
    return styleSheet
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
 * <whole-value> substitution that does not resolve at parse time.
 */
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/first-valid\(([^)]+)\)/g, '$1')
        .replace(/(\n|  +)+/g, ' ')
        .trim()
}

/**
 * @param {IncomingMessage} request
 * @param {ServerResponse} response
 */
async function serverHandler({ method, url }, response) {

    const { origin, pathname, searchParams } = new URL(url, baseURL)
    const headers = new Map

    if (origin === crossOrigin) {
        if (searchParams.has('allow-credentials')) {
            headers.set('Access-Control-Allow-Credentials', searchParams.get('allow-credentials'))
        }
        if (searchParams.has('allow-headers')) {
            headers.set('Access-Control-Allow-Headers', searchParams.get('allow-headers'))
        }
        if (searchParams.has('allow-methods')) {
            headers.set('Access-Control-Allow-Methods', searchParams.get('allow-methods'))
        }
        if (searchParams.has('allow-origin')) {
            headers.set('Access-Control-Allow-Origin', searchParams.get('allow-origin'))
            headers.set('Vary', 'Origin')
        }
        if (searchParams.has('expose-headers')) {
            headers.set('Access-Control-Expose-Headers', searchParams.get('expose-headers'))
        }
    }

    if (method !== 'GET') {
        response.writeHead(400).end()
        return
    }

    const filePath = path.join(import.meta.dirname, 'imported', pathname.replace(baseURL, ''))

    if (filePath.includes('redirected.css')) {
        headers.set('Location', searchParams.get('url'))
        response.writeHead(301, Object.fromEntries(headers)).end()
        return
    }

    try {
        const file = await fs.open(filePath)
        const stats = await file.stat()
        const read = file.createReadStream()
        const charset = searchParams.get('charset')
        headers.set('Content-Type', charset ? `text/css; charset=${charset}` : 'text/css')
        headers.set('Content-Length', stats.size)
        response.writeHead(200, Object.fromEntries(headers))
        read.pipe(response).on('error', response.end)
    } catch {
        response.writeHead(400).end()
    }
}

/**
 * @param {string} origin
 * @returns {function}
 */
function createServerHandler(origin) {
    return (request, response) => {
        request.url = `${origin}${request.url}`
        return serverHandler(request, response)
    }
}

install()

const domain = 'localhost'
const port = 8080
const host = `${domain}:${port}`
const baseURL = `http://${host}`
const crossOrigin = `http://${domain}:${port + 1}`
const servers = [
    http.createServer(createServerHandler(baseURL)).listen(port),
    http.createServer(createServerHandler(crossOrigin)).listen(port + 1),
]
const styleSheets = StyleSheetList.createImpl(globalThis)

globalThis.document = {
    adoptedStyleSheets: [],
    baseURI: baseURL,
    characterSet: 'UTF-8',
    styleSheets: wrapperForImpl(styleSheets),
}
globalThis.origin = baseURL

afterEach(() => {
    styleSheets._list.splice(0)
})
after(() => {
    servers.forEach(server => server.close())
})

describe('CSSStyleSheet', () => {
    it('creates a constructed CSSStyleSheet', () => {

        const media = 'all'
        const options = { baseURL, disabled: true, media }
        const styleSheet = new globalThis.CSSStyleSheet(options)

        // StyleSheet properties
        assert.equal(styleSheet.disabled, true)
        assert.equal(styleSheet.href, document.baseURI)
        assert.equal(MediaList.is(styleSheet.media), true)
        assert.equal(styleSheet.media.mediaText, media)
        assert.equal(styleSheet.ownerNode, null)
        assert.equal(styleSheet.parentStyleSheet, null)
        assert.equal(styleSheet.title, '')
        assert.equal(styleSheet.type, 'text/css')

        // CSSStyleSheet properties
        assert.equal(styleSheet.ownerRule, null)
        assert.equal(CSSRuleList.is(styleSheet.cssRules), true)
        assert.equal(CSSRuleList.is(styleSheet.rules), true)
    })
    it('creates a constructed CSSStyleSheet with a MediaList', () => {

        const { media } = new globalThis.CSSStyleSheet({ media: 'all' })
        const styleSheet = new globalThis.CSSStyleSheet({ media })

        assert.notEqual(styleSheet.media, media)
        assert.equal(styleSheet.media.mediaText, media.mediaText)

        media.mediaText = '(width)'
        assert.equal(media.mediaText, '(width)')
        assert.equal(styleSheet.media.mediaText, 'all')
    })
    it('creates a non-constructed CSSStyleSheet', () => {

        const location = 'http://github.com/w3c/csswg-drafts/style.css'
        const media = 'all'
        const ownerNode = { type: 'HTMLLinkElement' }
        const title = 'Main CSS'
        const properties = { location, media, ownerNode, title }
        const styleSheet = createStyleSheet('', properties)

        // StyleSheet properties
        assert.equal(styleSheet.disabled, false)
        assert.equal(styleSheet.href, location)
        assert.equal(MediaList.is(styleSheet.media), true)
        assert.equal(styleSheet.media.mediaText, media)
        assert.equal(styleSheet.ownerNode, ownerNode)
        assert.equal(styleSheet.parentStyleSheet, null)
        assert.equal(styleSheet.title, title)
        assert.equal(styleSheet.type, 'text/css')

        // CSSStyleSheet properties
        assert.equal(CSSRuleList.is(styleSheet.cssRules), true)
        assert.equal(CSSRuleList.is(styleSheet.rules), true)
        assert.equal(styleSheet.ownerRule, null)
    })
})
describe('CSSStyleSheet.insertRule(), CSSStyleSheet.deleteRule()', () => {
    it('throws an error when trying to insert/delete a rule in a style sheet whose origin is not clean', () => {
        const styleSheet = createStyleSheet('', { originClean: false })
        assert.throws(() => styleSheet.insertRule('style {}'), ACCESS_THIRD_PARTY_STYLESHEET_ERROR)
        assert.throws(() => styleSheet.deleteRule(0), ACCESS_THIRD_PARTY_STYLESHEET_ERROR)
    })
    it('throws an error when trying to insert/delete a rule while modifications on the style sheet are not allowed', () => {
        const styleSheet = new globalThis.CSSStyleSheet
        styleSheet.replace('')
        assert.throws(() => styleSheet.insertRule('style {}'), UPDATE_LOCKED_STYLESHEET_ERROR)
        assert.throws(() => styleSheet.deleteRule(0), UPDATE_LOCKED_STYLESHEET_ERROR)
    })
    it('throws an error when trying to insert an invalid rule according to the CSS grammar', () => {
        const styleSheet = createStyleSheet()
        assert.throws(() => styleSheet.insertRule(' '), MISSING_RULE_ERROR)
        assert.throws(() => styleSheet.insertRule('@charset "utf-8";'), INVALID_RULE_ERROR)
        assert.throws(() => styleSheet.insertRule('@top-left {}'), INVALID_RULE_ERROR)
        assert.throws(() => styleSheet.insertRule('@media;'), INVALID_RULE_ERROR)
        assert.throws(() => styleSheet.insertRule('style;'), INVALID_RULE_ERROR)
        assert.throws(() => styleSheet.insertRule('style {};'), EXTRA_RULE_ERROR)
    })
    it('throws an error when trying to insert @import in a constructed style sheet', () => {
        const styleSheet = new globalThis.CSSStyleSheet
        assert.throws(() => styleSheet.insertRule('@import "./global.css";'), INSERT_INVALID_IMPORT_ERROR)
    })
    it('throws an error when trying to insert/delete a rule at an index greater than the length of rules', () => {
        const styleSheet = createStyleSheet()
        assert.throws(() => styleSheet.insertRule('style {}', 1), INVALID_RULE_INDEX_ERROR)
        assert.throws(() => styleSheet.deleteRule(0), INVALID_RULE_INDEX_ERROR)
    })
    it('throws an error when trying to insert any other rule than @import or @layer before @import', async () => {
        const styleSheet = createStyleSheet('@import "./global.css";')
        assert.throws(() => styleSheet.insertRule('@namespace svg "http://www.w3.org/2000/svg";'), INVALID_RULE_POSITION_ERROR)
        assert.throws(() => styleSheet.insertRule('style {}'), INVALID_RULE_POSITION_ERROR)
        await CSSImportRule.convert(globalThis, styleSheet.cssRules[0])._promise
    })
    it('throws an error when trying to insert any other rule than @import, @layer, @namespace, before @namespace', () => {
        const styleSheet = createStyleSheet('@namespace svg "http://www.w3.org/2000/svg";')
        assert.throws(() => styleSheet.insertRule('style {}'), INVALID_RULE_POSITION_ERROR)
    })
    it('throws an error when trying to insert @import after any other rule than @import or @layer', () => {
        const styleSheet = createStyleSheet('@namespace svg "http://www.w3.org/2000/svg";')
        assert.throws(() => styleSheet.insertRule('@import "./global.css";', 1), INVALID_RULE_POSITION_ERROR)
    })
    it('throws an error when trying to insert @layer between @import and @import', async () => {
        const styleSheet = createStyleSheet(`
            @import "./global.css";
            @import "./page.css";
        `)
        assert.throws(() => styleSheet.insertRule('@layer base;', 1), INVALID_RULE_POSITION_ERROR)
        await CSSImportRule.convert(globalThis, styleSheet.cssRules[0])._promise
        await CSSImportRule.convert(globalThis, styleSheet.cssRules[1])._promise
    })
    it('throws an error when trying to insert @layer between @import and @namespace', async () => {
        const styleSheet = createStyleSheet(`
            @import "./global.css";
            @namespace svg "http://www.w3.org/2000/svg";
        `)
        assert.throws(() => styleSheet.insertRule('@layer base;', 1), INVALID_RULE_POSITION_ERROR)
        await CSSImportRule.convert(globalThis, styleSheet.cssRules[0])._promise
    })
    it('throws an error when trying to insert @layer between @namespace and @namespace', () => {
        const styleSheet = createStyleSheet(`
            @namespace html "https://www.w3.org/1999/xhtml/";
            @namespace svg "http://www.w3.org/2000/svg";
        `)
        assert.throws(() => styleSheet.insertRule('@layer base;', 1), INVALID_RULE_POSITION_ERROR)
    })
    it('throws an error when trying to insert @namespace if any other rule than @import, @layer, @namespace, exists', () => {
        const styleSheet = createStyleSheet('style {}')
        assert.throws(() => styleSheet.insertRule('@namespace svg "http://www.w3.org/2000/svg";'), INVALID_NAMESPACE_STATE_ERROR)
    })
    it('inserts and deletes a rule', async () => {

        const styleSheet = createStyleSheet()
        const { cssRules } = styleSheet

        styleSheet.insertRule('@namespace svg "http://www.w3.org/2000/svg";', 0)

        assert.equal(cssRules.length, 1)

        const namespaceRule = cssRules[0]

        assert.equal(CSSNamespaceRule.is(namespaceRule), true)

        styleSheet.insertRule('@namespace html "https://www.w3.org/1999/xhtml/";')

        assert.equal(cssRules[1], namespaceRule)

        styleSheet.deleteRule(1)

        assert.equal(cssRules.length, 1)
        assert.equal(namespaceRule.parentStyleSheet, null)

        styleSheet.insertRule('@import "./page.css";')
        styleSheet.insertRule('@layer reset;')
        styleSheet.insertRule('@namespace svg "http://www.w3.org/2000/svg";', 3)
        styleSheet.insertRule('@layer base;', 4)
        styleSheet.insertRule('svg|rect {}', 5)

        assert.equal(cssRules.length, 6)

        await CSSImportRule.convert(globalThis, styleSheet.cssRules[1])._promise
    })
})
describe('CSSStyleSheet.replace(), CSSStyleSheet.replaceSync()', () => {
    it('throws an error when trying to replace rules of a non-constructed style sheet', () => {
        const styleSheet = createStyleSheet()
        assert.throws(() => styleSheet.replaceSync(''), UPDATE_LOCKED_STYLESHEET_ERROR)
    })
    it('throws an error when trying to replace rules concurrently', async () => {
        const styleSheet = new globalThis.CSSStyleSheet
        styleSheet.replace('')
        await assert.rejects(styleSheet.replace(''), UPDATE_LOCKED_STYLESHEET_ERROR)
    })
    it('replaces a rule asynchronously/synchronously', async () => {

        const styleSheet = new globalThis.CSSStyleSheet
        const { cssRules } = styleSheet

        assert.equal(await styleSheet.replace('style { color: orange }'), styleSheet)
        assert.equal(cssRules.length, 1)
        assert.equal(cssRules[0].style.color, 'orange')

        styleSheet.replaceSync('style { color: green }')

        assert.equal(cssRules.length, 1)
        assert.equal(cssRules[0].style.color, 'green')
    })
    it('ignores opening and ending HTML comment tokens', () => {

        const styleSheet = new globalThis.CSSStyleSheet

        styleSheet.replaceSync('<!-- style {} -->')

        assert.equal(styleSheet.cssRules.length, 1)
    })
    it('ignores import rules and invalid contents', () => {

        const styleSheet = new globalThis.CSSStyleSheet

        styleSheet.replaceSync(`
            @import "./global.css";
            @namespace <bad-string-or-url>;
            style { color: green }
            color: red;
        `)

        assert.equal(CSSStyleRule.is(styleSheet.cssRules[0]), true)
    })
})

describe('CSSRuleList.item()', () => {
    it('returns the rule at the given index', () => {
        const { cssRules } = createStyleSheet(`
            #rule-1 {}
            #rule-2 {}
        `)
        assert.equal(cssRules.item(1), cssRules[1])
        assert.equal(cssRules.item(2), null)
    })
})
describe('CSSRuleList.length', () => {
    it('returns the length of the rule list', () => {
        const { cssRules } = createStyleSheet(`
            #rule-1 {}
            #rule-2 {}
        `)
        assert.equal(cssRules.length, 2)
    })
})

describe('CSSColorProfileRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@color-profile --name { src: url("profile.icc") }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '@color-profile --name { src: url("profile.icc"); }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSColorProfileRule
        assert.equal(rule.name, '--name')
        assert.equal(rule.src, 'url("profile.icc")')
    })
})
describe('CSSContainerRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@container name { style {} }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '@container name { style {} }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSGroupingRule
        assert.equal(CSSRuleList.is(rule.cssRules), true)

        // CSSConditionRule
        assert.equal(rule.conditionText, 'name')
    })
})
describe('CSSCounterStyleRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@counter-style name { system: fixed; speak-as: auto }')
        let rule = styleSheet.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '@counter-style name { speak-as: auto; system: fixed; }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSCounterStyleRule
        //   https://github.com/w3c/csswg-drafts/issues/9363
        rule.name = ''
        assert.equal(rule.name, 'name')
        rule.name = '\n'
        assert.equal(rule.name, '\\a')
        //   Priority
        rule.system = 'fixed !important'
        //   Cascade or element-dependent substitution
        rule.system = 'initial'
        rule.system = 'var(--custom)'
        rule.system = 'attr(name)'
        //   Dependency-free pending substitution
        rule.system = 'env(name)'
        assert.equal(rule.system, 'fixed')
        //   system: symbolic (default)
        rule = createStyleSheet('@counter-style name {}').cssRules[0]
        rule.additiveSymbols = '1 a'
        assert.equal(rule.additiveSymbols, '')
        rule.symbols = 'a'
        assert.equal(rule.symbols, 'a')
        rule.system = 'fixed'
        rule.system = 'extends decimal'
        assert.equal(rule.system, '')
        rule.system = 'symbolic'
        assert.equal(rule.system, 'symbolic')
        //   system: fixed
        rule = createStyleSheet('@counter-style name { system: fixed }').cssRules[0]
        rule.additiveSymbols = '1 a'
        assert.equal(rule.additiveSymbols, '')
        rule.symbols = 'a'
        assert.equal(rule.symbols, 'a')
        rule.system = 'symbolic'
        rule.system = 'extends decimal'
        assert.equal(rule.system, 'fixed')
        rule.system = 'first-valid(fixed 2)'
        assert.equal(rule.system, 'fixed 2')
        rule.system = 'fixed calc(2)'
        assert.equal(rule.system, 'fixed calc(2)')
        //   system: numeric (and alphabetic)
        rule = createStyleSheet('@counter-style name { system: numeric }').cssRules[0]
        rule.additiveSymbols = '1 a, 2 b'
        assert.equal(rule.additiveSymbols, '')
        rule.symbols = 'a'
        assert.equal(rule.symbols, '')
        rule.symbols = 'a b'
        assert.equal(rule.symbols, 'a b')
        rule.system = 'symbolic'
        rule.system = 'extends decimal'
        assert.equal(rule.system, 'numeric')
        // system: additive
        rule = createStyleSheet('@counter-style name { system: additive }').cssRules[0]
        rule.symbols = 'a'
        assert.equal(rule.symbols, '')
        rule.additiveSymbols = '1 a, 1 b'
        assert.equal(rule.additiveSymbols, '')
        rule.additiveSymbols = '1 a, 2 b'
        assert.equal(rule.additiveSymbols, '')
        rule.additiveSymbols = '1 a'
        assert.equal(rule.additiveSymbols, '1 a')
        rule.system = 'symbolic'
        assert.equal(rule.system, 'additive')
        // system: extends <counter-style-name>
        rule = createStyleSheet('@counter-style name { system: extends decimal }').cssRules[0]
        rule.additiveSymbols = '1 a'
        assert.equal(rule.additiveSymbols, '')
        rule.symbols = 'a'
        assert.equal(rule.symbols, '')
        rule.system = 'symbolic'
        assert.equal(rule.system, 'extends decimal')
        rule.system = 'extends disc'
        assert.equal(rule.system, 'extends disc')
    })
})
describe('CSSFontFaceRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@font-face { src: url(serif.woff2) }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '@font-face { src: url("serif.woff2"); }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSFontFaceRule
        assert.equal(CSSFontFaceDescriptors.is(rule.style), true)
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
        assert.equal(rule.cssText, '@font-feature-values name { font-display: block; @annotation { name: 2; } }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSFontFeatureValuesRule
        assert.equal(rule.fontFamily, 'name')

        // CSSFontFeatureValuesMap
        rule.styleset.set('double-W', 0)
        assert.deepEqual(rule.styleset.get('double-W'), [0])
        assert.equal(rule.cssText, '@font-feature-values name { font-display: block; @annotation { name: 2; } @styleset { double-W: 0; } }')
        rule.styleset.set('double-W', [0, 1])
        assert.deepEqual(rule.styleset.get('double-W'), [0, 1])
        assert.equal(rule.cssText, '@font-feature-values name { font-display: block; @annotation { name: 2; } @styleset { double-W: 0 1; } }')
        rule.styleset.delete('double-W')
        assert.equal(rule.cssText, '@font-feature-values name { font-display: block; @annotation { name: 2; } }')
        assert.throws(() => rule.annotation.set('boxed', [0, 1]), INVALID_FONT_FEATURE_VALUE_ERROR)
        assert.throws(() => rule.annotation.set('boxed', [-1]), INVALID_FONT_FEATURE_VALUE_ERROR)
        assert.throws(() => rule.characterVariant.set('alpha-2', [0, 1, 2]), INVALID_FONT_FEATURE_VALUE_ERROR)
        assert.throws(() => rule.characterVariant.set('alpha-2', [-1, 0]), INVALID_FONT_FEATURE_VALUE_ERROR)
        assert.throws(() => rule.characterVariant.set('alpha-2', [100, 0]), INVALID_FONT_FEATURE_VALUE_ERROR)
        assert.throws(() => rule.ornaments.set('bullet', [0, 1]), INVALID_FONT_FEATURE_VALUE_ERROR)
        assert.throws(() => rule.ornaments.set('bullet', [-1]), INVALID_FONT_FEATURE_VALUE_ERROR)
        assert.throws(() => rule.styleset.set('double-W', [-1, 0]), INVALID_FONT_FEATURE_VALUE_ERROR)
        assert.throws(() => rule.styleset.set('double-W', [21, 0]), INVALID_FONT_FEATURE_VALUE_ERROR)
        assert.throws(() => rule.stylistic.set('alt-g', [0, 1]), INVALID_FONT_FEATURE_VALUE_ERROR)
        assert.throws(() => rule.stylistic.set('alt-g', [-1]), INVALID_FONT_FEATURE_VALUE_ERROR)
        assert.throws(() => rule.swash.set('cool', [0, 1]), INVALID_FONT_FEATURE_VALUE_ERROR)
        assert.throws(() => rule.swash.set('cool', [-1]), INVALID_FONT_FEATURE_VALUE_ERROR)
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
        assert.equal(rule.cssText, '@font-palette-values --name { base-palette: light; font-family: name; override-colors: 0 green; }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSFontPaletteValuesRule
        assert.equal(rule.name, '--name')
        assert.equal(rule.fontFamily, 'name')
        assert.equal(rule.basePalette, 'light')
        assert.equal(rule.overrideColors, '0 green')
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
        assert.equal(rule.cssText, `@function --name(${parameters.map(([input, expected = input]) => expected).join(', ')}) { @media {} result: 1; }`)
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)
        assert.equal(declarations.cssText, 'result: 1;')
        assert.equal(declarations.parentRule, rule)
        assert.equal(declarations.parentStyleSheet, styleSheet)

        // CSSGroupingRule
        assert.equal(CSSRuleList.is(rule.cssRules), true)

        // CSSFunctionRule
        assert.equal(rule.name, '--name')
        assert.equal(rule.returnType, '*')

        // CSSFunctionDeclarations
        assert.equal(CSSFunctionDescriptors.is(declarations.style), true)
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

        assert.deepEqual(rule.getParameters(), [
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
    test('properties', async () => {

        const styleSheet = createStyleSheet('@import "./sheet.css";')
        let rule = styleSheet.cssRules[0]

        await CSSImportRule.convert(globalThis, rule)._promise

        // CSSRule
        assert.equal(rule.cssText, '@import url("./sheet.css");')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSImportRule
        assert.equal(rule.href, './sheet.css')
        assert.equal(rule.layerName, null)
        assert.equal(MediaList.is(rule.media), true)
        assert.equal(rule.media.mediaText, '')
        assert.equal(rule.supportsText, null)
        assert.equal(CSSStyleSheet.is(rule.styleSheet), true)

        // Imported CSSStyleSheet and StyleSheet properties
        assert.equal(rule.styleSheet.disabled, false)
        assert.equal(rule.styleSheet.href, `${baseURL}/sheet.css`)
        assert.equal(rule.styleSheet.ownerNode, null)
        assert.equal(rule.styleSheet.ownerRule, rule)
        assert.equal(MediaList.is(rule.styleSheet.media), true)
        assert.notEqual(rule.styleSheet.media, rule.media)
        assert.equal(rule.styleSheet.media.mediaText, rule.media.mediaText)
        assert.equal(rule.styleSheet.parentStyleSheet, styleSheet)
        assert.equal(rule.styleSheet.title, '')
        assert.equal(rule.styleSheet.type, 'text/css')

        // Alternative CSSImportRule attribute syntax
        rule = createStyleSheet('@import url(./global.css) layer supports(color: green) all;').cssRules[0]
        assert.equal(rule.href, './global.css')
        assert.equal(rule.layerName, '')
        assert.equal(rule.supportsText, 'color: green')
        assert.equal(rule.cssText, '@import url("./global.css") layer supports(color: green);')
        rule = createStyleSheet('@import url("./global.css") layer(global) all;').cssRules[0]
        assert.equal(rule.href, './global.css')
        assert.equal(rule.layerName, 'global')
        assert.equal(rule.cssText, '@import url("./global.css") layer(global);')

        await CSSImportRule.convert(globalThis, rule)._promise
    })
    test('fetch an @import', async () => {

        const failures = [
            '@import "sheet.css" supports(unknown)',
            '@import "sheet.css" not all',
            '@import "http://invalid:url/sheet.css"',
            '@import "not-found.css"',
            `@import url("${crossOrigin}/sheet.css" cross-origin(anonymous))`,
            `@import url("${crossOrigin}/sheet.css?allow-origin=${crossOrigin}" cross-origin(anonymous))`,
            `@import url("${crossOrigin}/sheet.css?allow-origin=${baseURL}" cross-origin(use-credentials))`,
            `@import url("${crossOrigin}/sheet.css?allow-origin=*&allow-credentials=true" cross-origin(use-credentials))`,
            `@import url("${crossOrigin}/sheet.css?allow-origin=${baseURL}&allow-credentials=true&allow-headers=*" cross-origin(use-credentials))`,
            `@import url("${crossOrigin}/sheet.css?allow-origin=${baseURL}&allow-credentials=true&allow-methods=*" cross-origin(use-credentials))`,
            `@import url("${crossOrigin}/sheet.css?allow-origin=${baseURL}&allow-credentials=true&expose-headers=*" cross-origin(use-credentials))`,
        ]
        await Promise.all(failures.map(async input => {
            const rule = createStyleSheet(input).cssRules[0]
            await CSSImportRule.convert(globalThis, rule)._promise
            assert.equal(rule.styleSheet, null)
        }))

        const successes = [
            // Absolute and relative paths
            [`@import "${baseURL}/sheet.css"`],
            ['@import "sheet.css"'],
            ['@import "/sheet.css"'],
            // Redirected
            // https://github.com/nodejs/undici/issues/4647
            // [`@import "${crossOrigin}/redirected.css?url=${baseURL}/sheet.css"`],
            // [`@import "redirected.css?url=${crossOrigin}/sheet.css"`, false],
            // Encoding
            ['@import "bom-utf-8.css"'],
            ['@import "bom-utf-16be.css"'],
            ['@import "bom-utf-16le.css"'],
            ['@import "shift-jis.css"', 'style { content: "��"; }'],
            ['@import "shift-jis.css?charset=shift-jis"', 'style { content: "￥"; }'],
            ['@import "shift-jis.css"', 'style { content: "￥"; }', 'shift-jis'],
            ['@import "charset-shift-jis.css"', 'style { content: "￥"; }'],
            ['@import "charset-utf-16.css"'],
            ['@import "charset-utf-16be.css"'],
            ['@import "bom-utf-8.css?charset=shift-jis"'],
            ['@import "bom-utf-8-charset-shift-jis.css"'],
            ['@import "charset-utf-16.css?charset=utf-8"'],
            ['@import "charset-utf-16.css?charset=utf-16"', ''],
            // Cross-origin
            [`@import url("${crossOrigin}/sheet.css?allow-origin=${baseURL}" cross-origin(anonymous))`, false],
            [`@import url("${crossOrigin}/sheet.css?allow-origin=*" cross-origin(anonymous))`, false],
            [`@import url("${crossOrigin}/sheet.css?allow-origin=${baseURL}&allow-credentials=true" cross-origin(use-credentials))`, false],
        ]
        await Promise.all(successes.map(async ([input, expected = 'style { content: "€"; }', encoding]) => {
            const rule = createStyleSheet(input, { encoding }).cssRules[0]
            await CSSImportRule.convert(globalThis, rule)._promise
            assert.equal(CSSStyleSheet.is(rule.styleSheet), true)
            if (expected === '') {
                assert.equal(rule.styleSheet.cssRules[0]?.cssText, undefined)
            } else if (expected) {
                assert.equal(rule.styleSheet.cssRules[0]?.cssText, expected)
            } else {
                assert.throws(() => rule.styleSheet.cssRules, ACCESS_THIRD_PARTY_STYLESHEET_ERROR)
                assert.throws(() => rule.styleSheet.rules, ACCESS_THIRD_PARTY_STYLESHEET_ERROR)
            }
        }))
    })
    test('cicular @import', async () => {

        const styleSheet = createStyleSheet('@import "circular-a.css";')

        const a = styleSheet.cssRules[0]
        await CSSImportRule.convert(globalThis, a)._promise
        assert.notEqual(a.styleSheet, null)
        const b = a.styleSheet.cssRules[0]
        await CSSImportRule.convert(globalThis, b)._promise
        assert.notEqual(b.styleSheet, null)
        const circular = b.styleSheet.cssRules[0]
        await CSSImportRule.convert(globalThis, circular)._promise
        assert.equal(circular.styleSheet, null)
    })
})
describe('CSSKeyframeRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@keyframes name { to { color: green } }')
        const parentRule = styleSheet.cssRules[0]
        const rule = parentRule.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '100% { color: green; }')
        assert.equal(rule.parentRule, parentRule)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSKeyframeRule
        assert.equal(rule.keyText, '100%')
        rule.keyText = 'from'
        assert.equal(rule.keyText, '0%')
        assert.equal(rule.cssText, '0% { color: green; }')
        assert.throws(() => rule.keyText = '101%', SET_INVALID_KEYFRAME_SELECTOR_ERROR)
        assert.equal(CSSKeyframeProperties.is(rule.style), true)
    })
})
describe('CSSKeyframesRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@keyframes name { 100% {} }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '@keyframes name { 100% {} }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSKeyframesRule
        assert.equal(CSSRuleList.is(rule.cssRules), true)
        assert.equal(rule.length, 1)
        assert.equal(rule[0], rule.cssRules[0])
        assert.equal(rule.name, 'name')
        rule.name = '\n'
        assert.equal(rule.name, '\\a')
        assert.equal(rule.cssText, '@keyframes \\a { 100% {} }')
        assert.throws(() => rule.name = '', SET_INVALID_KEYFRAMES_NAME_ERROR)
    })
    test('methods', () => {

        const rule = createStyleSheet('@keyframes name {}').cssRules[0]
        const keyframes = rule.cssRules

        assert.equal(keyframes.length, 0)

        rule.appendRule('to { color: orange }')

        assert.equal(rule.findRule('to'), keyframes[0])
        assert.equal(rule.findRule('100%'), keyframes[0])
        assert.equal(keyframes.length, 1)
        assert.equal(keyframes[0].style.color, 'orange')
        assert.throws(() => rule.appendRule('invalid'), INVALID_RULE_ERROR)

        rule.appendRule('to { color: green }')
        const to = keyframes[1]

        assert.equal(keyframes.length, 2)
        assert.equal(to.style.color, 'green')
        assert.equal(rule.findRule('to'), to)

        rule.deleteRule('to')

        assert.equal(keyframes.length, 1)
        assert.equal(to.parentRule, null)
        assert.equal(rule.findRule('to'), keyframes[0])

        rule.appendRule('50%, 100% {}')

        assert.equal(keyframes.length, 2)
        assert.equal(rule.findRule('50%'), null)
        assert.equal(rule.findRule('100%, 50%'), null)
        assert.equal(rule.findRule('50%, 100%'), keyframes[1])
        assert.equal(rule.findRule('50%,100%'), keyframes[1])

        rule.deleteRule('50%')

        assert.equal(keyframes.length, 2)

        rule.deleteRule('50%, 100%')

        assert.equal(keyframes.length, 1)
    })
})
describe('CSSLayerBlockRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@layer name { style {} }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '@layer name { style {} }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSGroupingRule
        assert.equal(CSSRuleList.is(rule.cssRules), true)

        // CSSLayerBlockRule
        assert.equal(rule.name, 'name')
    })
})
describe('CSSLayerStatementRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@layer name;')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '@layer name;')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSLayerStatementRule
        assert.equal(rule.nameList, 'name')
    })
})
describe('CSSMarginRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@page { @top-left { color: green } }')
        const parentRule = styleSheet.cssRules[0]
        const rule = parentRule.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '@top-left { color: green; }')
        assert.equal(rule.parentRule, parentRule)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSMarginRule
        assert.equal(rule.name, 'top-left')
        assert.equal(CSSMarginDescriptors.is(rule.style), true)
    })
})
describe('CSSMediaRule', () => {
    test('properties', () => {

        let styleSheet = createStyleSheet('@media all { style {} }')
        let rule = styleSheet.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '@media all { style {} }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSGroupingRule
        assert.equal(CSSRuleList.is(rule.cssRules), true)

        // CSSConditionRule
        assert.equal(rule.conditionText, 'all')

        // CSSMediaRule
        assert.equal(MediaList.is(rule.media), true)
        assert.equal(rule.matches, true)

        styleSheet = new globalThis.CSSStyleSheet()
        styleSheet.insertRule('@media all {}')
        rule = styleSheet.cssRules[0]

        assert.equal(rule.matches, false)
        document.adoptedStyleSheets.push(styleSheet)
        assert.equal(rule.matches, true)
    })
})
describe('CSSNamespaceRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@namespace svg "http://www.w3.org/2000/svg";')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '@namespace svg url("http://www.w3.org/2000/svg");')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSNamespaceRule
        assert.equal(rule.namespaceURI, 'http://www.w3.org/2000/svg')
        assert.equal(rule.prefix, 'svg')
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
            assert.equal(rule.cssText, 'color: green;')
            assert.equal(rule.parentRule, parentRule)
            assert.equal(rule.parentStyleSheet, styleSheet)

            // CSSNestedDeclarations
            assert.equal(CSSStyleProperties.is(rule.style), true)
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
        assert.equal(rule.cssText, '@page intro { @top-left {} color: green; }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)
        assert.equal(declarations.cssText, 'color: green;')
        assert.equal(declarations.parentRule, rule)
        assert.equal(declarations.parentStyleSheet, styleSheet)

        // CSSGroupingRule
        assert.equal(CSSRuleList.is(rule.cssRules), true)

        // CSSPageRule
        assert.equal(rule.selectorText, 'intro')
        rule.selectorText = 'outro'
        assert.equal(rule.selectorText, 'outro')
        assert.equal(CSSPageDescriptors.is(rule.style), true)

        // CSSPageDeclarations
        assert.equal(CSSPageDescriptors.is(declarations.style), true)
    })
})
describe('CSSPositionTryRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@position-try --name { top: 1px } }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '@position-try --name { top: 1px; }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSPositionTryRule
        assert.equal(rule.name, '--name')
        assert.equal(CSSPositionTryDescriptors.is(rule.style), true)
    })
})
describe('CSSPropertyRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@property --name { syntax: "*"; inherits: true }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '@property --name { syntax: "*"; inherits: true; }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSPropertyRule
        assert.equal(rule.name, '--name')
        assert.equal(rule.syntax, '"*"')
        assert.equal(rule.inherits, 'true')
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
        assert.equal(rule.cssText, '@scope (start) to (end) { style {} color: green; }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSGroupingRule
        assert.equal(CSSRuleList.is(rule.cssRules), true)

        // CSSLayerBlockRule
        assert.equal(rule.end, 'end')
        assert.equal(rule.start, 'start')
    })
})
describe('CSSStartingStyleRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@starting-style { style {} }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '@starting-style { style {} }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSGroupingRule
        assert.equal(CSSRuleList.is(rule.cssRules), true)
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
        assert.equal(styleRule.cssText, 'style { @scope { scoped { & nested {} } } & nested {} color: green; }')
        assert.equal(scopedStyleRule.cssText, 'scoped { & nested {} }')
        assert.equal(nestedStyleRule.cssText, '& nested {}')
        assert.equal(styleRule.parentRule, null)
        assert.equal(scopedStyleRule.parentRule, scopeRule)
        assert.equal(nestedStyleRule.parentRule, styleRule)
        assert.equal(styleRule.parentStyleSheet, styleSheet)
        assert.equal(scopedStyleRule.parentStyleSheet, styleSheet)
        assert.equal(nestedStyleRule.parentStyleSheet, styleSheet)

        // CSSGroupingRule
        assert.equal(CSSRuleList.is(styleRule.cssRules), true)
        assert.equal(CSSRuleList.is(scopedStyleRule.cssRules), true)
        assert.equal(CSSRuleList.is(nestedStyleRule.cssRules), true)

        // CSSStyleRule
        assert.equal(styleRule.selectorText, 'style')
        assert.equal(scopedStyleRule.selectorText, 'scoped')
        assert.equal(nestedStyleRule.selectorText, '& nested')
        styleRule.selectorText = 'parent'
        scopedStyleRule.selectorText = 'scoped-parent'
        nestedStyleRule.selectorText = 'child'
        assert.equal(styleRule.selectorText, 'parent')
        assert.equal(scopedStyleRule.selectorText, 'scoped-parent')
        assert.equal(nestedStyleRule.selectorText, '& child')
        assert.equal(CSSStyleProperties.is(styleRule.style), true)
        assert.equal(CSSStyleProperties.is(scopedStyleRule.style), true)
        assert.equal(CSSStyleProperties.is(nestedStyleRule.style), true)
    })
    test('methods', () => {

        const { cssRules: [rule] } = createStyleSheet('style {}')
        const { cssRules } = rule

        assert.equal(cssRules.length, 0)

        rule.insertRule('@media screen {}')

        assert.throws(() => rule.insertRule('style {}', -1), INVALID_RULE_INDEX_ERROR)
        assert.throws(() => rule.insertRule(' '), MISSING_RULE_ERROR)
        assert.throws(() => rule.insertRule('style {};'), EXTRA_RULE_ERROR)
        assert.throws(() => rule.insertRule('style;'), INVALID_RULE_ERROR)
        assert.throws(() => rule.insertRule('@charset "utf-8";'), INVALID_RULE_ERROR)
        assert.throws(() => rule.insertRule('@import "./global.css";'), INVALID_RULE_ERROR)
        assert.throws(() => rule.insertRule('@media screen;'), INVALID_RULE_ERROR)

        rule.insertRule('@media print {}')

        assert.equal(cssRules.length, 2)

        rule.insertRule('@media all {}', 2)
        const mediaRule = cssRules[0]

        assert.equal(cssRules.length, 3)
        assert.equal(mediaRule.conditionText, 'print')
        assert.equal(cssRules[1].conditionText, 'screen')
        assert.equal(cssRules[2].conditionText, 'all')

        rule.deleteRule(0)

        assert.equal(cssRules.length, 2)
        assert.equal(mediaRule.parentRule, null)
        assert.equal(cssRules[0].conditionText, 'screen')
        assert.equal(cssRules[1].conditionText, 'all')
    })
})
describe('CSSSupportsRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@supports (color: green) { style {} }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '@supports (color: green) { style {} }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSGroupingRule
        assert.equal(CSSRuleList.is(rule.cssRules), true)

        // CSSConditionRule
        assert.equal(rule.conditionText, '(color: green)')

        // CSSSupportsRule
        assert.equal(rule.matches, true)
    })
})
describe('CSSViewTransitionRule', () => {
    test('properties', () => {

        const styleSheet = createStyleSheet('@view-transition { navigation: none; types: type-1 type-2 }')
        const rule = styleSheet.cssRules[0]

        // CSSRule
        assert.equal(rule.cssText, '@view-transition { navigation: none; types: type-1 type-2; }')
        assert.equal(rule.parentRule, null)
        assert.equal(rule.parentStyleSheet, styleSheet)

        // CSSViewTransitionRule
        assert.equal(rule.navigation, 'none')
        assert.deepEqual(rule.types, ['type-1', 'type-2'])
        assert.throws(() => rule.types.push('type-3'), TypeError)
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
    assert.throws(() => rule.cssText = 'override {}')
})

describe('CSS grammar - syntax', () => {
    test('at-rule start with <at-keyword-token> and only end with ; or {} block', () => {
        const { cssRules } = createStyleSheet(`
            @media ; {}
            style-1 {}
            @media } style {}
            style-2 {}
        `)
        assert.equal(cssRules.length, 3)
        assert.equal(cssRules[0].cssText, 'style-1 {}')
        assert.equal(cssRules[1].cssText, '@media not all {}')
        assert.equal(cssRules[2].cssText, 'style-2 {}')
    })
    test('qualified rules start with anything but <at-keyword-token> and only end with {} block', () => {
        const { cssRules } = createStyleSheet(`
            color: red ; style {}
            style-1 {}
            color: red } style {}
            style-2 {}
        `)
        assert.equal(cssRules.length, 2)
        assert.equal(cssRules[0].cssText, 'style-1 {}')
        assert.equal(cssRules[1].cssText, 'style-2 {}')
    })
    test('top-level rule starting like a custom property declaration', () => {
        const { cssRules } = createStyleSheet(`
            --custom:hover {}
            --custom: hover {}
            --custom :hover {}
            --custom a:hover {}
        `)
        assert.equal(cssRules.length, 1)
        assert.equal(cssRules[0].cssText, '--custom a:hover {}')
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
        assert.equal(cssRules.length, 5)
        assert.equal(cssRules[0].cssText, 'style-1 { --custom: ; }')
        assert.equal(cssRules[1].cssText, 'style-2 {}')
        assert.equal(cssRules[2].cssText, 'style-3 { color: green; }')
        assert.equal(cssRules[3].cssText, 'style-4 {}')
        assert.equal(cssRules[4].cssText, '@font-face {}')
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
        assert.equal(cssRules.length, 2)
        assert.equal(cssRules[0].cssText, 'style { color: green; }')
        assert.equal(cssRules[1].cssText, '@font-face {}')
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
        assert.equal(styleSheet.cssRules[0].cssText, 'style { --custom:  !important; }')
        assert.equal(styleSheet.cssRules[1].cssText, '@font-face { src: local("serif"); }')
    })
    test('! and ; are not interpreted as bad tokens when nested in a block or function', () => {

        const values = ['fn(!)', '[!]', '{!}', 'fn(;)', '[;]', '{;}']
        const declarations = values.map((value, index) => `--custom-${index}: ${value}`).join('; ')
        const { cssRules } = createStyleSheet(`
            style { ${declarations}; }
            @media (;) {}
        `)

        assert.equal(cssRules[0].cssText, `style { ${declarations}; }`)
        assert.equal(cssRules[1].cssText, '@media (;) {}')
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
        assert.equal(cssRules[0].cssText, 'style { color: ({} 1) var(--custom) (1 {}); & style:hover {} }')
        assert.equal(cssRules[1].cssText, '@font-face { src: local("serif"); }')
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
        assert.equal(styleSheet.cssRules[0].cssText, 'style { --custom: 1 {} 1; }')
    })
    test('unclosed rule, declaration, function', () => {
        let styleSheet = createStyleSheet('style { & { color: var(--custom) fn(')
        assert.equal(styleSheet.cssRules[0].cssText, 'style { & { color: var(--custom) fn(); } }')
        styleSheet = createStyleSheet('style { & { color: var(--custom, fn(')
        assert.equal(styleSheet.cssRules[0].cssText, 'style { & { color: var(--custom, fn()); } }')
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
        assert.equal(styleSheet.cssRules.length, 0)
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

        assert.equal(cssRules.length, 2)
        assert.equal(cssRules[1].style.color, 'green')
    })
    test('top-level - ignored @import following any non-ignored rule other than @layer', () => {

        const { cssRules } = createStyleSheet(`
            @namespace svg "http://www.w3.org/2000/svg";
            @import "./global.css";
        `)

        assert.equal(cssRules.length, 1)
        assert.equal(CSSNamespaceRule.is(cssRules[0]), true)
    })
    test('top-level - ignored @import following @layer interleaved after another @import', async () => {

        const { cssRules } = createStyleSheet(`
            @import "./global.css";
            @layer name;
            @import "./page.css";
        `)

        assert.equal(cssRules.length, 2)
        assert.equal(CSSLayerStatementRule.is(cssRules[1]), true)

        await CSSImportRule.convert(globalThis, cssRules[0])._promise
    })
    test('top-level - @import following @layer or ignored rules', async () => {

        const { cssRules } = createStyleSheet(`
            @layer name;
            @charset "utf-8";
            @namespace <bad-string-or-url>;
            @import "./global.css";
        `)

        assert.equal(cssRules.length, 2)
        assert.equal(CSSImportRule.is(cssRules[1]), true)

        await CSSImportRule.convert(globalThis, cssRules[1])._promise
    })
    test('top-level - @import following ignored rules interleaved after another @import', async () => {

        const { cssRules } = createStyleSheet(`
            @import "./global.css";
            @charset "utf-8";
            @namespace <bad-string-or-url>;
            @layer <bad-ident>;
            @import "./page.css";
        `)

        assert.equal(cssRules.length, 2)
        assert.equal(CSSImportRule.is(cssRules[1]), true)

        await CSSImportRule.convert(globalThis, cssRules[0])._promise
        await CSSImportRule.convert(globalThis, cssRules[1])._promise
    })
    test('top-level - ignored @namespace following any non-ignored rule other than @import or @layer', () => {

        const { cssRules } = createStyleSheet(`
            style {}
            @namespace svg "http://www.w3.org/2000/svg";
        `)

        assert.equal(cssRules.length, 1)
        assert.equal(CSSStyleRule.is(cssRules[0]), true)
    })
    test('top-level - ignored @namespace following @layer interleaved after another @namespace', () => {

        const { cssRules } = createStyleSheet(`
            @namespace html "https://www.w3.org/1999/xhtml/";
            @layer name;
            @namespace svg "http://www.w3.org/2000/svg";
        `)

        assert.equal(cssRules.length, 2)
        assert.equal(CSSLayerStatementRule.is(cssRules[1]), true)
    })
    test('top-level - ignored @namespace following @layer interleaved after @import', async () => {

        const { cssRules } = createStyleSheet(`
            @import "./global.css";
            @layer name;
            @namespace svg "http://www.w3.org/2000/svg";
        `)

        assert.equal(cssRules.length, 2)
        assert.equal(CSSLayerStatementRule.is(cssRules[1]), true)

        await CSSImportRule.convert(globalThis, cssRules[0])._promise
    })
    test('top-level - @namespace following @import, @layer, ignored rules', async () => {

        const { cssRules } = createStyleSheet(`
            @layer name;
            @import "./global.css";
            @charset "utf-8";
            @namespace svg "http://www.w3.org/2000/svg";
        `)

        assert.equal(cssRules.length, 3)
        assert.equal(CSSNamespaceRule.is(cssRules[2]), true)

        await CSSImportRule.convert(globalThis, cssRules[1])._promise
    })
    test('top-level - @namespace following ignored rules interleaved after another @namespace', () => {

        const { cssRules } = createStyleSheet(`
            @namespace html "https://www.w3.org/1999/xhtml/";
            @charset "utf-8";
            @import <bad-string-or-url>;
            @layer <bad-ident>;
            @namespace svg "http://www.w3.org/2000/svg";
        `)

        assert.equal(cssRules.length, 2)
        assert.equal(CSSNamespaceRule.is(cssRules[1]), true)
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
        assert.equal(styleSheet.cssRules[0].cssText, '@color-profile --name { src: url("profile.icc"); }')
    })
    test('@color-profile - valid block contents', () => {
        const input = `
            @COLOR-PROFILE --name {
                COMPONENTS: {env(name)};
                src: first-valid(url("profile.icc"));
            }
        `
        const styleSheet = createStyleSheet(input)
        assert.equal(styleSheet.cssRules[0].cssText, normalizeText(input))
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
        assert.equal(styleSheet.cssRules[0].cssText, '@container name { @media {} }')
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
        assert.equal(styleSheet.cssRules[0].cssText, input.toLowerCase())
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
        assert.equal(rule1.cssText, '@counter-style name-one { system: numeric; }')
        assert.equal(rule2.cssText, '@counter-style name-two { system: numeric; }')
    })
    test('@counter-style - valid block contents', () => {
        const input = `
            @COUNTER-STYLE name {
                PAD: {env(name)};
                system: first-valid(numeric);
            }
        `
        const styleSheet = createStyleSheet(input)
        assert.equal(styleSheet.cssRules[0].cssText, normalizeText(input))
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
        assert.equal(styleSheet.cssRules[0].cssText, '@font-face { font-family: name; }')
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
            assert.equal(styleSheet.cssRules[0].cssText, normalizeText(input))
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
        assert.equal(styleSheet.cssRules[0].cssText, '@font-feature-values name { font-display: block; }')
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
        assert.equal(styleSheet.cssRules[0].cssText, input.toLowerCase())

        const declarations = [
            'FONT-DISPLAY: {env(name)}',
            'font-display: first-valid(block)',
        ]
        declarations.forEach(declaration => {
            const input = `@FONT-FEATURE-VALUES name { ${declaration}; }`
            const styleSheet = createStyleSheet(input)
            assert.equal(styleSheet.cssRules[0].cssText, normalizeText(input))
        })
    })
    test('@font-palette-values - missing declaration for font-family', () => {
        assert.equal(createStyleSheet('@font-palette-values --name {}').cssRules.length, 0)
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
        assert.equal(styleSheet.cssRules[0].cssText, '@font-palette-values --name { font-family: name; }')
    })
    test('@font-palette-values - valid block contents', () => {
        const input = `
            @FONT-PALETTE-VALUES --name {
                BASE-PALETTE: {env(name)};
                font-family: first-valid(name);
            }
        `
        const styleSheet = createStyleSheet(input)
        assert.equal(styleSheet.cssRules[0].cssText, normalizeText(input))
    })
    test('@function - invalid prelude', () => {
        const styleSheet = createStyleSheet('@function --name(--parameter-1, --parameter-2, --parameter-2) {}')
        assert.equal(styleSheet.cssRules.length, 0)
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
        assert.equal(styleSheet.cssRules[0].cssText, '@function --name() { @media {} }')
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
        assert.equal(styleSheet.cssRules[0].cssText, input.toLowerCase())
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
        assert.equal(styleSheet.cssRules[0].cssText, '@keyframes name { 0% {} }')
    })
    test('@keyframes - valid block contents', () => {
        const styleSheet = createStyleSheet('@KEYFRAMES name { 0% {} }')
        assert.equal(styleSheet.cssRules[0].cssText, '@keyframes name { 0% {} }')
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
        assert.equal(styleSheet.cssRules[0].cssText, '@layer { @media {} }')
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
        assert.equal(styleSheet.cssRules[0].cssText, input.toLowerCase())
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
        assert.equal(styleSheet.cssRules[0].cssText, '@media { @media {} }')
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
        assert.equal(styleSheet.cssRules[0].cssText, input.toLowerCase())
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
        assert.equal(styleSheet.cssRules[0].cssText, '@page { @top-left {} }')
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
            assert.equal(styleSheet.cssRules[0].cssText, normalizeText(input))
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
        assert.equal(styleSheet.cssRules[0].cssText, '@position-try --name { bottom: 1px; }')
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
            assert.equal(styleSheet.cssRules[0].cssText, normalizeText(input))
        })
    })
    test('@property - missing declaration for inherits', () => {
        assert.equal(createStyleSheet('@property --name { syntax: "*"; initial-value: 1; }').cssRules.length, 0)
    })
    test('@property - missing declaration for syntax', () => {
        assert.equal(createStyleSheet('@property --name { inherits: true; initial-value: 1; }').cssRules.length, 0)
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
        assert.equal(styleSheet.cssRules[0].cssText, '@property --name { syntax: "*"; inherits: true; }')
    })
    test('@property - valid block contents', () => {
        const declarations = [
            'INHERITS: {env(name)}',
            'inherits: first-valid(false)',
        ]
        declarations.forEach(declaration => {
            const input = `@PROPERTY --name { syntax: "*"; ${declaration}; }`
            const styleSheet = createStyleSheet(input)
            assert.equal(styleSheet.cssRules[0].cssText, normalizeText(input))
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
                assert.equal(styleSheet.cssRules.length, index)
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
        assert.equal(styleSheet.cssRules[0].cssText, '@scope { @media {} }')
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

        assert.equal(styleSheet.cssRules[0].cssText, input.toLowerCase())

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
            assert.equal(styleSheet.cssRules[0].cssText, normalizeText(input))
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
        assert.equal(styleSheet.cssRules[0].cssText, '@starting-style { @media {} }')
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
        assert.equal(styleSheet.cssRules[0].cssText, input.toLowerCase())
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
        assert.equal(styleSheet.cssRules[0].cssText, '@supports (color: green) { @media {} }')
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
        assert.equal(styleSheet.cssRules[0].cssText, input.toLowerCase())
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
        assert.equal(styleSheet.cssRules[0].cssText, '@view-transition { navigation: auto; }')
    })
    test('@view-transition - valid block contents', () => {
        const declarations = [
            'NAVIGATION: {env(name)}',
            'navigation: first-valid(auto)',
        ]
        declarations.forEach(declaration => {
            const input = `@VIEW-TRANSITION { ${declaration}; }`
            const styleSheet = createStyleSheet(input)
            assert.equal(styleSheet.cssRules[0].cssText, normalizeText(input))
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
        assert.equal(styleSheet.cssRules[0].cssText, '@font-feature-values name {}')
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
        assert.equal(styleSheet.cssRules[0].cssText, input.toLowerCase())
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
        assert.equal(styleSheet.cssRules[0].cssText, '@keyframes name { 0% { animation-timing-function: linear; } }')
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
            assert.equal(styleSheet.cssRules[0].cssText, `@keyframes name { 0% { ${normalizeText(declaration)}; } }`)
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
        assert.equal(styleSheet.cssRules[0].cssText, '@page { @top-left { margin-bottom: 1px; } }')
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
            assert.equal(styleSheet.cssRules[0].cssText, normalizeText(input))
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
        assert.equal(styleSheet.cssRules[0].cssText, 'style { @media { @media {} } }')
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

        assert.equal(styleSheet.cssRules[0].cssText, input.toLowerCase())

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
            assert.equal(styleSheet.cssRules[0].cssText, normalizeText(input))
        })
    })
    test('nested conditional rule inside @function - invalid block contents', () => {

        const styleSheet = createStyleSheet(`
            @function --name() {
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
                    @scope {}
                    @starting-style {}
                    @view-transition {}
                    0% {}
                    style {}

                    color: red;

                    result: 1 !important;

                    @media {}
                }
            }
        `)
        assert.equal(styleSheet.cssRules[0].cssText, '@function --name() { @media { @media {} } }')
    })
    test('nested conditional rule inside @function - valid block contents', () => {
        const contents = [
            '@container name {}',
            '@media {}',
            '@supports (color: green) {}',
            '--custom: 1;',
            'RESULT: {env(name)};',
        ]
        const input = `@FUNCTION --name() { @media { ${contents.join(' ')} } }`
        const styleSheet = createStyleSheet(input)
        assert.equal(styleSheet.cssRules[0].cssText, input.toLowerCase())
    })
    test('nested style rule - invalid prelude containing an undeclared namespace prefix', () => {
        const styleSheet = createStyleSheet(`
            @namespace svg "http://www.w3.org/2000/svg";
            style {
                html|nested {}
                svg|nested {}
            }
        `)
        assert.equal(styleSheet.cssRules[1].cssText, 'style { & svg|nested {} }')
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
        assert.equal(styleSheet.cssRules[0].cssText, 'style { & { @media {} } }')
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

        assert.equal(styleSheet.cssRules[0].cssText, input.toLowerCase())

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
            assert.equal(styleSheet.cssRules[0].cssText, normalizeText(input))
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
        assert.equal(styleSheet.cssRules[0].cssText, 'style { color: green; }')
    })
    test('style rule - invalid prelude containing an undeclared namespace prefix', () => {

        const { cssRules } = createStyleSheet(`
            @namespace svg "http://www.w3.org/2000/svg";
            svg|rect { fill: green }
            SVG|rect { fill: red }
            @namespace html "https://www.w3.org/1999/xhtml/";
            html|type {}
        `)

        assert.equal(cssRules.length, 2)

        const styleRule = cssRules[1]

        assert.equal(CSSStyleRule.is(styleRule), true)

        const { selectorText, style } = styleRule

        assert.equal(selectorText, 'svg|rect')
        assert.equal(style.fill, 'green')
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
        assert.equal(styleSheet.cssRules[0].cssText, 'style { @media {} }')
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

        assert.equal(styleSheet.cssRules[0].cssText, input.toLowerCase())

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
            assert.equal(styleSheet.cssRules[0].cssText, normalizeText(input))
        })
    })
    // Legacy names
    test('legacy rule name', () => {
        const rule = createStyleSheet('@-webkit-keyframes name {}').cssRules[0]
        assert.equal(CSSKeyframesRule.is(rule), true)
        assert.equal(rule.cssText, '@keyframes name {}')
    })
    test('legacy property name', () => {
        const styleSheet = createStyleSheet('style { -webkit-order: 1 }')
        assert.equal(styleSheet.cssRules[0].cssText, 'style { order: 1; }')
    })
})
