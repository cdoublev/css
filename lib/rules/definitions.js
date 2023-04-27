
const keyframeProperties = require('../properties/keyframe.js')
const pageMarginProperties = require('../properties/page-margin.js')
const pageProperties = require('../properties/page.js')
const properties = require('../properties/names.js')

const groupRuleTypes = [
    'container',
    'layer-block',
    'layer-statement',
    'media',
    'scope',
    'supports',
]

const styleRules = []

/**
 * @see {@link https://drafts.csswg.org/css-syntax-3/#style-rule}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#nesting}
 */
const style = {
    cascading: true,
    prelude: '<selector-list>',
    properties,
    qualified: 'style',
    rules: styleRules,
    type: 'style',
    value: '<style-block>',
}

const topLevelRules = [
    /**
     * @see {@link https://drafts.csswg.org/css-color-5/#at-ruledef-profile}
     */
    {
        prelude: '[<dashed-ident> | device-cmyk]',
        type: 'color-profile',
        value: '<declaration-list>',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-contain-3/#at-ruledef-container}
     */
    {
        prelude: '<container-condition>',
        properties,
        qualified: 'style',
        rules: [],
        type: 'container',
        value: '<stylesheet>',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#at-ruledef-counter-style}
     */
    {
        prelude: '<counter-style-name>',
        type: 'counter-style',
        value: '<declaration-list>',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-fonts-4/#at-font-face-rule}
     */
    {
        type: 'font-face',
        value: '<declaration-list>',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-fonts-4/#at-ruledef-font-feature-values}
     */
    {
        prelude: '<family-name>#',
        rules: [{
            names: [
                '@annotation',
                '@character-variant',
                '@historical-forms',
                '@ornaments',
                '@styleset',
                '@stylistic',
                '@swash',
            ],
            rules: [],
            type: 'font-feature-value-type',
            value: '<declaration-list>',
        }],
        type: 'font-feature-values',
        value: '<declaration-list>',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-fonts-4/#at-ruledef-font-palette-values}
     */
    {
        prelude: '<dashed-ident>',
        type: 'font-palette-values',
        value: '<declaration-list>',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-cascade-5/#at-ruledef-import}
     */
    {
        prelude: '[<url> | <string>] [layer | layer(<layer-name>)]? <import-conditions>',
        type: 'import',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-animations-1/#at-ruledef-keyframes}
     * @see {@link https://drafts.csswg.org/css-animations-1/#typedef-keyframe-block}
     */
    {
        prelude: '<keyframes-name>',
        qualified: 'keyframe',
        rules: [{
            prelude: '<keyframe-selector>#',
            properties: keyframeProperties,
            type: 'keyframe',
            value: '<declaration-list>',
        }],
        type: 'keyframes',
        value: '<rule-list>',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-cascade-5/#at-ruledef-layer}
     */
    {
        prelude: '<layer-name>?',
        qualified: 'style',
        rules: [],
        type: 'layer-block',
        value: '<stylesheet>',
    },
    {
        prelude: '<layer-name>#',
        type: 'layer-statement',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-conditional-3/#at-ruledef-media}
     */
    {
        prelude: '<media-query-list>',
        qualified: 'style',
        rules: [],
        type: 'media',
        value: '<stylesheet>',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-namespaces-3/#syntax}
     */
    {
        prelude: '<namespace-prefix>? [<string> | <url>]',
        type: 'namespace',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-page-3/#syntax-page-selector}
     */
    {
        cascading: true,
        prelude: '<page-selector-list>?',
        properties: pageProperties,
        rules: [{
            cascading: true,
            names: [
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
            ],
            properties: pageMarginProperties,
            type: 'margin',
            value: '<declaration-list>',
        }],
        type: 'page',
        value: '<declaration-list>',
    },
    /**
     * @see {@link https://drafts.css-houdini.org/css-properties-values-api/#at-property-rule}
     */
    {
        prelude: '<custom-property-name>',
        type: 'property',
        value: '<declaration-list>',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-cascade-6/#at-ruledef-scope}
     */
    {
        prelude: '[(<scope-start>)]? [to (<scope-end>)]?',
        qualified: 'scoped-style',
        rules: [],
        type: 'scope',
        value: '<stylesheet>',
    },
    style,
    /**
     * @see {@link https://drafts.csswg.org/css-conditional-3/#at-ruledef-supports}
     */
    {
        prelude: '<supports-condition>',
        properties,
        qualified: 'style',
        rules: [],
        type: 'supports',
        value: '<stylesheet>',
    },
]

const styleSheetRules = topLevelRules.filter(({ type }) => type !== 'import' && type !== 'namespace')

styleSheetRules.forEach(rule => {
    const { rules, type, value } = rule
    if (value === '<stylesheet>') {
        if (type === 'scope') {
            rules.push(
                ...styleSheetRules.filter(rule => rule !== style),
                { ...style, prelude: '<relative-selector-list>' })
        } else {
            rules.push(...styleSheetRules)
        }
    } else if (type === 'style') {
        rules.push({ ...style, prelude: '<relative-selector-list>' })
    }
})

groupRuleTypes.forEach(type => {
    const rule = styleSheetRules.find(rule => rule.type === type)
    if (type === 'layer-block') {
        styleRules.push(rule)
    }
    styleRules.push({
        ...style,
        ...rule,
        rules: styleRules,
        value: '<style-block>',
    })
})

const styleSheet = {
    qualified: 'style',
    rules: topLevelRules,
    type: 'stylesheet',
    value: '<rule-list>',
}

module.exports = styleSheet
