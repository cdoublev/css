
const descriptors = require('../descriptors/definitions.js')
const keyframeProperties = require('../properties/keyframe.js')
const pageMarginProperties = require('../properties/page-margin.js')
const pageProperties = require('../properties/page.js')
const positionTryProperties = require('../properties/position-try.js')
const properties = require('../properties/definitions.js')

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#conditional-group-rule}
 */
const conditionalGroupRuleNames = [
    '@container',
    '@media',
    '@supports',
]
const conditionalGroupRules = []

/**
 * @see {@link https://drafts.csswg.org/css-nesting-1/#nested-group-rules}
 */
const nestedGroupRuleNames = [
    '@container',
    '@layer-block',
    '@media',
    '@scope',
    '@starting-style',
    '@style',
    '@supports',
]
const nestedGroupRules = []

/**
 * @see {@link https://drafts.csswg.org/css-syntax-3/#style-rule}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#nesting}
 */
const style = {
    cascading: true,
    elemental: true,
    name: '@style',
    prelude: '<selector-list>',
    qualified: true,
    type: 'rule',
    value: {
        name: '<declaration-rule-list>',
        properties,
        rules: nestedGroupRules,
        type: 'block-contents',
    },
}
const nestedStyle = { ...style, prelude: '<relative-selector-list>' }

