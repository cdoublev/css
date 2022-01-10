
const { insertCSSRule, removeCSSRule } = require('./CSSRule-impl.js')
const { parseCSSGrammar, parseRule, parseRuleList, parseStyleBlock } = require('../parse/syntax.js')
const CSSImportRule = require('./CSSImportRule.js')
const CSSMarginRule = require('./CSSMarginRule.js')
const CSSMediaRule = require('./CSSMediaRule.js')
const CSSNamespaceRule = require('./CSSNamespaceRule.js')
const CSSPageRule = require('./CSSPageRule.js')
const CSSRuleList = require('./CSSRuleList.js')
const CSSStyleRule = require('./CSSStyleRule.js')
const CSSStyleSheet = require('./CSSStyleSheet.js')
const CSSSupportsRule = require('./CSSSupportsRule.js')
const DOMException = require('domexception')
const MediaList = require('./MediaList.js')
const { implementation: StyleSheetImpl, parseStyleSheet } = require('./StyleSheet-impl.js')
const aliases = require('../properties/compatibility.js')
const { parseValue } = require('./CSSStyleDeclaration-impl.js')
const { serializeMediaQueryList } = require('../serialize.js')

/**
 * TODO:
 * - CSSCharsetRule: @charset <???-charset-name>;
 * - CSSCounterStyleRule: @counter-style <counter-style-name> { <declaration-list> }
 * - CSSFontFaceRule: @font-face { <declaration-list> }
 * - CSSFontFeatureValuesRule: @font-feature-values <family-name># { <declaration-list> }
 * - CSSKeyframeRule: <keyframe-selector># { <declaration-list> }
 * - CSSKeyframesRule: @keyframes <keyframes-name> { <rule-list> }
 * - CSSNestingRule: @nest <selector-list> { <style-block> }
 * - CSSPropertyRule: @property <custom-property-name> { <declaration-list> }
 */
const definitions = {
    'import': {
        create: CSSImportRule.create,
        prelude: '[<url> | <string>] [supports(<supports-condition> | <declaration>)]? <media-query-list>?',
    },
    ...[
        'top-left-corner',
        'top-left',
        'top-center',
        'top-right',
        'top-right-corner',
        'bottom-left-corner',
        'bottom-left',
        'bottom-center',
        'bottom-right',
        'bottom-right-corner',
        'left-top',
        'left-middle',
        'left-bottom',
        'right-top',
        'right-middle',
        'right-bottom',
    ].reduce((rules, name) => {
        rules[name] = {
            create: CSSMarginRule.create,
            value: '<declaration-list>',
        }
        return rules
    }, {}),
    'media': {
        create: CSSMediaRule.create,
        prelude: '<media-query-list>',
        value: '<stylesheet>',
    },
    'namespace': {
        create: CSSNamespaceRule.create,
        prelude: '<namespace-prefix>? [<string> | <url>]',
    },
    'page': {
        create: CSSPageRule.create,
        prelude: '<page-selector-list>?',
        value: '<declaration-list>',
    },
    'supports': {
        create: CSSSupportsRule.create,
        prelude: '<supports-condition>',
        value: '<stylesheet>',
    },
}

/**
 * @param {string}
 * @returns {CSSStyleSheet}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet}
 * @see {@link https://github.com/whatwg/html/issues/2997}
 *
 * TODO: discard at-rules nested in style rule.
 *
 * TODO: handle `parentRule` property for `CSSRule`and `CSSStyleDeclaration` and
 * `parentStyleSheet` for `CSSRule` and `StyleSheet`.
 */
function parseCSSStyleSheet(input, properties) {
    const { value } = parseStyleSheet(input)
    const cssRules = value.reduce((rules, { name, prelude, value }) => {
        // at-rule
        if (name) {
            const { value: ruleName } = name
            const definition = definitions[ruleName]
            prelude = parseCSSGrammar(prelude, definition.prelude)
            if (prelude === null) {
                console.error(`Parse error: invalide prelude for @${ruleName}`)
                return rules
            }
            let component
            if (value) {
                value = parseCSSGrammar(prelude, definition.value)
                if (!value) {
                    console.error(`Parse error: invalid block value for @${ruleName}`)
                    return rules
                }
                component = { name, prelude, value }
            } else {
                component = { name, prelude }
            }
            rules.push(definition.create(globalThis, undefined, { component }))
            return rules
        }
        // qualified (style) rule
        prelude = parseCSSGrammar(prelude, '<selector-list>')
        if (prelude === null) {
            console.error(`Parse error: invalid selector list "${prelude}" for a style rule`)
            return rules
        }
        value = parseStyleBlock(value)
        if (value === null) {
            console.error('Parse error: invalid block value for a style rule')
            return rules
        }
        value = value.reduce((declarations, declaration) => {
            const { important, value } = declaration
            let { name } = declaration
            if (aliases.has(name)) {
                name = aliases.get(name)
            }
            const parsed = parseValue(value, name)
            if (parsed) {
                declarations.push({ important, name, value: parsed })
            } else {
                console.error(`Parse error: invalid declaration "${value}" for property "${name}"`)
            }
            return declarations
        }, [])
        debugger
        rules.push(CSSStyleRule.create(globalThis, undefined, { component: { prelude, value }}))
        return rules
    }, [])
    return CSSStyleSheet.create(globalThis, undefined, { ...properties, cssRules })
}

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssstylesheet}
 */
