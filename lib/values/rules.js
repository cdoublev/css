
const properties = Object.keys(require('../properties/definitions.js'))
const keyframeProperties = require('../properties/animatable.js')
const pageProperties = require('../properties/page.js')
const pageMarginProperties = require('../properties/page-margin.js')

const pageMarginRuleNames = [
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
]

/**
 * @see {@link https://drafts.csswg.org/css-page-3/#syntax-page-selector}
 */
const pageMarginRule = {
    properties: pageMarginProperties,
    type: 'margin',
    value: '<declaration-list>',
}

/**
 * @see {@link https://drafts.csswg.org/css-nesting-1/#at-nest}
 */
const nestedStyleRules = {
    media: {
        prelude: '<media-query-list>',
    },
    nest: {
        prelude: '<selector-list>',
    },
    style: {
        prelude: '<selector-list>',
    },
    supports: {
        prelude: '<supports-condition>',
    },
}

Object.values(nestedStyleRules).forEach(nested => {
    nested.properties = properties
    nested.qualified = 'style'
    // Allow multiple nesting levels with a circular reference
    nested.rules = nestedStyleRules
    // All rules nested in style rule contains `<style-block>`
    nested.value = '<style-block>'
})

/**
 * TODO:
 * - CSSCounterStyleRule: @counter-style <counter-style-name> { <declaration-list> }
 * - CSSFontFaceRule: @font-face { <declaration-list> }
 * - CSSFontFeatureValuesRule: @font-feature-values <family-name># { <declaration-list> }
 * - CSSPropertyRule: @property <custom-property-name> { <declaration-list> }
 *
 * Not ready yet:
 * @see {@link https://drafts.csswg.org/css-contain-3/#container-rule}
 */
const rules = {
    /**
     * @see {@link https://drafts.csswg.org/css-cascade/#at-import}
     */
    import: {
        prelude: '[<url> | <string>] [supports([<supports-condition> | <declaration>])]? <media-query-list>?',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-animations-1/#keyframes}
     */
    keyframes: {
        prelude: '<keyframes-name>',
        qualified: 'keyframe',
        rules: {
            /**
             * @see {@link https://drafts.csswg.org/css-animations-1/#keyframes}
             */
            keyframe: {
                cascading: false,
                prelude: '<keyframe-selector>#',
                properties: keyframeProperties,
                value: '<declaration-list>',
            },
        },
        value: '<rule-list>',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-conditional-3/#at-media}
     */
    media: {
        prelude: '<media-query-list>',
        properties,
        qualified: 'style',
        rules: ['import', 'namespace'], // Black list
        value: '<stylesheet>',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-namespaces/#syntax}
     */
    namespace: {
        prelude: '<namespace-prefix>? [<string> | <url>]',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-page-3/#syntax-page-selector}
     */
    page: {
        prelude: '<page-selector-list>?',
        properties: pageProperties,
        rules: pageMarginRuleNames.reduce((rules, name) => {
            rules[name] = pageMarginRule
            return rules
        }, {}),
        value: '<declaration-list>',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-syntax-3/#style-rules}
     */
    style: {
        prelude: '<selector-list>',
        properties,
        qualified: 'style',
        rules: nestedStyleRules,
        value: '<style-block>',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-conditional-3/#at-supports}
     */
    supports: {
        prelude: '<supports-condition>',
        properties,
        qualified: 'style',
        rules: ['import', 'namespace'], // Black list
        value: '<stylesheet>',
    },
}

/**
 * @see {@link https://html.spec.whatwg.org/multipage/infrastructure.html#xml}
 * @see {@link https://svgwg.org/svg2-draft/types.html#ElementsInTheSVGDOM}
 *
 * "Interpret all of the resulting top-level qualified rules as style rules".
 */
const stylesheet = {
    properties,
    qualified: 'style',
    rules,
    value: '<rule-list>',
}

module.exports = stylesheet