const topLevelRules = [
    /**
     * @see {@link https://drafts.csswg.org/css-color-5/#at-ruledef-profile}
     */
    {
        name: '@color-profile',
        prelude: '[<dashed-ident> | device-cmyk]',
        type: 'rule',
        value: {
            descriptors: descriptors['@color-profile'],
            name: '<declaration-list>',
            type: 'block-contents',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-conditional-5/#at-ruledef-container}
     */
    {
        elemental: true,
        name: '@container',
        prelude: '<container-condition>#',
        type: 'rule',
        value: {
            name: '<rule-list>',
            rules: [],
            type: 'block-contents',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#at-ruledef-counter-style}
     */
    {
        name: '@counter-style',
        prelude: '<counter-style-name>',
        type: 'rule',
        value: {
            descriptors: descriptors['@counter-style'],
            name: '<declaration-list>',
            type: 'block-contents',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-fonts-4/#at-font-face-rule}
     */
    {
        name: '@font-face',
        type: 'rule',
        value: {
            descriptors: descriptors['@font-face'],
            name: '<declaration-list>',
            type: 'block-contents',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-fonts-4/#at-ruledef-font-feature-values}
     */
    {
        name: '@font-feature-values',
        prelude: '<family-name>#',
        type: 'rule',
        value: {
            descriptors: descriptors['@font-feature-values'],
            name: '<declaration-at-rule-list>',
            rules: [
                {
                    name: '@annotation',
                    type: 'rule',
                    value: {
                        descriptors: { '*': '<integer [0,∞]>' },
                        name: '<declaration-list>',
                        type: 'block-contents',
                    },
                },
                {
                    name: '@character-variant',
                    type: 'rule',
                    value: {
                        descriptors: { '*': '<integer [0,99]> <integer [0,∞]>' },
                        name: '<declaration-list>',
                        type: 'block-contents',
                    },
                },
                {
                    name: '@ornaments',
                    type: 'rule',
                    value: {
                        descriptors: { '*': '<integer [0,∞]>' },
                        name: '<declaration-list>',
                        type: 'block-contents',
                    },
                },
                {
                    name: '@styleset',
                    type: 'rule',
                    value: {
                        descriptors: { '*': '<integer [0,20]>+' },
                        name: '<declaration-list>',
                        type: 'block-contents',
                    },
                },
                {
                    name: '@stylistic',
                    type: 'rule',
                    value: {
                        descriptors: { '*': '<integer [0,∞]>' },
                        name: '<declaration-list>',
                        type: 'block-contents',
                    },
                },
                {
                    name: '@swash',
                    type: 'rule',
                    value: {
                        descriptors: { '*': '<integer [0,∞]>' },
                        name: '<declaration-list>',
                        type: 'block-contents',
                    },
                },
            ],
            type: 'block-contents',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-fonts-4/#at-ruledef-font-palette-values}
     */
    {
        name: '@font-palette-values',
        prelude: '<dashed-ident>',
        type: 'rule',
        value: {
            descriptors: descriptors['@font-palette-values'],
            name: '<declaration-list>',
            type: 'block-contents',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-mixins-1/#at-ruledef-function}
     */
    {
        name: '@function',
        prelude: '<function-name> [(<function-parameter-list>)]? [using (<function-dependency-list>)]? [returns <type>]?',
        type: 'rule',
        value: {
            descriptors: descriptors['@function'],
            name: '<declaration-at-rule-list>',
            rules: conditionalGroupRules,
            type: 'block-contents',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-cascade-5/#at-ruledef-import}
     */
    {
        name: '@import',
        prelude: '[<url> | <string>] [layer | layer(<layer-name>)]? <import-conditions>',
        type: 'rule',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-animations-1/#at-ruledef-keyframes}
     * @see {@link https://drafts.csswg.org/css-animations-1/#typedef-keyframe-block}
     */
    {
        name: '@keyframes',
        prelude: '<keyframes-name>',
        type: 'rule',
        value: {
            name: '<qualified-rule-list>',
            rules: [{
                elemental: true,
                name: '@keyframe',
                prelude: '<keyframe-selector>#',
                qualified: true,
                type: 'rule',
                value: {
                    name: '<declaration-list>',
                    properties: keyframeProperties,
                    type: 'block-contents',
                },
            }],
            type: 'block-contents',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-cascade-5/#at-ruledef-layer}
     */
    {
        name: '@layer-block',
        prelude: '<layer-name>?',
        type: 'rule',
        value: {
            name: '<rule-list>',
            rules: [],
            type: 'block-contents',
        },
    },
    {
        name: '@layer-statement',
        prelude: '<layer-name>#',
        type: 'rule',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-conditional-3/#at-ruledef-media}
     */
    {
        name: '@media',
        prelude: '<media-query-list>',
        type: 'rule',
        value: {
            name: '<rule-list>',
            rules: [],
            type: 'block-contents',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-namespaces-3/#syntax}
     */
    {
        name: '@namespace',
        prelude: '<namespace-prefix>? [<string> | <url>]',
        type: 'rule',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-page-3/#syntax-page-selector}
     */
    {
        cascading: true,
        name: '@page',
        prelude: '<page-selector-list>?',
        type: 'rule',
        value: {
            descriptors: descriptors['@page'],
            name: '<declaration-at-rule-list>',
            properties: pageProperties,
            rules: [{
                cascading: true,
                name: '@margin',
                names: [
                    '@bottom-center',
                    '@bottom-left',
                    '@bottom-left-corner',
                    '@bottom-right',
                    '@bottom-right-corner',
                    '@left-bottom',
                    '@left-middle',
                    '@left-top',
                    '@right-bottom',
                    '@right-middle',
                    '@right-top',
                    '@top-center',
                    '@top-left',
                    '@top-left-corner',
                    '@top-right',
                    '@top-right-corner',
                ],
                type: 'rule',
                value: {
                    name: '<declaration-list>',
                    properties: pageMarginProperties,
                    type: 'block-contents',
                },
            }],
            type: 'block-contents',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-anchor-position-1/#at-ruledef-position-try}
     */
    {
        elemental: true,
        name: '@position-try',
        prelude: '<dashed-ident>',
        type: 'rule',
        value: {
            name: '<declaration-list>',
            properties: positionTryProperties,
            type: 'block-contents',
        },
    },
    /**
     * @see {@link https://drafts.css-houdini.org/css-properties-values-api/#at-property-rule}
     */
    {
        name: '@property',
        prelude: '<custom-property-name>',
        type: 'rule',
        value: {
            descriptors: descriptors['@property'],
            name: '<declaration-list>',
            type: 'block-contents',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-cascade-6/#at-ruledef-scope}
     */
    {
        name: '@scope',
        prelude: '[(<scope-start>)]? [to (<scope-end>)]?',
        type: 'rule',
        value: {
            name: '<rule-list>',
            rules: [],
            type: 'block-contents',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-transitions-2/#at-ruledef-starting-style}
     */
    {
        name: '@starting-style',
        type: 'rule',
        value: {
            name: '<rule-list>',
            rules: [],
            type: 'block-contents',
        },
    },
    style,
    /**
     * @see {@link https://drafts.csswg.org/css-conditional-3/#at-ruledef-supports}
     */
    {
        name: '@supports',
        prelude: '<supports-condition>',
        type: 'rule',
        value: {
            name: '<rule-list>',
            rules: [],
            type: 'block-contents',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-view-transitions-2/#at-view-transition-rule}
     */
    {
        name: '@view-transition',
        type: 'rule',
        value: {
            descriptors: descriptors['@view-transition'],
            name: '<declaration-list>',
            type: 'block-contents',
        },
    },
]

const styleSheetRules = topLevelRules.filter(({ name }) => name !== '@import' && name !== '@namespace')

// Define conditional group rules
conditionalGroupRuleNames.forEach(name =>
    conditionalGroupRules.push(styleSheetRules.find(rule => rule.name === name)))

// Define nested group rules
nestedGroupRuleNames.forEach(name => {
    const rule = styleSheetRules.find(rule => rule.name === name)
    if (name === '@style') {
        nestedGroupRules.push(nestedStyle)
        return
    }
    nestedGroupRules.push({ ...rule, cascading: true, elemental: true, value: style.value })
    if (name === '@scope') {
        rule.value.rules.push(...styleSheetRules.filter(rule => rule !== style), nestedStyle)
    } else {
        rule.value.rules.push(...styleSheetRules)
    }
})

const styleSheet = {
    name: '<rule-list>',
    rules: topLevelRules,
    type: 'block-contents',
}

module.exports = styleSheet