class CSSStyleSheetImpl extends StyleSheetImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom/#concept-css-style-sheet-type}
     */
    type = 'text/css'

    /**
     * @see {@link https://drafts.csswg.org/cssom/#concept-css-style-sheet-disallow-modification-flag}
     */
    _disallowModification = false

    /**
     * @param {object} globalObject
     * @param {*[]} args
     * @param {object} [properties]
     * @see {@link https://drafts.csswg.org/cssom/#create-a-constructed-cssstylesheet}
     * @see {@link https://drafts.csswg.org/cssom/#create-a-css-style-sheet}
     * @see {@link https://html.spec.whatwg.org/#create-a-css-style-sheet}
     */
    constructor(globalObject, args, properties) {
        super()
        this._globalObject = globalObject
        if (properties) {
            // Create a CSS style sheet (not "constructed")
            const {
                alternate = false,
                cssRules,
                disabled = false,
                location = null,
                media,
                parentStyleSheet = null,
                originClean,
                ownerCSSRule = null,
                ownerNode,
                title = '',
            } = properties
            this._alternate = alternate
            this._baseURL = null
            this._constructed = false
            this._cssRules = cssRules
            this._document = null
            this._location = location
            this._originClean = originClean
            this.disabled = disabled
            this.media = MediaList.create(globalObject)
            this.media.mediaText = media
            this.ownerNode = ownerNode
            this.ownerRule = ownerCSSRule
            this.parentStyleSheet = parentStyleSheet
            this.title = title
        } else {
            // Create a constructed CSS style sheet
            const [{ baseURL, disabled, media }] = args
            const { document } = globalObject
            const { baseURL: documentBaseURL } = document
            this._alternate = false
            this._baseURL = baseURL
            this._constructed = true
            this._cssRules = []
            this._document = document
            this._location = documentBaseURL
            this._originClean = true
            this.disabled = disabled
            this.media = MediaList.create(globalObject)
            this.media.mediaText = typeof media === 'object' ? serializeMediaQueryList(media) : media
            this.ownerNode = null
            this.ownerRule = null
            this.parentStyleSheet = null
            this.title = ''
        }
    }

    /**
     * @returns {CSSRuleList}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-cssrules}
     */
    get cssRules() {
        if (!this._originClean) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'SecurityError')
        }
        return CSSRuleList.create(this._globalObject, undefined, { rules: this._cssRules })
    }

    /**
     * @param {string} rule
     * @param {index} [index]
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-insertrule}
     */
    insertRule(rule, index = 0) {
        if (!this._originClean) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'SecurityError')
        }
        if (!this._disallowModification) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'NotAllowedError')
        }
        const parsed = parseRule(rule)
        if (parsed instanceof SyntaxError) {
            return parsed
        }
        const { name } = parsed
        if (name === 'import' && this._constructed) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'SyntaxError')
        }
        return insertCSSRule(this._cssRules, parsed, index)
    }

    /**
     * @param {number} index
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-deleterule}
     */
    deleteRule(index) {
        if (!this._originClean) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'SecurityError')
        }
        if (!this._disallowModification) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'NotAllowedError')
        }
        removeCSSRule(this._cssRules, index)
    }

    /**
     * @param {string} text
     * @returns {Promise}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-replace}
     */
    async replace(text) {
        return this.replaceSync(text)
    }

    /**
     * @param {string} text
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-replacesync}
     */
    replaceSync(text) {
        if (!this._constructed || this._disallowModification) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'NotAllowedError')
        }
        this._disallowModification = true
        try {
            // TODO: figure out if/how `parseRuleList()` can return a `CSSRule` subclass
            const rules = parseRuleList(text)
            rules.forEach((rule, index) => {
                if (CSSImportRule.is(rule)) {
                    removeCSSRule(rules, index)
                }
            })
            this._cssRules = rules
        } catch {
            this._cssRules = []
        }
        this._disallowModification = false
    }
}

module.exports = {
    implementation: CSSStyleSheetImpl,
    parseCSSStyleSheet,
}
