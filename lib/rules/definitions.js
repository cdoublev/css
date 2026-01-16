
import descriptors from '../descriptors/definitions.js'
import keyframeProperties from '../properties/keyframe.js'
import pageMarginProperties from '../properties/page-margin.js'
import pageProperties from '../properties/page.js'
import positionTryProperties from '../properties/position-try.js'
import properties from '../properties/definitions.js'

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#conditional-group-rule}
 */
const conditionalRuleNames = [
    '@container',
    '@media',
    '@supports',
]

/**
 * @see {@link https://drafts.csswg.org/css-nesting-1/#nested-group-rules}
 */
const groupRuleNames = [
    ...conditionalRuleNames,
    '@layer',
    '@scope',
    '@starting-style',
    '@style',
]

/**
 * @see {@link https://drafts.csswg.org/css-mixins-1/#at-ruledef-function}
 */
const functionRule = {
    cssom: 'CSSFunctionRule',
    elemental: true,
    name: '@function',
    prelude: '<custom-function-definition>',
    type: 'rule',
    value: {
        descriptors: descriptors['@function'],
        name: '<declaration-rule-list>',
        rules: [{
            cssom: 'CSSFunctionDeclarations',
            elemental: true,
            name: '@declarations',
            type: 'rule',
            value: {
                descriptors: descriptors['@function'],
                name: '<declaration-list>',
                type: 'arbitrary',
            },
        }],
        type: 'arbitrary',
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-syntax-3/#style-rule}
 */
const styleRule = {
    cascading: true,
    cssom: 'CSSStyleRule',
    elemental: true,
    name: '@style',
    prelude: '<selector-list>',
    qualified: true,
    type: 'rule',
    value: {
        name: '<declaration-rule-list>',
        properties,
        rules: [{
            cascading: true,
            cssom: 'CSSNestedDeclarations',
            elemental: true,
            name: '@declarations',
            type: 'rule',
            value: {
                name: '<declaration-list>',
                properties,
                type: 'arbitrary',
            },
        }],
        type: 'arbitrary',
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-nesting-1/#nested-style-rule}
 */
const nestedStyle = { ...styleRule, prelude: '<relative-selector-list>' }

const topLevelRules = [
    /**
     * @see {@link https://drafts.csswg.org/css-color-5/#at-ruledef-profile}
     */
    {
        cssom: 'CSSColorProfileRule',
        name: '@color-profile',
        prelude: '[<dashed-ident> | device-cmyk]',
        type: 'rule',
        value: {
            descriptors: descriptors['@color-profile'],
            name: '<declaration-list>',
            type: 'arbitrary',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-conditional-5/#at-ruledef-container}
     */
    {
        cssom: 'CSSContainerRule',
        elemental: true,
        name: '@container',
        prelude: '<container-condition>#',
        type: 'rule',
        value: {
            name: '<rule-list>',
            rules: [],
            type: 'arbitrary',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#at-ruledef-counter-style}
     */
    {
        cssom: 'CSSCounterStyleRule',
        name: '@counter-style',
        prelude: '<counter-style-name>',
        type: 'rule',
        value: {
            descriptors: descriptors['@counter-style'],
            name: '<declaration-list>',
            type: 'arbitrary',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-fonts-4/#at-font-face-rule}
     */
    {
        cssom: 'CSSFontFaceRule',
        name: '@font-face',
        type: 'rule',
        value: {
            descriptors: descriptors['@font-face'],
            name: '<declaration-list>',
            type: 'arbitrary',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-fonts-4/#at-ruledef-font-feature-values}
     */
    {
        cssom: 'CSSFontFeatureValuesRule',
        name: '@font-feature-values',
        prelude: '<family-name>#',
        type: 'rule',
        value: {
            descriptors: descriptors['@font-feature-values'],
            name: '<declaration-rule-list>',
            rules: [
                {
                    cssom: 'CSSFontFeatureValuesMap',
                    name: '@annotation',
                    type: 'rule',
                    value: {
                        descriptors: { '*': '<feature-index [0,∞]>' },
                        name: '<declaration-list>',
                        type: 'arbitrary',
                    },
                },
                {
                    cssom: 'CSSFontFeatureValuesMap',
                    name: '@character-variant',
                    type: 'rule',
                    value: {
                        descriptors: { '*': '<feature-index [0,99]> <feature-index>' },
                        name: '<declaration-list>',
                        type: 'arbitrary',
                    },
                },
                {
                    cssom: 'CSSFontFeatureValuesMap',
                    name: '@ornaments',
                    type: 'rule',
                    value: {
                        descriptors: { '*': '<feature-index [0,∞]>' },
                        name: '<declaration-list>',
                        type: 'arbitrary',
                    },
                },
                {
                    cssom: 'CSSFontFeatureValuesMap',
                    name: '@styleset',
                    type: 'rule',
                    value: {
                        descriptors: { '*': '<feature-index [0,20]>+' },
                        name: '<declaration-list>',
                        type: 'arbitrary',
                    },
                },
                {
                    cssom: 'CSSFontFeatureValuesMap',
                    name: '@stylistic',
                    type: 'rule',
                    value: {
                        descriptors: { '*': '<feature-index [0,∞]>' },
                        name: '<declaration-list>',
                        type: 'arbitrary',
                    },
                },
                {
                    cssom: 'CSSFontFeatureValuesMap',
                    name: '@swash',
                    type: 'rule',
                    value: {
                        descriptors: { '*': '<feature-index [0,∞]>' },
                        name: '<declaration-list>',
                        type: 'arbitrary',
                    },
                },
            ],
            type: 'arbitrary',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-fonts-4/#at-ruledef-font-palette-values}
     */
    {
        cssom: 'CSSFontPaletteValuesRule',
        name: '@font-palette-values',
        prelude: '<dashed-ident>',
        type: 'rule',
        value: {
            descriptors: descriptors['@font-palette-values'],
            name: '<declaration-list>',
            type: 'arbitrary',
        },
    },
    functionRule,
    /**
     * @see {@link https://drafts.csswg.org/css-cascade-5/#at-ruledef-import}
     */
    {
        cssom: 'CSSImportRule',
        name: '@import',
        prelude: '[<url> | <string>] [layer | layer(<layer-name>)]? <import-conditions>',
        type: 'rule',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-animations-1/#at-ruledef-keyframes}
     * @see {@link https://drafts.csswg.org/css-animations-1/#typedef-keyframe-block}
     */
    {
        cssom: 'CSSKeyframesRule',
        name: '@keyframes',
        prelude: '<keyframes-name>',
        type: 'rule',
        value: {
            name: '<qualified-rule-list>',
            rules: [{
                cssom: 'CSSKeyframeRule',
                elemental: true,
                name: '@keyframe',
                prelude: '<keyframe-selector>#',
                qualified: true,
                type: 'rule',
                value: {
                    name: '<declaration-list>',
                    properties: keyframeProperties,
                    type: 'arbitrary',
                },
            }],
            type: 'arbitrary',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-cascade-5/#at-ruledef-layer}
     */
    {
        cssom: 'CSSLayerBlockRule',
        name: '@layer',
        prelude: '<layer-name>?',
        type: 'rule',
        value: {
            name: '<rule-list>',
            rules: [],
            type: 'arbitrary',
        },
    },
    {
        cssom: 'CSSLayerStatementRule',
        name: '@layer',
        prelude: '<layer-name>#',
        type: 'rule',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-conditional-3/#at-ruledef-media}
     */
    {
        cssom: 'CSSMediaRule',
        name: '@media',
        prelude: '<media-query-list>',
        type: 'rule',
        value: {
            name: '<rule-list>',
            rules: [],
            type: 'arbitrary',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-namespaces-3/#syntax}
     */
    {
        cssom: 'CSSNamespaceRule',
        name: '@namespace',
        prelude: '<namespace-prefix>? [<string> | <url>]',
        type: 'rule',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-page-3/#syntax-page-selector}
     */
    {
        cascading: true,
        cssom: 'CSSPageRule',
        elemental: true,
        name: '@page',
        prelude: '<page-selector-list>?',
        type: 'rule',
        value: {
            descriptors: descriptors['@page'],
            name: '<declaration-rule-list>',
            properties: pageProperties,
            rules: [
                {
                    cascading: true,
                    cssom: 'CSSMarginRule',
                    elemental: true,
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
                        type: 'arbitrary',
                    },
                },
                {
                    cascading: true,
                    cssom: 'CSSPageDeclarations',
                    elemental: true,
                    name: '@declarations',
                    type: 'rule',
                    value: {
                        descriptors: descriptors['@page'],
                        name: '<declaration-list>',
                        properties: pageProperties,
                        type: 'arbitrary',
                    },
                },
            ],
            type: 'arbitrary',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-anchor-position-1/#at-ruledef-position-try}
     */
    {
        cssom: 'CSSPositionTryRule',
        elemental: true,
        name: '@position-try',
        prelude: '<dashed-ident>',
        type: 'rule',
        value: {
            name: '<declaration-list>',
            properties: positionTryProperties,
            type: 'arbitrary',
        },
    },
    /**
     * @see {@link https://drafts.css-houdini.org/css-properties-values-api/#at-ruledef-property}
     */
    {
        cssom: 'CSSPropertyRule',
        name: '@property',
        prelude: '<custom-property-name>',
        type: 'rule',
        value: {
            descriptors: descriptors['@property'],
            name: '<declaration-list>',
            type: 'arbitrary',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-cascade-6/#at-ruledef-scope}
     */
    {
        cascading: true,
        cssom: 'CSSScopeRule',
        elemental: true,
        name: '@scope',
        prelude: '[(<scope-start>)]? [to (<scope-end>)]?',
        type: 'rule',
        value: {
            name: '<block-contents>',
            properties,
            rules: [],
            type: 'arbitrary',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-transitions-2/#at-ruledef-starting-style}
     */
    {
        cssom: 'CSSStartingStyleRule',
        name: '@starting-style',
        type: 'rule',
        value: {
            name: '<rule-list>',
            rules: [],
            type: 'arbitrary',
        },
    },
    styleRule,
    supportsConditionRule,
    /**
     * @see {@link https://drafts.csswg.org/css-conditional-3/#at-ruledef-supports}
     */
    {
        cssom: 'CSSSupportsRule',
        name: '@supports',
        prelude: '<supports-condition>',
        type: 'rule',
        value: {
            name: '<rule-list>',
            rules: [],
            type: 'arbitrary',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-view-transitions-2/#at-view-transition-rule}
     */
    {
        cssom: 'CSSViewTransitionRule',
        name: '@view-transition',
        type: 'rule',
        value: {
            descriptors: descriptors['@view-transition'],
            name: '<declaration-list>',
            type: 'arbitrary',
        },
    },
]

const styleSheetRules = topLevelRules.filter(({ name }) => name !== '@import' && name !== '@namespace')

// Define conditional rules inside @function
conditionalRuleNames.forEach(name =>
    functionRule.value.rules.push({
        ...styleSheetRules.find(rule => rule.name === name),
        elemental: true,
        value: functionRule.value,
    }))

// Define group rules inside style rules and at the top-level
groupRuleNames.forEach(name => {
    const rule = styleSheetRules.find(rule => rule.name === name)
    // Skip @layer statement
    if (name === '@layer' && !rule.value) {
        return
    }
    // Nested in style rules
    if (name === '@style') {
        styleRule.value.rules.push(nestedStyle)
        return
    }
    styleRule.value.rules.push({ ...rule, cascading: true, elemental: true, value: styleRule.value })
    // At the top-level
    if (name === '@scope') {
        rule.value.rules.push(...styleSheetRules.filter(rule => rule !== styleRule), nestedStyle)
    } else {
        rule.value.rules.push(...styleSheetRules)
    }
})

export default {
    name: '@sheet',
    type: 'rule',
    value: {
        name: '<rule-list>',
        rules: topLevelRules,
        type: 'arbitrary',
    },
}
