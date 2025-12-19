
import * as compatibility from '../lib/compatibility.js'
import * as display from '../lib/values/display.js'
import * as substitutions from '../lib/values/substitutions.js'
import * as whiteSpace from '../lib/values/white-space.js'
import {
    CSSFontFaceDescriptors,
    CSSFunctionDescriptors,
    CSSKeyframeProperties,
    CSSMarginDescriptors,
    CSSPageDescriptors,
    CSSPositionTryDescriptors,
    CSSStyleProperties,
    CSSStyleSheet,
} from '../lib/cssom/index.js'
import { describe, it, test } from 'node:test'
import { UPDATE_COMPUTED_STYLE_DECLARATION_ERROR } from '../lib/error.js'
import assert from 'node:assert'
import { install } from '@cdoublev/css'
import properties from '../lib/properties/definitions.js'
import shorthands from '../lib/properties/shorthands.js'
import { toIDLAttribute } from '../lib/utils/string.js'

/**
 * @param {object} [privateData]
 * @returns {CSSStyleDeclaration}
 */
function createStyleBlock(privateData = { parentRule: styleRule }) {
    return CSSStyleProperties.create(globalThis, undefined, privateData)
}

// Helper to get initial property value (with better readability)
function initial(property) {
    return properties[property].initial.serialized
}

install()
globalThis.document = { href: 'https://github.com/cdoublev/' }

const styleSheet = CSSStyleSheet.createImpl(globalThis, [{ media: '' }])

styleSheet.replaceSync(`
    @font-face {}
    @function --name() {}
    @keyframes animation { 0% {} }
    @page { @top-left {} }
    @position-try --custom {}
    style {}
`)

const { cssRules: { _rules: [fontFaceRule, functionRule, keyframesRule, pageRule, positionTryRule, styleRule] } } = styleSheet
const { cssRules: { _rules: [keyframeRule] } } = keyframesRule
const { cssRules: { _rules: [marginRule] } } = pageRule

describe('CSSStyleDeclaration / CSSStyleProperties', () => {
    it('has all standard properties', () => {

        const style = createStyleBlock()
        const prototype = Object.getPrototypeOf(style)
        const { properties: { aliases, mappings } } = compatibility
        const names = [...aliases.keys(), ...mappings.keys(), ...Object.keys(properties)]

        names.forEach(dashed => {
            if (dashed === '--*') {
                return
            }
            const prefixed = dashed.startsWith('-webkit-')
            const camel = toIDLAttribute(dashed, prefixed)
            assert.equal(Object.hasOwn(prototype, dashed), true)
            assert.equal(Object.hasOwn(prototype, camel), true)
            if (prefixed) {
                const webkit = toIDLAttribute(dashed)
                assert.equal(Object.hasOwn(prototype, webkit), true)
            }
        })
    })
    it('initializes with declarations of a CSSRule', () => {

        const value = properties.color.initial
        const declarations = [{ name: 'color', value: value.parsed }]
        const parentRule = {}
        const style = createStyleBlock({ declarations, parentRule })

        assert.equal(style.color, value.serialized)
        assert.equal(style.parentRule, parentRule)
    })
    it('initializes with declarations resulting from parsing `Element.style`', () => {
        const element = {
            getAttribute() {
                return 'color: green !important; color: orange;'
            },
        }
        const style = createStyleBlock({ ownerNode: element })
        assert.equal(style.color, 'green')
    })
    it('has array-like properties and methods', () => {

        const style = createStyleBlock()

        style.color = 'green'

        assert.equal(style.length, 1)
        assert.equal(style[0], 'color')
        assert.equal(style.item(0), 'color')
    })
    it('reflects a dashed property with its camel-cased and webkit cased variants', () => {

        const style = createStyleBlock()

        style['-webkit-line-clamp'] = '1'

        assert.equal(style['-webkit-line-clamp'], '1')
        assert.equal(style.webkitLineClamp, '1')
        assert.equal(style.WebkitLineClamp, '1')

        style.webkitLineClamp = '2'

        assert.equal(style['-webkit-line-clamp'], '2')
        assert.equal(style.webkitLineClamp, '2')
        assert.equal(style.WebkitLineClamp, '2')

        style.WebkitLineClamp = '3'

        assert.equal(style['-webkit-line-clamp'], '3')
        assert.equal(style.webkitLineClamp, '3')
        assert.equal(style.WebkitLineClamp, '3')
    })
    it('reflects a longhand property with its alias', () => {

        const style = createStyleBlock()

        style.order = '1'

        assert.equal(style.order, '1')
        assert.equal(style['-webkit-order'], '1')

        style['-webkit-order'] = '2'

        assert.equal(style.order, '2')
        assert.equal(style['-webkit-order'], '2')
    })
    it('reflects a shorthand property with its alias', () => {

        const style = createStyleBlock()

        style.gap = '1px'

        assert.equal(style.gap, '1px')
        assert.equal(style['grid-gap'], '1px')

        style['grid-gap'] = '2px'

        assert.equal(style.gap, '2px')
        assert.equal(style['grid-gap'], '2px')
    })
    it('sets a declaration for a longhand property mapping to another property', () => {
        const style = createStyleBlock()
        style['-webkit-box-align'] = 'start'
        assert.equal(style['-webkit-box-align'], 'start')
        assert.equal(style['align-items'], '')
    })
})
describe('CSSStyleDeclaration.cssText', () => {
    it('does not store a declaration with an invalid name', () => {
        const style = createStyleBlock()
        style.cssText = 'webkitLineClamp: 1; WebkitLineClamp: 1'
        assert.equal(style.cssText, '')
    })
    it('stores a declaration for the target of a property alias', () => {
        const style = createStyleBlock()
        style.cssText = '-webkit-order: 1; grid-gap: 1px'
        assert.equal(style.cssText, 'order: 1; gap: 1px;')
    })
    it('stores a declaration for a property mapping to another property', () => {
        const style = createStyleBlock()
        style.cssText = '-webkit-box-align: start'
        assert.equal(style.cssText, '-webkit-box-align: start;')
    })
    it('stores a custom property declaration with an escaped code point', () => {
        const style = createStyleBlock()
        style.cssText = '--custom\\ property: 1'
        assert.equal(style.cssText, '--custom\\ property: 1;')
    })
    it('stores a custom property declaration with an empty string value', () => {
        const style = createStyleBlock()
        style.cssText = '--custom:;'
        assert.equal(style.cssText, '--custom: ;')
        assert.equal(style.getPropertyValue('--custom'), ' ')
    })
    it('stores declarations in specified order', () => {
        const style = createStyleBlock()
        style.cssText = 'color: orange; width: 1px; color: green'
        assert.equal(style.cssText, 'width: 1px; color: green;')
        style.cssText = 'color: green !important; width: 1px; color: orange'
        assert.equal(style.cssText, 'color: green !important; width: 1px;')
    })
    it('ignores rules', () => {
        const style = createStyleBlock()
        style.cssText = 'color: green; @page { color: red }; .selector { color: red }; font-size: 12px'
        assert.equal(style.cssText, 'color: green; font-size: 12px;')
    })
    it('ignores an orphan }', () => {
        const style = createStyleBlock()
        style.cssText = 'color: green; } font-size: 12px'
        assert.equal(style.cssText, 'color: green; font-size: 12px;')
    })
})
describe('CSSStyleDeclaration.setProperty(), CSSStyleDeclaration.getPropertyValue(), CSSStyleDeclaration.removeProperty()', () => {
    it('does not store a declaration with an invalid name', () => {

        const style = createStyleBlock()

        style.setProperty(' -webkit-line-clamp', '1')
        style.setProperty('-webkit-line-clamp ', '1')
        style.setProperty('webkitLineClamp', '1')
        style.setProperty('WebkitLineClamp', '1')

        assert.equal(style.getPropertyValue('-webkit-line-clamp'), '')
    })
    it('does not store a declaration with a value including a priority', () => {
        const style = createStyleBlock()
        style.setProperty('font-size', '1px !important')
        assert.equal(style.getPropertyValue('font-size'), '')
    })
    it('does not store a declaration with an invalid priority', () => {
        const style = createStyleBlock()
        style.setProperty('font-size', '1px', ' ')
        style.setProperty('font-size', '1px', '!important')
        assert.equal(style.getPropertyValue('font-size'), '')
    })
    it('sets and removes a declaration for a standard property normalized to lowercase', () => {

        const style = createStyleBlock()

        style.setProperty('-WEBKIT-LINE-CLAMP', '1')

        assert.equal(style.getPropertyValue('-WEBKIT-LINE-CLAMP'), '1')
        assert.equal(style.getPropertyValue('webkitLineClamp'), '')
        assert.equal(style.getPropertyValue('WebkitLineClamp'), '')

        style.removeProperty('-WEBKIT-LINE-CLAMP')

        assert.equal(style.getPropertyValue('-webkit-line-clamp'), '')
    })
    it('sets and removes a declaration for the target of a longhand property alias', () => {

        const style = createStyleBlock()

        style.setProperty('-webkit-order', '1')

        assert.equal(style.getPropertyValue('order'), '1')
        assert.equal(style.getPropertyValue('-webkit-order'), '1')

        style.removeProperty('-webkit-order')

        assert.equal(style.getPropertyValue('order'), '')
        assert.equal(style.getPropertyValue('-webkit-order'), '')
    })
    it('sets and removes a declaration for the target of a shorthand property alias', () => {

        const style = createStyleBlock()

        style.setProperty('grid-gap', '1px')

        assert.equal(style.getPropertyValue('gap'), '1px')
        assert.equal(style.getPropertyValue('grid-gap'), '1px')

        style.removeProperty('grid-gap')

        assert.equal(style.getPropertyValue('gap'), '')
        assert.equal(style.getPropertyValue('grid-gap'), '')
    })
    it('sets a declaration for a longhand property mapping to another property', () => {

        const style = createStyleBlock()

        style.setProperty('-webkit-box-align', 'start')

        assert.equal(style.getPropertyValue('-webkit-box-align'), 'start')
        assert.equal(style.getPropertyValue('align-items'), '')
    })
    it('sets and removes a declaration for a custom property with an escaped name', () => {

        const style = createStyleBlock()

        style.setProperty('--custom PROP', '1')

        assert.equal(style.getPropertyValue('--custom PROP'), '1')
        assert.equal(style.getPropertyValue('--custom\ PROP'), '1')

        style.removeProperty('--custom PROP')

        assert.equal(style.getPropertyValue('--custom PROP'), '')
    })
    it('sets and removes a declaration for a custom property containing an escaped code point', () => {

        const style = createStyleBlock()

        style.setProperty('--custom\ PROP', '1')

        assert.equal(style.getPropertyValue('--custom PROP'), '1')
        assert.equal(style.getPropertyValue('--custom\ PROP'), '1')

        style.removeProperty('--custom\ PROP')

        assert.equal(style.getPropertyValue('--custom\ PROP'), '')
    })
    it('sets a declaration with a priority', () => {

        const style = createStyleBlock()

        // Standard property
        style.setProperty('font-size', '10px', 'important')
        assert.equal(style.getPropertyPriority('font-size'), 'important')
        style.setProperty('font-size', '10px')
        assert.equal(style.getPropertyPriority('font-size'), '')

        // Longhand property alias
        style.setProperty('order', '1', 'important')
        assert.equal(style.getPropertyPriority('-webkit-order'), 'important')

        // Shorthand property alias
        style.setProperty('gap', '1px', 'important')
        assert.equal(style.getPropertyPriority('grid-gap'), 'important')

        // Custom property
        style.setProperty('--custom', '1', 'important')
        assert.equal(style.getPropertyPriority('--custom'), 'important')
    })
    it('removes a declaration for the specified name when the specified value is an empty string', () => {

        const style = createStyleBlock()

        style.cssText = 'color: green; --custom: 1;'
        style.setProperty('color', '')
        style.setProperty('--custom', '')

        assert.equal(style.getPropertyValue('color'), '')
        assert.equal(style.getPropertyValue('--custom'), '')
        assert.equal(style.length, 0)
    })
    it('updates a declaration not preceded by a declaration for a property of the same logical property group', () => {

        const style = createStyleBlock()

        style.borderTopColor = 'orange'
        style.width = '1px'

        style.borderTopColor = 'orange'
        assert.equal(style.cssText, 'border-top-color: orange; width: 1px;')

        style.borderTopColor = 'green'
        assert.equal(style.cssText, 'border-top-color: green; width: 1px;')

        style.setProperty('border-top-color', 'green', 'important')
        assert.equal(style.cssText, 'border-top-color: green !important; width: 1px;')
    })
    it('removes then append a declaration followed by a declaration for a property of the same logical property group and with a different mapping', () => {

        const style = createStyleBlock()

        style.borderTopColor = 'green'
        style.borderBlockStartColor = 'orange'

        style.borderTopColor = 'green'
        assert.equal(style.cssText, 'border-block-start-color: orange; border-top-color: green;')

        style.borderBlockStartColor = 'green'
        assert.equal(style.cssText, 'border-top-color: green; border-block-start-color: green;')
    })
})

describe('CSS-wide keywords', () => {
    test('valid', () => {
        const style = createStyleBlock()
        substitutions.keywords.forEach(keyword => {
            style.opacity = keyword.toUpperCase()
            assert.equal(style.opacity, keyword)
        })
    })
})
describe('arbitrary substitution', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        const invalid = [
            // Top-level or nested <bad-*-token>, ), ], }
            'env(name) fn("\n)',
            'env(name) (url(bad .url))',
            'env(name) [)]',
            'env(name) (])',
            'env(name) (})',
            // Top-level ; and !
            'env(name) ;',
            'env(name) !',
            'env(name) !important',
            // Positioned {} block
            'env(name) {}',
            '{} env(name)',
            // Nested
            'fn(env())',
            '{env()}',
        ]
        invalid.forEach(input => style.color = input)
        assert.equal(style.length, 0)
    })
    test('valid', () => {
        const style = createStyleBlock()
        const valid = [
            // Nested ; and !
            ['env(name) (;)'],
            ['env(name) (!)'],
            // Valid at parse time
            ['--custom(--custom(!))'],
            ['attr(name, attr())'],
            ['env(name, env())'],
            ['if(if())', 'if(if())'],
            ['inherit(--custom, inherit())'],
            ['random-item(--key, random-item())'],
            ['var(--custom, var())'],
            // Custom function name with escaped characters
            ['--cust\\ om()'],
            // Serialize the list of tokens
            ['  /**/ @1/**/1e0 --CUSTOM(  /**/ 1e0 /**/  ', '@1 1 --CUSTOM(1)'],
            ['  /**/ @1/**/1e0 ATTR(  name, /**/ 1e0 /**/  ', '@1 1 attr(name, 1)'],
            ['  /**/ @1/**/1e0 ENV(  name, /**/ 1e0 /**/  ', '@1 1 env(name, 1)'],
            ['  /**/ @1/**/1e0 IF(  if(): /**/ 1e0 /**/  ', '@1 1 if(if(): 1)'],
            ['  /**/ @1/**/1e0 RANDOM-ITEM(  --key, /**/ 1e0 /**/  ', '@1 1 random-item(--key, 1)'],
            ['  /**/ @1/**/1e0 VAR(  --custom, /**/ 1e0 /**/  ', '@1 1 var(--custom, 1)'],
        ]
        valid.forEach(([input, expected = input]) => {
            style.cssText = `opacity: ${input}`
            assert.equal(style.opacity, expected)
        })
    })
})
describe('<whole-value>', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        const invalid = [
            // Not the <whole-value>
            ['first-valid(0) 0', 'margin'],
            ['interpolate(0, 0: 0) 0', 'margin'],
            ['interpolate(0, 0: first-valid(0) 0)', 'margin'],
            ['toggle(0) 0', 'margin'],
            ['toggle(first-valid(0) 0)', 'margin'],
            // Invalid <whole-value> argument for the property
            ['first-valid(first-valid(invalid))', 'color'],
            ['interpolate(0, 0: interpolate(0, 0: invalid))', 'color'],
            ['toggle(invalid)', 'color'],
            // interpolate() for non-animatable property
            ['interpolate(0, 0: 0s)', 'animation-duration'],
            // toggle() nested inside itself
            ['toggle(toggle(1))', 'opacity'],
        ]
        invalid.forEach(([substitution, property]) => style[property] = substitution)
        assert.equal(style.length, 0)
    })
    test('valid', () => {
        const style = createStyleBlock()
        const valid = [
            // Resolved at parse time
            ['FIRST-VALID(1)', '1', 'opacity'],
            // Serialize the list of tokens
            ['  /**/  INTERPOLATE(  0, 0: /**/ 1e0 /**/  ', 'interpolate(0, 0: 1)', 'opacity'],
            ['  /**/  TOGGLE(  /**/ 1e0 /**/  ', 'toggle(1)', 'opacity'],
            // Nested inside itself
            ['first-valid(toggle(first-valid(1)))', 'toggle(1)', 'opacity'],
            ['interpolate(0, 0: toggle(interpolate(0, 0: 1)))', 'interpolate(0, 0: toggle(interpolate(0, 0: 1)))', 'opacity'],
            // Omitted value
            ['interpolate(0, 0:)', 'interpolate(0, 0:)', '--custom'],
            ['toggle(,)', 'toggle(,)', '--custom'],
            // Priority to the declaration value range
            ['first-valid(1) 1', 'first-valid(1) 1', '--custom'],
            ['interpolate(0, 0: 1) 1', 'interpolate(0, 0: 1) 1', '--custom'],
            ['toggle(1) 1', 'toggle(1) 1', '--custom'],
            ['toggle(toggle(1))', 'toggle(toggle(1))', '--custom'],
        ]
        valid.forEach(([input, expected, property]) => {
            style.cssText = `${property}: ${input}`
            assert.equal(style.getPropertyValue(property), expected)
        })
    })
})

describe('--*', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        const invalid = [
            // Top-level or nested <bad-*-token>, ), ], }
            'fn("\n)',
            '(url(bad .url))',
            '[)]',
            '(])',
            '(})',
            // Top-level ; and !
            ';',
            '!important',
        ]
        invalid.forEach(input => style.setProperty('--custom', input))
        assert.equal(style.length, 0)
    })
    test('valid', () => {
        const style = createStyleBlock()
        const valid = [
            // Nested ; and !
            ['(;)'],
            ['(!)'],
            // Positioned {}-block
            ['positioned {} block'],
            // Serialize exactly as specified but without leading and trailing whitespaces
            [
                '  /**/  Red  ,  (  orange  /**/  )  ,  green  /**/  ! /**/ important',
                'Red  ,  (  orange  /**/  )  ,  green !important',
            ],
            // Empty value
            ['', ' '],
            ['  /**/  ', ' '],
            // Substitution
            ['var(  --PROPerty, /**/ 1e0 /**/  )  ', 'var(  --PROPerty, /**/ 1e0 /**/  )'],
            ['initial initial'],
            ['toggle(1) 1'],
        ]
        valid.forEach(([input, expected = input]) => {
            style.cssText = `--custom: ${input}`
            assert.equal(style.getPropertyValue('--custom'), expected.replace(' !important', ''))
            assert.equal(style.cssText, `--custom: ${expected.trim()};`)
        })
    })
})
describe('alignment-baseline', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.alignmentBaseline = 'text-before-edge'
        assert.equal(style.alignmentBaseline, 'text-top')
        style.alignmentBaseline = 'text-after-edge'
        assert.equal(style.alignmentBaseline, 'text-bottom')
    })
})
describe('animation-range-center', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.animationRangeCenter = 'source 50%'
        assert.equal(style.animationRangeCenter, 'source')
    })
})
describe('animation-range-start, animation-range-end, timeline-trigger-exit-range-end, timeline-trigger-exit-range-start, timeline-trigger-range-end, timeline-trigger-range-start', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.animationRangeStart = 'entry 0%'
        assert.equal(style.animationRangeStart, 'entry')
    })
})
describe('background-position', () => {
    test('valid', () => {
        const style = createStyleBlock()
        const valid = [
            ['left', 'left center'],
            ['top', 'center top'],
            ['center', 'center center'],
            ['0px', '0px center'],
        ]
        valid.forEach(([input, expected = input]) => {
            style.cssText = `background-position: ${input}`
            assert.equal(style.backgroundPosition, expected)
        })
    })
})
describe('background-size, mask-size', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.backgroundSize = '100%'
        assert.equal(style.backgroundSize, '100% auto')
    })
})
describe('border-end-end-radius, border-end-start-radius, border-bottom-left-radius, border-bottom-right-radius, border-start-end-radius, border-start-start-radius, border-top-left-radius, border-top-right-radius', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.borderBottomLeftRadius = '1px 1px'
        assert.equal(style.borderBottomLeftRadius, '1px')
        style.borderBottomLeftRadius = '1px 2px'
        assert.equal(style.borderBottomLeftRadius, '1px 2px')
    })
})
describe('border-image-outset, mask-border-outset', () => {
    test('valid', () => {
        const style = createStyleBlock()
        const valid = [
            ['0 1 2 2'],
            ['0 1 2 1', '0 1 2'],
            ['0 1 0', '0 1'],
            ['0 0', '0'],
        ]
        valid.forEach(([input, expected = input]) => {
            style.cssText = `border-image-outset: ${input}`
            assert.equal(style.borderImageOutset, expected)
        })
    })
})
describe('border-image-repeat, mask-border-repeat', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.borderImageRepeat = 'stretch stretch'
        assert.equal(style.borderImageRepeat, 'stretch')
    })
})
describe('border-image-slice, mask-border-slice', () => {
    test('valid', () => {
        const style = createStyleBlock()
        const valid = [
            ['0 1 2 2 fill'],
            ['0 1 2 1', '0 1 2'],
            ['0 1 0 fill', '0 1 fill'],
            ['0 0', '0'],
        ]
        valid.forEach(([input, expected = input]) => {
            style.cssText = `border-image-slice: ${input}`
            assert.equal(style.borderImageSlice, expected)
        })
    })
})
describe('border-image-width, mask-border-width', () => {
    test('valid', () => {
        const style = createStyleBlock()
        const valid = [
            ['0 1 2 2'],
            ['0 1 2 1', '0 1 2'],
            ['0 1 0', '0 1'],
            ['0 0', '0'],
        ]
        valid.forEach(([input, expected = input]) => {
            style.cssText = `border-image-width: ${input}`
            assert.equal(style.borderImageWidth, expected)
        })
    })
})
describe('border-spacing', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.borderSpacing = '1px 1px'
        assert.equal(style.borderSpacing, '1px')
    })
})
describe('box-shadow-offset', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.boxShadowOffset = '0px'
        assert.equal(style.boxShadowOffset, '0px 0px')
    })
})
describe('break-after, break-before, page-break-after, page-break-before', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.pageBreakAfter = 'recto'
        assert.equal(style.length, 0)
    })
    test('valid', () => {

        const style = createStyleBlock()

        // Unmapped value
        style.breakAfter = 'recto'
        assert.equal(style.breakAfter, 'recto')
        assert.equal(style.pageBreakAfter, '')
        assert.equal(style.cssText, 'break-after: recto;')

        // Legacy mapped value
        style.breakAfter = 'page'
        assert.equal(style.breakAfter, 'page')
        assert.equal(style.pageBreakAfter, 'always')
        assert.equal(style.cssText, 'break-after: page;')
        style.cssText = ''
        style.pageBreakAfter = 'always'
        assert.equal(style.breakAfter, 'page')
        assert.equal(style.pageBreakAfter, 'always')
        assert.equal(style.cssText, 'break-after: page;')

        // Substitution-value
        style.breakAfter = 'var(--custom)'
        assert.equal(style.breakAfter, 'var(--custom)')
        assert.equal(style.pageBreakAfter, 'var(--custom)')
        assert.equal(style.cssText, 'break-after: var(--custom);')
        style.cssText = ''
        style.pageBreakAfter = 'var(--custom)'
        assert.equal(style.breakAfter, 'var(--custom)')
        assert.equal(style.pageBreakAfter, 'var(--custom)')
        assert.equal(style.cssText, 'break-after: var(--custom);')
    })
})
describe('break-inside, page-break-inside', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.pageBreakInside = 'avoid-page'
        assert.equal(style.length, 0)
    })
    test('valid', () => {

        const style = createStyleBlock()

        // Unmapped value
        style.breakInside = 'avoid-page'
        assert.equal(style.breakInside, 'avoid-page')
        assert.equal(style.pageBreakInside, '')
        assert.equal(style.cssText, 'break-inside: avoid-page;')

        // Substitution-value
        style.breakInside = 'var(--custom)'
        assert.equal(style.breakInside, 'var(--custom)')
        assert.equal(style.pageBreakInside, 'var(--custom)')
        assert.equal(style.cssText, 'break-inside: var(--custom);')
        style.cssText = ''
        style.pageBreakInside = 'var(--custom)'
        assert.equal(style.breakInside, 'var(--custom)')
        assert.equal(style.pageBreakInside, 'var(--custom)')
        assert.equal(style.cssText, 'break-inside: var(--custom);')
    })
})
describe('clip-path', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.clipPath = 'inset(1px) border-box'
        assert.equal(style.clipPath, 'inset(1px)')
    })
})
describe('color-scheme', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.colorScheme = 'NORMAL only'
        style.colorScheme = 'only only'
        assert.equal(style.length, 0)
    })
})
describe('counter-increment, counter-set, counter-reset', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.counterIncrement = 'counter 0'
        assert.equal(style.counterIncrement, 'counter 0')
        style.counterIncrement = 'counter 1'
        assert.equal(style.counterIncrement, 'counter')
        style.counterSet = 'counter 0'
        assert.equal(style.counterSet, 'counter')
        style.counterSet = 'counter 1'
        assert.equal(style.counterSet, 'counter 1')
        style.counterReset = 'counter 0'
        assert.equal(style.counterReset, 'counter')
        style.counterReset = 'counter 1'
        assert.equal(style.counterReset, 'counter 1')
        style.counterReset = 'reversed(counter) 0'
        assert.equal(style.counterReset, 'reversed(counter) 0')
    })
})
describe('container-name', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        const invalid = [
            'AND',
            'or',
            'not',
            'name none',
        ]
        invalid.forEach(input => style.containerName = input)
        assert.equal(style.length, 0)
    })
    test('valid', () => {
        const style = createStyleBlock()
        style.containerName = 'none'
        assert.equal(style.containerName, 'none')
    })
})
describe('cue-after, cue-before', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.cueAfter = 'url("icon.wav") 0db'
        assert.equal(style.cueAfter, 'url("icon.wav")')
    })
})
describe('display', () => {
    test('valid', () => {
        const style = createStyleBlock()
        // Alias value
        display.aliases.forEach((to, from) => {
            style.display = from
            assert.equal(style.display, to)
        })
        // Legacy mapped value
        for (const mapped of compatibility.values.keywords['display'].mappings.keys()) {
            style.display = mapped
            assert.equal(style.display, mapped)
        }
    })
})
describe('float', () => {
    test('mirroring with cssFloat', () => {
        const style = createStyleBlock()
        style.cssFloat = 'left'
        assert.equal(style.float, 'left')
        assert.equal(style.cssText, 'float: left;')
        style.setProperty('float', 'right')
        assert.equal(style.cssFloat, 'right')
    })
})
describe('flow-into', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.flowInto = 'AUTO'
        style.flowInto = 'none element'
        assert.equal(style.length, 0)
    })
})
describe('font-size-adjust', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.fontSizeAdjust = 'ex-height 1'
        assert.equal(style.fontSizeAdjust, '1')
    })
})
describe('font-style', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.fontStyle = 'oblique 0deg'
        assert.equal(style.fontStyle, 'normal')
    })
})
describe('glyph-orientation-vertical, text-orientation', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        const invalid = [
            '1',
            '1deg',
            '0rad',
            'calc(0deg)',
        ]
        invalid.forEach(input => style.glyphOrientationVertical = input)
        assert.equal(style.length, 0)
    })
    test('valid', () => {

        const style = createStyleBlock()

        // Legacy mapped value
        const mapping = [
            ['mixed', 'auto'],
            ['upright', '0', '0deg'],
            ['upright', '0deg'],
            ['sideways', '90', '90deg'],
            ['sideways', '90deg'],
        ]
        mapping.forEach(([value, legacy, mapped = legacy]) => {
            style.textOrientation = value
            assert.equal(style.textOrientation, value)
            assert.equal(style.glyphOrientationVertical, mapped)
            assert.equal(style.cssText, `text-orientation: ${value};`)
            style.cssText = ''
            style.glyphOrientationVertical = legacy
            assert.equal(style.textOrientation, value)
            assert.equal(style.glyphOrientationVertical, mapped)
            assert.equal(style.cssText, `text-orientation: ${value};`)
        })

        // Substitution-value
        style.textOrientation = 'var(--custom)'
        assert.equal(style.textOrientation, 'var(--custom)')
        assert.equal(style.glyphOrientationVertical, 'var(--custom)')
        assert.equal(style.cssText, 'text-orientation: var(--custom);')
        style.glyphOrientationVertical = 'var(--custom)'
        assert.equal(style.textOrientation, 'var(--custom)')
        assert.equal(style.glyphOrientationVertical, 'var(--custom)')
        assert.equal(style.cssText, 'text-orientation: var(--custom);')
    })
})
describe('grid-auto-flow', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.gridAutoFlow = 'row dense'
        assert.equal(style.gridAutoFlow, 'dense')
    })
})
describe('grid-template-areas', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        const invalid = [
            // Trash token
            '"a !"',
            // Empty row
            '" "',
            // Non-equal column length
            '".  " ". ."',
            '". ." ".  "',
            // Non-rectangular area
            '"a . a"',
            '"a b a"',
            '"a" "." "a"',
            '"a" "b" "a"',
            '"a ." "a a"',
            '"a ." ". a"',
            '"a a" "a ."',
            '". a" "a a"',
            '". a" "a ."',
        ]
        invalid.forEach(input => style.gridTemplateAreas = input)
        assert.equal(style.length, 0)
    })
    test('valid', () => {
        const style = createStyleBlock()
        style.gridTemplateAreas = '"  a  .b.  c  " "a . . . c'
        assert.equal(style.gridTemplateAreas, '"a . b . c" "a . . . c"')
    })
})
describe('grid-template-columns, grid-template-rows', () => {
    test('valid', () => {
        const style = createStyleBlock()
        const valid = [
            // Empty line names are omitted except for subgrid axis (browser conformance)
            ['subgrid [] repeat(1, [] [a] [])'],
            ['[] 1px [] repeat(1, [] 1px []) [] repeat(1, [] 1fr [])', '1px repeat(1, 1px) repeat(1, 1fr)'],
            ['[] repeat(auto-fill, [] 1px []) []', 'repeat(auto-fill, 1px)'],
        ]
        valid.forEach(([input, expected = input]) => {
            style.cssText = `grid-template-rows: ${input}`
            assert.equal(style.gridTemplateRows, expected)
        })
    })
})
describe('hyphenate-limit-chars', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.hyphenateLimitChars = '0 1 1'
        assert.equal(style.hyphenateLimitChars, '0 1')
        style.hyphenateLimitChars = '0 auto auto'
        assert.equal(style.hyphenateLimitChars, '0')
    })
})
describe('image-orientation', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.imageOrientation = '0deg flip'
        assert.equal(style.imageOrientation, 'flip')
    })
})
describe('image-rendering', () => {
    test('valid', () => {
        const style = createStyleBlock()
        // Legacy mapped value
        style.imageRendering = 'optimizeSpeed'
        assert.equal(style.imageRendering, 'optimizespeed')
        style.imageRendering = 'optimizeQuality'
        assert.equal(style.imageRendering, 'optimizequality')
    })
})
describe('image-resolution', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.imageResolution = 'from-image 1dppx'
        assert.equal(style.imageResolution, 'from-image')
    })
})
describe('initial-letter', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.initialLetter = '1 drop'
        assert.equal(style.initialLetter, '1')
    })
})
describe('object-fit', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.objectFit = 'contain scale-down'
        assert.equal(style.objectFit, 'scale-down')
    })
})
describe('offset-path', () => {
    test('valid', () => {
        const style = createStyleBlock()
        const valid = [
            // Omitted value
            ['url("path.svg") border-box', 'url("path.svg")'],
            ['path(evenodd, "M0 0")', 'path("M0 0")'],
            // Preserve at <position>
            ['circle()'],
            ['ellipse()'],
            ['circle(at center center)'],
            ['ellipse(at center center)'],
        ]
        valid.forEach(([input, expected = input]) => {
            style.cssText = `offset-path: ${input}`
            assert.equal(style.offsetPath, expected)
        })
    })
})
describe('offset-rotate', () => {
    test('valid', () => {
        const style = createStyleBlock()
        const valid = [
            ['auto 0deg', 'auto'],
            ['auto 180deg', 'reverse'],
            ['auto -180deg', 'reverse'],
            ['reverse 0deg', 'reverse'],
            ['reverse 180deg', 'auto'],
            ['reverse -180deg', 'auto'],
        ]
        valid.forEach(([input, expected]) => {
            style.cssText = `offset-rotate: ${input}`
            assert.equal(style.offsetRotate, expected)
        })
    })
})
describe('overflow-clip-margin-block-end, overflow-clip-margin-block-start, overflow-clip-margin-bottom, overflow-clip-margin-inline-end, overflow-clip-margin-inline-starty, overflow-clip-margin-left, overflow-clip-margin-right, overflow-clip-margin-top', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.overflowClipMarginBlockEnd = 'content-box 0px'
        assert.equal(style.overflowClipMarginBlockEnd, 'content-box')
    })
})
describe('paint-order', () => {
    test('valid', () => {
        const style = createStyleBlock()
        const valid = [
            ['fill', 'normal'],
            ['fill stroke', 'normal'],
            ['fill stroke markers', 'normal'],
            ['fill markers stroke', 'fill markers'],
            ['stroke fill', 'stroke'],
            ['stroke fill markers', 'stroke'],
            ['markers fill', 'markers'],
            ['markers fill stroke', 'markers'],
            ['markers stroke fill'],
        ]
        valid.forEach(([input, expected = input]) => {
            style.cssText = `paint-order: ${input}`
            assert.equal(style.paintOrder, expected)
        })
    })
})
describe('scale', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.scale = '100% 100% 1'
        assert.equal(style.scale, '100%')
    })
})
describe('scroll-snap-align', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.scrollSnapAlign = 'none none'
        assert.equal(style.scrollSnapAlign, 'none')
    })
})
describe('scroll-snap-type', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.scrollSnapType = 'x proximity'
        assert.equal(style.scrollSnapType, 'x')
    })
})
describe('shape-outside', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.shapeOutside = 'inset(1px) margin-box'
        assert.equal(style.shapeOutside, 'inset(1px)')
    })
})
describe('@font-face/src', () => {
    test('invalid', () => {
        const style = CSSFontFaceDescriptors.create(globalThis, undefined, { parentRule: fontFaceRule })
        style.src = '{]}, local("serif")'
        style.src = 'local("serif"), {]}'
        assert.equal(style.length, 0)
    })
    test('valid', () => {
        const style = CSSFontFaceDescriptors.create(globalThis, undefined, { parentRule: fontFaceRule })
        const valid = [
            'local("serif"), "\n',
            'local("serif"), url(bad .url)',
            'local("serif"), )',
            'local("serif"), ]',
            'local("serif"), }',
            'local("serif"), ;',
            'local("serif"), !',
        ]
        valid.forEach(input => {
            style.removeProperty('src')
            style.setProperty('src', input)
            assert.equal(style.src, 'local("serif")')
        })
    })
})
describe('text-align-all', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.textAlignAll = '"12"'
        assert.equal(style.length, 0)
    })
})
describe('text-autospace', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.textAutospace = 'ideograph-alpha ideograph-numeric'
        assert.equal(style.textAutospace, 'normal')
    })
})
describe('text-decoration-inset', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.textDecorationInset = '1px 1px'
        assert.equal(style.textDecorationInset, '1px')
    })
})
describe('text-decoration-skip-self', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.textDecorationSkipSelf = 'skip-underline skip-overline skip-line-through'
        assert.equal(style.textDecorationSkipSelf, 'skip-all')
    })
})
describe('text-emphasis-position', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.textEmphasisPosition = 'over right'
        assert.equal(style.textEmphasisPosition, 'over')
    })
})
describe('text-justify', () => {
    test('valid', () => {
        const style = createStyleBlock()
        // Legacy value alias
        style.textJustify = 'distribute'
        assert.equal(style.textJustify, 'inter-character')
    })
})
describe('translate', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.translate = '0px 0px 0px'
        assert.equal(style.translate, '0px')
    })
})
describe('view-timeline-inset', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.viewTimelineInset = 'auto auto'
        assert.equal(style.viewTimelineInset, 'auto')
    })
})
describe('view-transition-class', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.viewTransitionClass = 'class NONE'
        assert.equal(style.length, 0)
    })
})
describe('view-transition-name', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.viewTransitionName = 'AUTO'
        style.viewTransitionName = 'match-element'
        assert.equal(style.length, 0)
    })
})
describe('voice-pitch, voice-range', () => {
    test('valid', () => {
        const style = createStyleBlock()
        const valid = [
            'x-low 0hz',
            'x-low 0st',
            'x-low 100%',
        ]
        valid.forEach(input => {
            style.cssText = `voice-pitch: ${input}`
            assert.equal(style.voicePitch, 'x-low')
        })
    })
})
describe('voice-rate', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.voiceRate = 'normal 100%'
        assert.equal(style.voiceRate, 'normal')
        style.voiceRate = '100%'
        assert.equal(style.voiceRate, '100%')
    })
})

describe('-webkit-line-clamp', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('-webkit-line-clamp')[0]

        // none
        style.webkitLineClamp = 'none'
        assert.equal(style.length, longhands.length)
        assert.equal(style.maxLines, 'none')
        assert.equal(style.blockEllipsis, 'auto')
        assert.equal(style.continue, 'auto')
        assert.equal(style.webkitLineClamp, 'none')
        assert.equal(style.cssText, '-webkit-line-clamp: none;')

        // <integer>
        style.webkitLineClamp = '1'
        assert.equal(style.maxLines, '1')
        assert.equal(style.blockEllipsis, 'auto')
        assert.equal(style.continue, '-webkit-legacy')
        assert.equal(style.webkitLineClamp, '1')
        assert.equal(style.cssText, 'line-clamp: 1 -webkit-legacy;')

        // All longhands cannot be represented
        style.continue = initial('continue')
        assert.equal(style.webkitLineClamp, '')
        assert.equal(style.cssText, 'max-lines: 1; block-ellipsis: auto; continue: auto;')
        style.blockEllipsis = initial('block-ellipsis')
        style.continue = '-webkit-legacy'
        assert.equal(style.webkitLineClamp, '')
        assert.equal(style.cssText, 'line-clamp: 1 no-ellipsis -webkit-legacy;')
        style.maxLines = initial('max-lines')
        style.blockEllipsis = 'auto'
        assert.equal(style.webkitLineClamp, '')
        assert.equal(style.cssText, 'line-clamp: auto -webkit-legacy;')
        style.blockEllipsis = initial('block-ellipsis')
        style.continue = initial('continue')
        assert.equal(style.webkitLineClamp, '')
        assert.equal(style.cssText, 'line-clamp: none;')
    })
})
describe('-webkit-text-stroke', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('-webkit-text-stroke')[0]

        // Initial longhand values
        style.webkitTextStroke = '0 currentColor'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.webkitTextStroke, '0px')

        // Omitted values
        style.webkitTextStroke = '0px'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.webkitTextStroke, '0px')
        style.webkitTextStroke = 'green'
        assert.equal(style.webkitTextStrokeWidth, initial('-webkit-text-stroke-width'))
        assert.equal(style.webkitTextStrokeColor, 'green')
        assert.equal(style.webkitTextStroke, 'green')
    })
})
describe('all', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('all')[0]

        style.all = 'initial'

        // All equal longhand values
        assert.equal(style.length, longhands.length)
        assert.equal(style[longhands[0]], 'initial')
        assert.equal(style.all, 'initial')
        assert.equal(style.cssText, 'all: initial;')
        assert.equal(style.direction, '')
        assert.equal(style.unicodeBidi, '')

        // All longhands cannot be represented
        const [head, ...tail] = longhands
        const represented = new Set([head])
        const initial = tail.reduce(
            (properties, property) => {
                if (represented.has(property)) {
                    return properties
                }
                for (const [shorthand, subProperties] of shorthands) {
                    const longhands = subProperties.flat()
                    if (shorthand === 'all' || longhands.length === 1) {
                        continue
                    }
                    if (longhands.includes(property) && !longhands.some(property => represented.has(property))) {
                        longhands.forEach(property => represented.add(property))
                        properties.add(shorthand)
                        return properties
                    }
                }
                represented.add(property)
                return properties.add(property)
            },
            new Set)
        style[head] = 'inherit'
        assert.equal(style.all, '')
        assert.equal(style.cssText, `${[...initial].map(name => `${name}: initial`).join('; ')}; ${head}: inherit;`)
    })
})
describe('animation', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const subProperties = shorthands.get('animation')
        const longhands = subProperties.flat()
        const [, resetOnly] = subProperties
        const animation = 'auto ease 0s 1 normal none running none auto'

        // Initial longhand values
        style.animation = animation
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.animation, animation)

        // Omitted values
        style.animation = 'auto'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.animation, animation)
        style.animation = 'linear'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'animation-timing-function' ? 'linear' : initial(longhand)))
        assert.equal(style.animation, animation.replace('ease', 'linear'))

        // All longhands cannot be represented
        style.animationName = 'none, none'
        assert.equal(style.animation, '')
        assert.equal(style.cssText, 'animation-duration: auto; animation-timing-function: linear; animation-delay: 0s; animation-iteration-count: 1; animation-direction: normal; animation-fill-mode: none; animation-play-state: running; animation-name: none, none; animation-timeline: auto; animation-composition: replace; animation-range: normal; animation-trigger: none;')

        // Coordinated value list
        style.animation = `${animation}, ${animation}`
        longhands.forEach(longhand =>
            assert.equal(
                style[longhand],
                resetOnly.includes(longhand)
                    ? initial(longhand)
                    : `${initial(longhand)}, ${initial(longhand)}`))
        assert.equal(style.animation, `${animation}, ${animation}`)
    })
})
describe('animation-range', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('animation-range')[0]

        // Initial longhand values
        style.animationRange = 'normal normal'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.animationRange, 'normal')

        // Omitted values
        const values = [
            ['normal'],
            ['0%', '0%', 'normal'],
            ['normal 0%', 'normal', '0%'],
            ['entry'],
            ['entry 10%', 'entry 10%', 'entry'],
            ['entry 0% entry 100%', 'entry', 'entry', 'entry'],
            ['entry exit 100%', 'entry', 'exit', 'entry exit'],
            ['entry 0% 100%', 'entry', '100%', 'entry 0% 100%'],
            ['entry normal', 'entry', 'normal', 'entry normal'],
        ]
        values.forEach(([input, start = input, end = start, expected = input]) => {
            style.animationRange = input
            assert.equal(style.animationRangeStart, start)
            assert.equal(style.animationRangeEnd, end)
            assert.equal(style.animationRange, expected)
        })

        // All longhands cannot be represented
        style.animationRangeStart = 'normal, normal'
        assert.equal(style.animationRange, '')
        assert.equal(style.cssText, 'animation-range-start: normal, normal; animation-range-end: normal;')

        // Coordinated value list
        style.animationRange = 'normal, normal'
        longhands.forEach(longhand => assert.equal(style[longhand], `${initial(longhand)}, ${initial(longhand)}`))
        assert.equal(style.animationRange, 'normal, normal')
    })
})
describe('background', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const subProperties = shorthands.get('background')
        const longhands = subProperties.flat()
        const [, resetOnly] = subProperties
        const background = 'none 0% 0% / auto auto repeat repeat scroll padding-box border-box transparent'

        // Initial longhand values + important
        style.cssText = `background: ${background} !important`
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => {
            assert.equal(style[longhand], initial(longhand))
            assert.equal(style.getPropertyPriority(longhand), 'important')
        })
        assert.equal(style.background, 'none')
        assert.equal(style.getPropertyPriority('background'), 'important')
        assert.equal(style.cssText, 'background: none !important;')

        // Empty string
        style.background = ''
        longhands.forEach(longhand => assert.equal(style[longhand], ''))
        assert.equal(style.background, '')

        // CSS-wide keyword
        style.background = 'initial'
        longhands.forEach(longhand => assert.equal(style[longhand], 'initial'))
        assert.equal(style.background, 'initial')

        // Pending substitution
        style.background = 'var(--custom)'
        longhands.forEach(longhand => assert.equal(style[longhand], ''))
        assert.equal(style.background, 'var(--custom)')
        style.background = 'toggle(none)'
        longhands.forEach(longhand => assert.equal(style[longhand], ''))
        assert.equal(style.background, 'toggle(none)')

        // Omitted values
        const values = [
            ['none'],
            ['0% 0% / cover', { 'background-size': 'cover' }],
            ['repeat-x', { 'background-repeat-y': 'no-repeat' }],
            ['repeat-y', { 'background-repeat-x': 'no-repeat' }],
            ['space', { 'background-repeat-x': 'space', 'background-repeat-y': 'space' }],
            ['padding-box', { 'background-clip': 'padding-box' }],
            ['border-box', { 'background-origin': 'border-box' }],
            ['padding-box content-box', { 'background-clip': 'content-box' }],
            ['border-area', { 'background-clip': 'border-area' }],
        ]
        values.forEach(([input, declared = {}]) => {
            style.background = input
            longhands.forEach(longhand => assert.equal(style[longhand], declared[longhand] ?? initial(longhand)))
            assert.equal(style.background, input)
        })

        // All longhands cannot be represented
        style.backgroundImage = 'none, none'
        assert.equal(style.background, '')
        assert.equal(style.cssText, 'background-image: none, none; background-position: 0% 0%; background-size: auto auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-area; background-color: transparent; background-blend-mode: normal;')
        style.backgroundImage = 'initial'
        assert.equal(style.background, '')
        assert.equal(style.cssText, 'background-image: initial; background-position: 0% 0%; background-size: auto auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-area; background-color: transparent; background-blend-mode: normal;')
        style.setProperty('background-image', 'none', 'important')
        assert.equal(style.background, '')
        assert.equal(style.cssText, 'background-image: none !important; background-position: 0% 0%; background-size: auto auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-area; background-color: transparent; background-blend-mode: normal;')
        style.background = 'var(--custom)'
        style.backgroundImage = 'var(--custom)'
        assert.equal(style.background, '')
        assert.equal(style.cssText, 'background-image: var(--custom); background-position: ; background-size: ; background-repeat-x: ; background-repeat-y: ; background-attachment: ; background-origin: ; background-clip: ; background-color: ; background-blend-mode: ;')
        style.background = 'toggle(initial)'
        style.backgroundImage = 'toggle(initial)'
        assert.equal(style.background, '')
        assert.equal(style.cssText, 'background-image: toggle(initial); background-position: ; background-size: ; background-repeat-x: ; background-repeat-y: ; background-attachment: ; background-origin: ; background-clip: ; background-color: ; background-blend-mode: ;')

        // Coordinated value list
        style.background = `${background.replace(' transparent', '')}, ${background}`
        longhands.forEach(longhand =>
            assert.equal(
                style[longhand],
                (longhand === 'background-color' || resetOnly.includes(longhand))
                    ? initial(longhand)
                    : `${initial(longhand)}, ${initial(longhand)}`))
        assert.equal(style.background, 'none, none')
    })
})
describe('background-repeat', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('background-repeat')[0]

        // Initial longhand values
        style.backgroundRepeat = 'repeat repeat'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.backgroundRepeat, 'repeat')

        // Omitted values
        const values = [
            ['no-repeat'],
            ['repeat space', 'repeat', 'space'],
            ['repeat-x', 'repeat', 'no-repeat'],
            ['repeat-y', 'no-repeat', 'repeat'],
        ]
        values.forEach(([input, x = input, y = x]) => {
            style.backgroundRepeat = input
            assert.equal(style.backgroundRepeatX, x)
            assert.equal(style.backgroundRepeatY, y)
            assert.equal(style.backgroundRepeat, input)
        })
    })
})
describe('block-step', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('block-step')[0]

        // Initial longhand values
        style.blockStep = 'none margin-box auto up'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.blockStep, 'none')

        // Omitted values
        style.blockStep = 'none'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.blockStep, 'none')
        style.blockStep = 'padding-box'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'block-step-insert' ? 'padding-box' : initial(longhand)))
        assert.equal(style.blockStep, 'padding-box')
    })
})
describe('border', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border').flat()

        // Initial longhand values
        style.border = 'medium none currentColor'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.border, 'medium')

        // Omitted values
        style.border = 'medium'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.border, 'medium')
        style.border = 'solid'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand.endsWith('style') ? 'solid' : initial(longhand)))
        assert.equal(style.border, 'solid')

        // All longhands cannot be represented
        style.borderImageWidth = '1px'
        assert.equal(style.border, '')
        assert.equal(style.cssText, 'border-width: medium; border-style: solid; border-color: currentcolor; border-image: 100% / 1px;')

        // Interleaved logical property declaration
        style.cssText = 'border: 1px solid red; border-block-start-width: 2px; border-block-end-width: 2px; border-color: green'
        assert.equal(style.border, '1px solid green')
        assert.equal(style.cssText, 'border: 1px solid green; border-block-width: 2px;')
        style.cssText = 'border: 1px solid red; border-block-start-color: orange; border-block-end-color: orange; border-color: green'
        assert.equal(style.border, '1px solid green')
        /* (Ideally) assert.equal(style.cssText, 'border-block-color: orange; border: 1px solid green;') */
        assert.equal(style.cssText, 'border-width: 1px; border-style: solid; border-image: none; border-block-color: orange; border-color: green;')
        style.cssText = 'border: 1px solid red; border-block-start-color: orange; border-block-start-width: 1px; border-color: green'
        assert.equal(style.border, '1px solid green')
        /* (Ideally) assert.equal(style.cssText, 'border-block-start-color: orange; border: 1px solid green; border-block-start-width: 1px;') */
        assert.equal(style.cssText, 'border-width: 1px; border-style: solid; border-image: none; border-block-start-color: orange; border-block-start-width: 1px; border-color: green;')
        style.cssText = 'border-image: none; border-block-start-width: 2px; border-width: 1px; border-style: solid; border-color: green;'
        assert.equal(style.border, '1px solid green')
        assert.equal(style.cssText, 'border-image: none; border-block-start-width: 2px; border-width: 1px; border-style: solid; border-color: green;')
    })
})
describe('border-block, border-inline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-block')[0]

        // Initial longhand values
        style.borderBlock = 'medium none currentColor'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.borderBlock, 'medium')

        // Omitted values
        style.borderBlock = 'medium'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.borderBlock, 'medium')
        style.borderBlock = 'solid'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand.endsWith('style') ? 'solid' : initial(longhand)))
        assert.equal(style.borderBlock, 'solid')

        // Interleaved logical property declaration
        style.cssText = 'border-block-width: 1px; border-top-width: 2px; border-block-style: solid; border-block-color: green'
        assert.equal(style.borderBlock, '1px solid green')
        assert.equal(style.cssText, 'border-block: 1px solid green; border-top-width: 2px;')
        style.cssText = 'border-block-width: 1px; border-top-style: none; border-block-style: solid; border-block-color: green'
        assert.equal(style.borderBlock, '1px solid green')
        /* (Ideally) assert.equal(style.cssText, 'border-top-style: none; border-block: 1px solid green;') */
        assert.equal(style.cssText, 'border-block-width: 1px; border-top-style: none; border-block-style: solid; border-block-color: green;')
        style.cssText = 'border-block-width: 1px; border-top-width: 2px; border-top-style: none; border-block-style: solid; border-block-color: green'
        assert.equal(style.borderBlock, '1px solid green')
        /* (Ideally) assert.equal(style.cssText, 'border-top-style: none; border-block: 1px solid green; border-top-width: 2px;') */
        assert.equal(style.cssText, 'border-block-width: 1px; border-top-width: 2px; border-top-style: none; border-block-style: solid; border-block-color: green;')
    })
})
describe('border-block-color, border-inline-color', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-block-color')[0]

        // Initial longhand values
        style.borderBlockColor = 'currentColor currentColor'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.borderBlockColor, 'currentcolor')

        // Omitted values
        style.borderBlockColor = 'green'
        longhands.forEach(longhand => assert.equal(style[longhand], 'green'))
        assert.equal(style.borderBlockColor, 'green')
        style.borderBlockColor = 'currentColor green'
        assert.equal(style.borderBlockStartColor, initial('border-block-start-color'))
        assert.equal(style.borderBlockEndColor, 'green')
        assert.equal(style.borderBlockColor, 'currentcolor green')
    })
})
describe('border-block-end-radius, border-block-start-radius, border-bottom-radius, border-inline-end-radius, border-inline-start-radius, border-left-radius, border-right-radius, border-top-radius', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-block-end-radius')[0]

        // Initial longhand values
        style.borderBlockEndRadius = '0 0 / 0 0'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.borderBlockEndRadius, '0px')

        // Omitted values
        style.borderBlockEndRadius = '1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '1px'))
        assert.equal(style.borderBlockEndRadius, '1px')
        style.borderBlockEndRadius = '0px 1px / 0px'
        assert.equal(style.borderEndStartRadius, initial('border-end-start-radius'))
        assert.equal(style.borderEndEndRadius, '1px 0px')
        assert.equal(style.borderBlockEndRadius, '0px 1px / 0px')
        style.borderBlockEndRadius = '0px / calc(0px)'
        longhands.forEach(longhand => assert.equal(style[longhand], '0px calc(0px)'))
        assert.equal(style.borderBlockEndRadius, '0px / calc(0px)')
        style.borderBlockEndRadius = '0px / 1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '0px 1px'))
        assert.equal(style.borderBlockEndRadius, '0px / 1px')
    })
})
describe('border-block-style, border-inline-style', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-block-style')[0]

        // Initial longhand values
        style.borderBlockStyle = 'none none'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.borderBlockStyle, 'none')

        // Omitted values
        style.borderBlockStyle = 'solid'
        longhands.forEach(longhand => assert.equal(style[longhand], 'solid'))
        assert.equal(style.borderBlockStyle, 'solid')
        style.borderBlockStyle = 'none solid'
        assert.equal(style.borderBlockStartStyle, initial('border-block-start-style'))
        assert.equal(style.borderBlockEndStyle, 'solid')
        assert.equal(style.borderBlockStyle, 'none solid')
    })
})
describe('border-block-width, border-inline-width', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-block-width')[0]

        // Initial longhand values
        style.borderBlockWidth = 'medium medium'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.borderBlockWidth, 'medium')

        // Omitted values
        style.borderBlockWidth = '1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '1px'))
        assert.equal(style.borderBlockWidth, '1px')
        style.borderBlockWidth = 'medium 1px'
        assert.equal(style.borderBlockStartWidth, initial('border-block-start-width'))
        assert.equal(style.borderBlockEndWidth, '1px')
        assert.equal(style.borderBlockWidth, 'medium 1px')
    })
})
describe('border-block-end, border-block-start, border-bottom, border-inline-end, border-inline-start, border-left, border-right, border-top', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-top')[0]

        // Initial longhand values
        style.borderTop = 'medium none currentColor'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.borderTop, 'medium')

        // Omitted values
        style.borderTop = 'medium'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.borderTop, 'medium')
        style.borderTop = 'solid'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand.endsWith('style') ? 'solid' : initial(longhand)))
        assert.equal(style.borderTop, 'solid')
    })
})
describe('border-clip, border-block-clip, border-inline-clip', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-clip')[0]

        // All equal longhand values
        style.borderClip = 'none'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.borderClip, 'none')

        // All longhands cannot be represented
        style.borderTopClip = '1px'
        assert.equal(style.borderClip, '')
        assert.equal(style.cssText, 'border-top-clip: 1px; border-right-clip: none; border-bottom-clip: none; border-left-clip: none;')
    })
})
describe('border-color', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-color')[0]

        // Initial longhand values
        style.borderColor = 'currentColor currentColor currentColor currentColor'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.borderColor, 'currentcolor')

        // Omitted values
        const values = ['currentcolor', 'red', 'green']
        style.borderColor = 'red'
        longhands.forEach(longhand => assert.equal(style[longhand], 'red'))
        assert.equal(style.borderColor, 'red')
        style.borderColor = 'currentColor red'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i % 2]))
        assert.equal(style.borderColor, 'currentcolor red')
        style.borderColor = 'currentColor red green'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i === 3 ? 1 : i]))
        assert.equal(style.borderColor, 'currentcolor red green')

        // Interleaved logical property declaration
        style.cssText = 'border-top-color: green; border-block-start-color: orange; border-right-color: green; border-bottom-color: green; border-left-color: green'
        assert.equal(style.borderColor, 'green')
        assert.equal(style.cssText, 'border-top-color: green; border-block-start-color: orange; border-right-color: green; border-bottom-color: green; border-left-color: green;')
        style.cssText = 'border-top-color: green; border-block-start-width: 1px; border-right-color: green; border-bottom-color: green; border-left-color: green'
        assert.equal(style.borderColor, 'green')
        assert.equal(style.cssText, 'border-color: green; border-block-start-width: 1px;')
    })
})
describe('border-image', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-image')[0]

        // Initial longhand values
        style.borderImage = 'none 100% / 1 / 0 stretch'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.borderImage, 'none')

        // Omitted values
        const values = [
            ['none'],
            ['100% / 0', { 'border-image-width': '0' }],
            ['100% / / 1', { 'border-image-outset': '1' }, '100% / 1 / 1'],
        ]
        values.forEach(([input, declared = {}, expected = input]) => {
            style.borderImage = input
            longhands.forEach(longhand => assert.equal(style[longhand], declared[longhand] ?? initial(longhand)))
            assert.equal(style.borderImage, expected)
        })
    })
})
describe('border-radius', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-radius')[0]

        // Initial longhand values
        style.borderRadius = '0 0 0 0 / 0 0 0 0'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.borderRadius, '0px')

        // Omitted values
        style.borderRadius = '1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '1px'))
        assert.equal(style.borderRadius, '1px')
        style.borderRadius = '0px 1px 2px 3px / 0px 1px'
        assert.equal(style.borderTopLeftRadius, initial('border-top-left-radius'))
        assert.equal(style.borderTopRightRadius, '1px')
        assert.equal(style.borderBottomRightRadius, '2px 0px')
        assert.equal(style.borderBottomLeftRadius, '3px 1px')
        assert.equal(style.borderRadius, '0px 1px 2px 3px / 0px 1px')
        style.borderRadius = '0px / 1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '0px 1px'))
        assert.equal(style.borderRadius, '0px / 1px')
        style.borderRadius = '0px / calc(0px)'
        longhands.forEach(longhand => assert.equal(style[longhand], '0px calc(0px)'))
        assert.equal(style.borderRadius, '0px / calc(0px)')
    })
})
describe('border-style', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-style')[0]

        // Initial longhand values
        style.borderStyle = 'none none none none'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.borderStyle, 'none')

        // Omitted values
        const values = ['none', 'dashed', 'solid']
        style.borderStyle = 'solid'
        longhands.forEach(longhand => assert.equal(style[longhand], 'solid'))
        assert.equal(style.borderStyle, 'solid')
        style.borderStyle = 'none dashed'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i % 2]))
        assert.equal(style.borderStyle, 'none dashed')
        style.borderStyle = 'none dashed solid'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i === 3 ? 1 : i]))
        assert.equal(style.borderStyle, 'none dashed solid')
    })
})
describe('border-width', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-width')[0]

        // Initial longhand values
        style.borderWidth = 'medium medium medium medium'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.borderWidth, 'medium')

        // Omitted values
        const values = ['medium', '1px', '2px']
        style.borderWidth = '1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '1px'))
        assert.equal(style.borderWidth, '1px')
        style.borderWidth = 'medium 1px'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i % 2]))
        assert.equal(style.borderWidth, 'medium 1px')
        style.borderWidth = 'medium 1px 2px'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i === 3 ? 1 : i]))
        assert.equal(style.borderWidth, 'medium 1px 2px')
    })
})
describe('box-shadow', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('box-shadow')[0]
        const shadow = 'currentcolor none 0px 0px outset'

        // Initial longhand values
        style.boxShadow = 'currentColor none 0 0 outset'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.boxShadow, 'currentcolor none')

        // Omitted values
        const values = [
            ['none', { 'box-shadow-color': 'transparent' }],
            ['none 1px', { 'box-shadow-blur': '1px', 'box-shadow-color': 'transparent' }],
            ['0px 0px', { 'box-shadow-offset': '0px 0px' }],
        ]
        values.forEach(([input, declared = {}]) => {
            style.boxShadow = input
            longhands.forEach(longhand => assert.equal(style[longhand], declared[longhand] ?? initial(longhand)))
            assert.equal(style.boxShadow, input)
        })

        // All longhands cannot be represented
        style.boxShadowOffset = '0px 0px, 0px 0px'
        assert.equal(style.boxShadow, '')
        assert.equal(style.cssText, 'box-shadow-color: currentcolor; box-shadow-offset: 0px 0px, 0px 0px; box-shadow-blur: 0px; box-shadow-spread: 0px; box-shadow-position: outset;')

        // Coordinated value list
        style.boxShadow = `${shadow}, ${shadow}`
        longhands.forEach(longhand => assert.equal(style[longhand], `${initial(longhand)}, ${initial(longhand)}`))
        assert.equal(style.boxShadow, 'currentcolor none, currentcolor none')
    })
})
describe('caret', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('caret')[0]

        // Initial longhand values
        style.caret = 'auto auto auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.caret, 'auto')

        // Omitted values
        style.caret = 'auto'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.caret, 'auto')
        style.caret = 'manual'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'caret-animation' ? 'manual' : initial(longhand)))
        assert.equal(style.caret, 'manual')
    })
})
describe('column-rule, row-rule', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('column-rule')[0]

        // Initial longhand values
        style.columnRule = 'medium none currentColor'
        assert.equal(style.length, longhands.length)
        assert.equal(style.columnRule, 'medium')

        // Omitted values
        style.columnRule = 'medium'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.columnRule, 'medium')
        style.columnRule = 'solid'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand.endsWith('style') ? 'solid' : initial(longhand)))
        assert.equal(style.columnRule, 'solid')

        // repeat()
        style.columnRule = 'solid, repeat(2, solid, none), none'
        assert.equal(style.columnRuleWidth, 'medium repeat(2, medium medium) medium')
        assert.equal(style.columnRuleStyle, 'solid repeat(2, solid none) none')
        assert.equal(style.columnRuleColor, 'currentcolor repeat(2, currentcolor currentcolor) currentcolor')
        assert.equal(style.columnRule, 'solid, repeat(2, solid, medium), medium')

        // All longhands cannot be represented
        style.columnRule = 'repeat(1, medium), medium'
        style.columnRuleWidth = 'medium repeat(1, medium)'
        assert.equal(style.columnRule, '')
        assert.equal(style.cssText, 'column-rule-width: medium repeat(1, medium); column-rule-style: repeat(1, none) none; column-rule-color: repeat(1, currentcolor) currentcolor;')
        style.columnRule = 'repeat(1, medium)'
        style.columnRuleWidth = 'repeat(2, medium)'
        assert.equal(style.columnRule, '')
        assert.equal(style.cssText, 'column-rule-width: repeat(2, medium); column-rule-style: repeat(1, none); column-rule-color: repeat(1, currentcolor);')
    })
})
describe('columns', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('columns')[0]

        // Initial longhand values
        style.columns = 'auto auto / auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.columns, 'auto')

        // Omitted values
        const values = [
            ['auto'],
            ['1', { 'column-count': '1' }],
            ['auto / 1px', { 'column-height': '1px' }],
        ]
        values.forEach(([input, declared = {}]) => {
            style.columns = input
            longhands.forEach(longhand => assert.equal(style[longhand], declared[longhand] ?? initial(longhand)))
            assert.equal(style.columns, input)
        })
    })
})
describe('contain-intrinsic-size', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('contain-intrinsic-size')[0]

        // Initial longhand values
        style.containIntrinsicSize = 'none none'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.containIntrinsicSize, 'none')

        // Omitted values
        style.containIntrinsicSize = '1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '1px'))
        assert.equal(style.containIntrinsicSize, '1px')
        style.containIntrinsicSize = 'none 1px'
        assert.equal(style.containIntrinsicWidth, initial('contain-intrinsic-width'))
        assert.equal(style.containIntrinsicHeight, '1px')
        assert.equal(style.containIntrinsicSize, 'none 1px')
    })
})
describe('container', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('container')[0]

        // Initial longhand values
        style.container = 'none / normal'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.container, 'none')

        // Omitted values
        style.container = 'none'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.container, 'none')
        style.container = 'none / size'
        assert.equal(style.containerName, initial('container-name'))
        assert.equal(style.containerType, 'size')
        assert.equal(style.container, 'none / size')
    })
})
describe('corner', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('corner')[0]

        // Initial longhand values
        style.corner = '0 0 0 0 / 0 0 0 0 round round round round'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.corner, '0px')

        // Omitted values
        const values = [
            ['1px', {
                'border-bottom-left-radius': '1px',
                'border-bottom-right-radius': '1px',
                'border-top-left-radius': '1px',
                'border-top-right-radius': '1px',
            }],
            ['0px 1px 2px 3px / 0px 1px', {
                'border-bottom-left-radius': '3px 1px',
                'border-bottom-right-radius': '2px 0px',
                'border-top-right-radius': '1px',
            }],
            ['0px / 1px', {
                'border-bottom-left-radius': '0px 1px',
                'border-bottom-right-radius': '0px 1px',
                'border-top-left-radius': '0px 1px',
                'border-top-right-radius': '0px 1px',
            }],
            ['scoop', {
                'corner-bottom-left-shape': 'scoop',
                'corner-bottom-right-shape': 'scoop',
                'corner-top-left-shape': 'scoop',
                'corner-top-right-shape': 'scoop',
            }],
            ['round scoop', {
                'corner-bottom-left-shape': 'scoop',
                'corner-top-right-shape': 'scoop',
            }],
            ['round scoop bevel', {
                'corner-bottom-left-shape': 'scoop',
                'corner-bottom-right-shape': 'bevel',
                'corner-top-right-shape': 'scoop',
            }],
        ]
        values.forEach(([input, declared]) => {
            style.corner = input
            longhands.forEach(longhand => assert.equal(style[longhand], declared[longhand] ?? initial(longhand)))
            assert.equal(style.corner, input)
        })
    })
})
describe('corner-block-end, corner-block-start, corner-bottom, corner-inline-end, corner-inline-start, corner-left, corner-right, corner-top', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('corner-block-end')[0]

        // Initial longhand values
        style.cornerBlockEnd = '0 0 / 0 0 round round'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.cornerBlockEnd, '0px')

        // Omitted values
        style.cornerBlockEnd = '1px'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand.endsWith('radius') ? '1px' : initial(longhand)))
        assert.equal(style.cornerBlockEnd, '1px')
        style.cornerBlockEnd = '0px 1px / 0px'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'border-end-end-radius' ? '1px 0px' : initial(longhand)))
        assert.equal(style.cornerBlockEnd, '0px 1px / 0px')
        style.cornerBlockEnd = '0px / calc(0px)'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand.includes('radius') ? '0px calc(0px)' : initial(longhand)))
        assert.equal(style.cornerBlockEnd, '0px / calc(0px)')
        style.cornerBlockEnd = '0px / 1px'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand.includes('radius') ? '0px 1px' : initial(longhand)))
        assert.equal(style.cornerBlockEnd, '0px / 1px')
        style.cornerBlockEnd = 'scoop'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand.includes('shape') ? 'scoop' : initial(longhand)))
        assert.equal(style.cornerBlockEnd, 'scoop')
        style.cornerBlockEnd = 'round scoop'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'corner-end-end-shape' ? 'scoop' : initial(longhand)))
        assert.equal(style.cornerBlockEnd, 'round scoop')
    })
})
describe('corner-end-end, corner-end-start, corner-bottom-left, corner-bottom-right, corner-start-end, corner-start-start, corner-top-left, corner-top-right', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('corner-end-end')[0]

        // Initial longhand values
        style.cornerEndEnd = '0 0 round'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.cornerEndEnd, '0px')

        // Omitted values
        style.cornerEndEnd = '0px'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.cornerEndEnd, '0px')
        style.cornerEndEnd = 'scoop'
        assert.equal(style.borderEndEndRadius, initial('border-end-end-radius'))
        assert.equal(style.cornerEndEndShape, 'scoop')
        assert.equal(style.cornerEndEnd, 'scoop')
    })
})
describe('corner-shape', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('corner-shape')[0]

        // Initial longhand values
        style.cornerShape = 'round round round round'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.cornerShape, 'round')

        // Omitted values
        const values = ['round', 'scoop', 'bevel']
        style.cornerShape = 'scoop'
        longhands.forEach(longhand => assert.equal(style[longhand], 'scoop'))
        assert.equal(style.cornerShape, 'scoop')
        style.cornerShape = 'round scoop'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i % 2]))
        assert.equal(style.cornerShape, 'round scoop')
        style.cornerShape = 'round scoop bevel'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i === 3 ? 1 : i]))
        assert.equal(style.cornerShape, 'round scoop bevel')
    })
})
describe('corner-block-end-shape, corner-block-start-shape, corner-bottom-shape, corner-inline-end-shape, corner-inline-start-shape, corner-left-shape, corner-right-shape, corner-top-shape', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('corner-block-end-shape')[0]

        // Initial longhand values
        style.cornerBlockEndShape = 'round round'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.cornerBlockEndShape, 'round')

        // Omitted values
        style.cornerBlockEndShape = 'scoop'
        longhands.forEach(longhand => assert.equal(style[longhand], 'scoop'))
        assert.equal(style.cornerBlockEndShape, 'scoop')
        style.cornerBlockEndShape = 'round scoop'
        assert.equal(style.cornerEndStartShape, initial('corner-end-start-shape'))
        assert.equal(style.cornerEndEndShape, 'scoop')
        assert.equal(style.cornerBlockEndShape, 'round scoop')
    })
})
describe('cue, pause, rest', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('cue')[0]

        // Initial longhand values
        style.cue = 'none none'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.cue, 'none')

        // Omitted values
        style.cue = 'none'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.cue, 'none')
        style.cue = 'none url("icon.wav")'
        assert.equal(style.cueBefore, initial('cue-before'))
        assert.equal(style.cueAfter, 'url("icon.wav")')
        assert.equal(style.cue, 'none url("icon.wav")')
    })
})
describe('event-trigger', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('event-trigger')[0]

        // Initial longhand values
        style.eventTrigger = 'none none'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.eventTrigger, 'none')

        // All longhands cannot be represented
        style.eventTriggerName = '--trigger, --trigger'
        assert.equal(style.eventTrigger, '')
        assert.equal(style.cssText, 'event-trigger-name: --trigger, --trigger; event-trigger-source: none;')

        // Coordinated value list
        style.eventTrigger = '--trigger none, --trigger none'
        longhands.forEach(longhand =>
            assert.equal(
                style[longhand],
                longhand === 'event-trigger-name' ? '--trigger, --trigger' : 'none, none'))
        assert.equal(style.eventTrigger, '--trigger none, --trigger none')
    })
})
describe('flex', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('flex')[0]

        // Initial longhand values
        style.flex = '0 1 auto'
        assert.equal(style.length, longhands.length)
        assert.equal(style.flexGrow, '0')
        assert.equal(style.flexShrink, '1')
        assert.equal(style.flexBasis, 'auto')
        assert.equal(style.flex, '0 auto')

        // Omitted values
        style.flex = '1'
        assert.equal(style.flexGrow, '1')
        assert.equal(style.flexShrink, '1')
        assert.equal(style.flexBasis, '0px')
        assert.equal(style.flex, '1')
        style.flex = '1 1'
        assert.equal(style.flexGrow, '1')
        assert.equal(style.flexShrink, '1')
        assert.equal(style.flexBasis, '0px')
        assert.equal(style.flex, '1')
        style.flex = '0px'
        assert.equal(style.flexGrow, '1')
        assert.equal(style.flexShrink, '1')
        assert.equal(style.flexBasis, '0px')
        assert.equal(style.flex, '1')

        // none
        style.flex = 'none'
        assert.equal(style.flexGrow, '0')
        assert.equal(style.flexShrink, '0')
        assert.equal(style.flexBasis, 'auto')
        assert.equal(style.flex, 'none')
    })
})
describe('flex-flow', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('flex-flow')[0]

        // Initial longhand values
        style.flexFlow = 'row nowrap'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.flexFlow, 'row')

        // Omitted values
        style.flexFlow = 'row'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.flexFlow, 'row')
        style.flexFlow = 'wrap'
        assert.equal(style.flexDirection, initial('flex-direction'))
        assert.equal(style.flexWrap, 'wrap')
        assert.equal(style.flexFlow, 'wrap')
    })
})
describe('font', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const subProperties = shorthands.get('font')
        const [, resetOnly] = subProperties
        const longhands = subProperties.flat()

        // Initial longhand values
        style.font = 'normal normal normal normal medium / normal monospace'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.font, 'medium monospace')

        // Omitted values
        style.font = 'medium monospace'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.font, 'medium monospace')
        style.font = 'medium / 1 monospace'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'line-height' ? '1' : initial(longhand)))
        assert.equal(style.font, 'medium / 1 monospace')

        // All longhands cannot be represented
        style.fontVariantCaps = 'all-petite-caps'
        assert.equal(style.font, '')
        assert.equal(style.cssText, 'font-style: normal; font-variant: all-petite-caps; font-weight: normal; font-width: normal; font-size: medium; line-height: 1; font-family: monospace; font-feature-settings: normal; font-kerning: auto; font-language-override: normal; font-optical-sizing: auto; font-size-adjust: none; font-variation-settings: normal;')
        style.fontVariantCaps = initial('font-variant-caps')
        style.fontWidth = '110%'
        assert.equal(style.font, '')
        assert.equal(style.cssText, 'font-style: normal; font-variant: normal; font-weight: normal; font-width: 110%; font-size: medium; line-height: 1; font-family: monospace; font-feature-settings: normal; font-kerning: auto; font-language-override: normal; font-optical-sizing: auto; font-size-adjust: none; font-variation-settings: normal;')

        // System font
        style.font = 'caption'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], resetOnly.includes(longhand) ? initial(longhand) : ''))
        assert.equal(style.font, 'caption')
        style.fontStyle = 'italic'
        assert.equal(style.font, '')
        assert.equal(style.cssText, 'font-style: italic; font-variant-ligatures: ; font-variant-caps: ; font-variant-alternates: ; font-variant-numeric: ; font-variant-east-asian: ; font-variant-position: ; font-variant-emoji: ; font-weight: ; font-width: ; font-size: ; line-height: ; font-family: ; font-feature-settings: normal; font-kerning: auto; font-language-override: normal; font-optical-sizing: auto; font-size-adjust: none; font-variation-settings: normal;')
    })
})
describe('font-synthesis', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('font-synthesis')[0]

        // Initial longhand values
        style.fontSynthesis = 'weight style small-caps position'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.fontSynthesis, 'weight style small-caps position')

        // Omitted values
        const values = [
            ['none', ['none', 'none', 'none', 'none']],
            ['weight', ['auto', 'none', 'none', 'none']],
            ['style', ['none', 'auto', 'none', 'none']],
            ['small-caps', ['none', 'none', 'auto', 'none']],
            ['position', ['none', 'none', 'none', 'auto']],
            ['weight style', ['auto', 'auto', 'none', 'none']],
            ['weight small-caps', ['auto', 'none', 'auto', 'none']],
            ['weight position', ['auto', 'none', 'none', 'auto']],
            ['style small-caps', ['none', 'auto', 'auto', 'none']],
            ['style position', ['none', 'auto', 'none', 'auto']],
            ['weight style small-caps', ['auto', 'auto', 'auto', 'none']],
            ['weight style position', ['auto', 'auto', 'none', 'auto']],
            ['weight small-caps position', ['auto', 'none', 'auto', 'auto']],
            ['style small-caps position', ['none', 'auto', 'auto', 'auto']],
        ]
        values.forEach(([input, expected]) => {
            style.fontSynthesis = input
            longhands.forEach((longhand, i) => assert.equal(style[longhand], expected[i]))
            assert.equal(style.fontSynthesis, input)
        })

        // All longhands cannot be represented
        style.fontSynthesisStyle = 'oblique-only'
        assert.equal(style.fontSynthesis, '')
        assert.equal(style.cssText, 'font-synthesis-weight: none; font-synthesis-style: oblique-only; font-synthesis-small-caps: auto; font-synthesis-position: auto;')
    })
})
describe('font-variant', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('font-variant')[0]

        // Initial longhand values (not all longhands can be explicitly declared)
        style.fontVariant = 'normal'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.fontVariant, 'normal')

        // Omitted values
        style.fontVariant = 'none'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'font-variant-ligatures' ? 'none' : initial(longhand)))
        assert.equal(style.fontVariant, 'none')
        style.fontVariant = 'small-caps'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'font-variant-caps' ? 'small-caps' : initial(longhand)))
        assert.equal(style.fontVariant, 'small-caps')

        // All longhands cannot be represented
        style.fontVariantLigatures = 'none'
        assert.equal(style.fontVariant, '')
        assert.equal(style.cssText, 'font-variant-ligatures: none; font-variant-caps: small-caps; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; font-variant-emoji: normal;')
    })
})
describe('gap', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('gap')[0]

        // Initial longhand values
        style.gap = 'normal normal'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.gap, 'normal')

        // Omitted values
        style.gap = 'normal'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.gap, 'normal')
        style.gap = 'normal 1px'
        assert.equal(style.rowGap, initial('row-gap'))
        assert.equal(style.columnGap, '1px')
        assert.equal(style.gap, 'normal 1px')
    })
})
describe('grid', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('grid')[0]

        // Explicit row and column templates
        style.grid = 'none / none'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.grid, 'none')

        // Implicit row track list and explicit column template
        style.grid = 'auto-flow none / none'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.grid, 'none')

        // Explicit row template and implicit column track list
        style.grid = 'none / auto-flow auto'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'grid-auto-flow' ? 'column' : initial(longhand)))
        assert.equal(style.grid, 'none / auto-flow')

        // Implicit row and column track list
        style.gridAutoRows = '1px'
        assert.equal(style.grid, '')
        assert.equal(style.cssText, 'grid-template: none; grid-auto-flow: column; grid-auto-rows: 1px; grid-auto-columns: auto;')
        style.gridAutoFlow = initial('grid-auto-flow')
        style.gridAutoColumns = '1px'
        assert.equal(style.grid, '')
        assert.equal(style.cssText, 'grid-template: none; grid-auto-flow: row; grid-auto-rows: 1px; grid-auto-columns: 1px;')
        style.gridAutoRows = initial('grid-auto-rows')
        assert.equal(style.grid, '')
        assert.equal(style.cssText, 'grid-template: none; grid-auto-flow: row; grid-auto-rows: auto; grid-auto-columns: 1px;')
        style.gridAutoColumns = initial('grid-auto-columns')

        // Explicit and implicit row track list
        style.gridTemplateRows = '1px'
        style.gridAutoRows = '1px'
        assert.equal(style.grid, '')
        assert.equal(style.cssText, 'grid-template: 1px / none; grid-auto-flow: row; grid-auto-rows: 1px; grid-auto-columns: auto;')
        style.gridAutoRows = initial('grid-auto-rows')
        style.gridAutoFlow = 'row dense'
        assert.equal(style.grid, '')
        assert.equal(style.cssText, 'grid-template: 1px / none; grid-auto-flow: dense; grid-auto-rows: auto; grid-auto-columns: auto;')
        style.gridAutoFlow = initial('grid-auto-flow')
        style.gridTemplateRows = initial('grid-template-rows')

        // Explicit and implicit column track list
        style.gridTemplateColumns = '1px'
        style.gridAutoColumns = '1px'
        assert.equal(style.grid, '')
        assert.equal(style.cssText, 'grid-template: none / 1px; grid-auto-flow: row; grid-auto-rows: auto; grid-auto-columns: 1px;')
        style.gridAutoColumns = initial('grid-auto-columns')
        style.gridAutoFlow = 'column'
        assert.equal(style.grid, '')
        assert.equal(style.cssText, 'grid-template: none / 1px; grid-auto-flow: column; grid-auto-rows: auto; grid-auto-columns: auto;')
        style.gridAutoFlow = initial('grid-auto-flow')
        style.gridTemplateColumns = initial('grid-template-columns')
    })
})
describe('grid-area', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('grid-area')[0]

        // Initial longhand values
        style.gridArea = 'auto / auto / auto / auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.gridArea, 'auto')

        // Omitted values
        const values = ['a', 'b', 'c']
        style.gridArea = 'a'
        longhands.forEach(longhand => assert.equal(style[longhand], 'a'))
        assert.equal(style.gridArea, 'a')
        style.gridArea = 'a / b'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i % 2]))
        assert.equal(style.gridArea, 'a / b')
        style.gridArea = 'a / b / c'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i === 3 ? 1 : i]))
        assert.equal(style.gridArea, 'a / b / c')
        style.gridArea = '1'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'grid-row-start' ? '1' : initial(longhand)))
        assert.equal(style.gridArea, '1')
        style.gridArea = '1 / auto / 1 / 1'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'grid-column-start' ? initial(longhand) : '1'))
        assert.equal(style.gridArea, '1 / auto / 1 / 1')
        style.gridArea = '1 / 1 / auto / 1'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'grid-row-end' ? initial(longhand) : '1'))
        assert.equal(style.gridArea, '1 / 1 / auto / 1')
        style.gridArea = '1 / 1 / 1 / 1'
        longhands.forEach(longhand => assert.equal(style[longhand], '1'))
        assert.equal(style.gridArea, '1 / 1 / 1 / 1')
    })
})
describe('grid-column, grid-row', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('grid-column')[0]

        // Initial longhand values
        style.gridColumn = 'auto / auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.gridColumn, 'auto')

        // Omitted values
        style.gridColumn = 'a'
        longhands.forEach(longhand => assert.equal(style[longhand], 'a'))
        assert.equal(style.gridColumn, 'a')
        style.gridColumn = 'a / b'
        assert.equal(style.gridColumnStart, 'a')
        assert.equal(style.gridColumnEnd, 'b')
        assert.equal(style.gridColumn, 'a / b')
        style.gridColumn = '1'
        assert.equal(style.gridColumnStart, '1')
        assert.equal(style.gridColumnEnd, initial('grid-column-end'))
        assert.equal(style.gridColumn, '1')
        style.gridColumn = '1 / 1'
        longhands.forEach(longhand => assert.equal(style[longhand], '1'))
        assert.equal(style.gridColumn, '1 / 1')
    })
})
describe('grid-template', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('grid-template')[0]

        // Row and column templates
        style.gridTemplate = 'none / none'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.gridTemplate, 'none')

        // Areas
        style.gridTemplate = `
            [top a-top] "a a" 1px  [a-bottom]
                [b-top] "b b" auto [b-bottom bottom]
            / auto`
        assert.equal(style.gridTemplateAreas, '"a a" "b b"')
        assert.equal(style.gridTemplateRows, '[top a-top] 1px [a-bottom b-top] auto [b-bottom bottom]')
        assert.equal(style.gridTemplateColumns, 'auto')
        assert.equal(style.gridTemplate, '[top a-top] "a a" 1px [a-bottom b-top] "b b" [b-bottom bottom] / auto')

        // Empty <line-names>
        style.gridTemplate = '[] "." [] [a] "." [] / [] 1px []'
        assert.equal(style.gridTemplateAreas, '"." "."')
        assert.equal(style.gridTemplateRows, 'auto [a] auto')
        assert.equal(style.gridTemplateColumns, '1px')
        assert.equal(style.gridTemplate, '"." [a] "." / 1px')

        // Areas and a shorter row track list
        style.gridTemplateRows = 'auto'
        assert.equal(style.gridTemplate, '')
        assert.equal(style.cssText, 'grid-template-rows: auto; grid-template-columns: 1px; grid-template-areas: "." ".";')

        // Areas and a longer row track list
        style.gridTemplateRows = 'auto auto auto'
        assert.equal(style.gridTemplate, '')
        assert.equal(style.cssText, 'grid-template-rows: auto auto auto; grid-template-columns: 1px; grid-template-areas: "." ".";')
        style.gridTemplateRows = initial('grid-template-rows')

        // Areas and no row track list
        style.gridTemplateAreas = '"a"'
        assert.equal(style.gridTemplate, '')
        assert.equal(style.cssText, 'grid-template-rows: none; grid-template-columns: 1px; grid-template-areas: "a";')

        // Areas and a repeated row track list
        style.gridTemplateRows = 'repeat(1, 1px)'
        assert.equal(style.gridTemplate, '')
        assert.equal(style.cssText, 'grid-template-rows: repeat(1, 1px); grid-template-columns: 1px; grid-template-areas: "a";')
        style.gridTemplateRows = 'repeat(auto-fill, 1px)'
        assert.equal(style.gridTemplate, '')
        assert.equal(style.cssText, 'grid-template-rows: repeat(auto-fill, 1px); grid-template-columns: 1px; grid-template-areas: "a";')

        // Areas and a repeated column track list
        style.gridTemplateRows = 'auto'
        style.gridTemplateColumns = 'repeat(1, 1px)'
        assert.equal(style.gridTemplate, '')
        assert.equal(style.cssText, 'grid-template-rows: auto; grid-template-columns: repeat(1, 1px); grid-template-areas: "a";')
        style.gridTemplateColumns = 'repeat(auto-fill, 1px)'
        assert.equal(style.gridTemplate, '')
        assert.equal(style.cssText, 'grid-template-rows: auto; grid-template-columns: repeat(auto-fill, 1px); grid-template-areas: "a";')
        style.gridTemplateColumns = initial('grid-template-columns')

        // Areas and a subgrided track list
        style.gridTemplateRows = 'subgrid []'
        assert.equal(style.gridTemplate, '')
        assert.equal(style.cssText, 'grid-template-rows: subgrid []; grid-template-columns: none; grid-template-areas: "a";')
        style.gridTemplateRows = 'auto'
        style.gridTemplateColumns = 'subgrid []'
        assert.equal(style.gridTemplate, '')
        assert.equal(style.cssText, 'grid-template-rows: auto; grid-template-columns: subgrid []; grid-template-areas: "a";')

        // Areas and a longer column track list
        style.gridTemplateColumns = '1px 1px'
        assert.equal(style.gridTemplate, '"a" / 1px 1px')
    })
})
describe('inset', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('inset')[0]

        // Initial longhand values
        style.inset = 'auto auto auto auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.inset, 'auto')

        // Omitted values
        const values = ['auto', '1px', '2px']
        style.inset = '1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '1px'))
        assert.equal(style.inset, '1px')
        style.inset = 'auto 1px'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i % 2]))
        assert.equal(style.inset, 'auto 1px')
        style.inset = 'auto 1px 2px'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i === 3 ? 1 : i]))
        assert.equal(style.inset, 'auto 1px 2px')
    })
})
describe('inset-block, inset-inline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('inset-block')[0]

        // Initial longhand values
        style.insetBlock = 'auto auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.insetBlock, 'auto')

        // Omitted values
        style.insetBlock = '1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '1px'))
        assert.equal(style.insetBlock, '1px')
        style.insetBlock = 'auto 1px'
        assert.equal(style.insetBlockStart, initial('inset-block-start'))
        assert.equal(style.insetBlockEnd, '1px')
        assert.equal(style.insetBlock, 'auto 1px')
    })
})
describe('interest-delay', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('interest-delay')[0]

        // Initial longhand values
        style.interestDelay = 'normal normal'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.interestDelay, 'normal')

        // Omitted values
        style.interestDelay = '1s'
        longhands.forEach(longhand => assert.equal(style[longhand], '1s'))
        assert.equal(style.interestDelay, '1s')
        style.interestDelay = 'normal 1s'
        assert.equal(style.interestDelayStart, initial('interest-delay-start'))
        assert.equal(style.interestDelayEnd, '1s')
        assert.equal(style.interestDelay, 'normal 1s')
    })
})
describe('line-clamp', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('line-clamp')[0]

        // Initial longhand values (not all longhands can be explicitly declared)
        style.lineClamp = 'none'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.lineClamp, 'none')
        assert.equal(style.cssText, 'line-clamp: none;')

        // Omitted values
        style.lineClamp = '1'
        assert.equal(style.maxLines, '1')
        assert.equal(style.blockEllipsis, 'auto')
        assert.equal(style.continue, 'collapse')
        assert.equal(style.lineClamp, '1')
        assert.equal(style.cssText, 'line-clamp: 1;')
        style.lineClamp = 'auto'
        assert.equal(style.maxLines, 'none')
        assert.equal(style.blockEllipsis, 'auto')
        assert.equal(style.continue, 'collapse')
        assert.equal(style.lineClamp, 'auto')
        assert.equal(style.cssText, 'line-clamp: auto;')
        style.lineClamp = '1 -webkit-legacy'
        assert.equal(style.maxLines, '1')
        assert.equal(style.blockEllipsis, 'auto')
        assert.equal(style.continue, '-webkit-legacy')
        assert.equal(style.lineClamp, '1 -webkit-legacy')
        assert.equal(style.cssText, 'line-clamp: 1 -webkit-legacy;')
        style.lineClamp = 'no-ellipsis -webkit-legacy'
        assert.equal(style.maxLines, 'none')
        assert.equal(style.blockEllipsis, 'no-ellipsis')
        assert.equal(style.continue, '-webkit-legacy')
        assert.equal(style.lineClamp, 'no-ellipsis -webkit-legacy')
        assert.equal(style.cssText, 'line-clamp: no-ellipsis -webkit-legacy;')

        // All longhands cannot be represented
        style.maxLines = '1'
        style.continue = initial('continue')
        assert.equal(style.lineClamp, '')
        assert.equal(style.cssText, 'max-lines: 1; block-ellipsis: no-ellipsis; continue: auto;')
        style.maxLines = initial('max-lines')
        style.blockEllipsis = 'auto'
        assert.equal(style.lineClamp, '')
        assert.equal(style.cssText, '-webkit-line-clamp: none;')
        style.blockEllipsis = initial('block-ellipsis')
        style.continue = 'collapse'
        assert.equal(style.lineClamp, '')
        assert.equal(style.cssText, 'max-lines: none; block-ellipsis: no-ellipsis; continue: collapse;')
        style.continue = 'discard'
        assert.equal(style.lineClamp, '')
        assert.equal(style.cssText, 'max-lines: none; block-ellipsis: no-ellipsis; continue: discard;')
    })
})
describe('list-style', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('list-style')[0]

        // Initial longhand values
        style.listStyle = 'outside none disc'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.listStyle, 'outside')

        // Omitted values
        const values = [
            ['outside'],
            ['none', { 'list-style-type': 'none' }],
            ['outside inside', { 'list-style-type': 'inside' }],
            ['outside outside', { 'list-style-type': 'outside' }],
        ]
        values.forEach(([input, declared = {}]) => {
            style.listStyle = input
            longhands.forEach(longhand => assert.equal(style[longhand], declared[longhand] ?? initial(longhand)))
            assert.equal(style.listStyle, input)
        })
    })
})
describe('margin', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('margin')[0]

        // Initial longhand values
        style.margin = '0 0 0 0'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.margin, '0px')

        // Omitted values
        const values = ['0px', '1px', '2px']
        style.margin = '1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '1px'))
        assert.equal(style.margin, '1px')
        style.margin = '0px 1px'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i % 2]))
        assert.equal(style.margin, '0px 1px')
        style.margin = '0px 1px 2px'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i === 3 ? 1 : i]))
        assert.equal(style.margin, '0px 1px 2px')
    })
})
describe('margin-block, margin-inline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('margin-block')[0]

        // Initial longhand values
        style.marginBlock = '0 0'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.marginBlock, '0px')

        // Omitted values
        style.marginBlock = '1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '1px'))
        assert.equal(style.marginBlock, '1px')
        style.marginBlock = '0px 1px'
        assert.equal(style.marginBlockStart, initial('margin-block-start'))
        assert.equal(style.marginBlockEnd, '1px')
        assert.equal(style.marginBlock, '0px 1px')
    })
})
describe('marker', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('marker')[0]

        // All equal longhand values
        style.marker = 'none'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.marker, 'none')

        // All longhands cannot be represented
        style.markerStart = 'url("#start")'
        assert.equal(style.marker, '')
        assert.equal(style.cssText, 'marker-start: url("#start"); marker-mid: none; marker-end: none;')
    })
})
describe('mask', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const subProperties = shorthands.get('mask')
        const [, resetOnly] = subProperties
        const longhands = subProperties.flat()
        const mask = 'none 0% 0% / auto auto repeat border-box border-box add match-source'

        // Initial longhand values
        style.mask = mask
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.mask, 'none')

        // Omitted values
        const values = [
            ['none'],
            ['0% 0% / cover', { 'mask-size': 'cover' }],
            ['fill-box', { 'mask-clip': 'fill-box', 'mask-origin': 'fill-box' }],
            ['border-box fill-box', { 'mask-clip': 'fill-box' }],
            ['no-clip', { 'mask-clip': 'no-clip' }],
        ]
        values.forEach(([input, declared = {}]) => {
            style.mask = input
            longhands.forEach(longhand => assert.equal(style[longhand], declared[longhand] ?? initial(longhand)))
            assert.equal(style.mask, input)
        })

        // All longhands cannot be represented
        style.maskImage = 'none, none'
        assert.equal(style.mask, '')
        assert.equal(style.cssText, 'mask-image: none, none; mask-position: 0% 0%; mask-size: auto auto; mask-repeat: repeat; mask-origin: border-box; mask-clip: no-clip; mask-composite: add; mask-mode: match-source; mask-border: none;')

        // Coordinated value list
        style.mask = `${mask}, ${mask}`
        longhands.forEach(longhand =>
            assert.equal(style[longhand], resetOnly.includes(longhand)
                ? initial(longhand)
                : `${initial(longhand)}, ${initial(longhand)}`))
        assert.equal(style.mask, 'none, none')
    })
})
describe('mask-border', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('mask-border')[0]

        // Initial longhand values
        style.maskBorder = 'none 0 / auto / 0 stretch alpha'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.maskBorder, 'none')

        // Omitted values
        const values = [
            ['none'],
            ['0 / 1', { 'mask-border-width': '1' }],
            ['0 / / 1', { 'mask-border-outset': '1' }, '0 / auto / 1'],
        ]
        values.forEach(([input, declared = {}, expected = input]) => {
            style.maskBorder = input
            longhands.forEach(longhand => assert.equal(style[longhand], declared[longhand] ?? initial(longhand)))
            assert.equal(style.maskBorder, expected)
        })
    })
})
describe('offset', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('offset')[0]

        // Initial longhand values
        style.offset = 'normal none 0 auto / auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.offset, 'normal')

        // Omitted values
        const values = [
            ['normal'],
            ['none', {}, 'normal'],
            ['none 1px', { 'offset-distance': '1px' }],
            ['none reverse', { 'offset-rotate': 'reverse' }],
            ['none / left', { 'offset-anchor': 'left center' }, 'normal / left center'],
        ]
        values.forEach(([input, declared = {}, expected = input]) => {
            style.offset = input
            longhands.forEach(longhand => assert.equal(style[longhand], declared[longhand] ?? initial(longhand)))
            assert.equal(style.offset, expected)
        })
    })
})
describe('outline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('outline')[0]

        // Initial longhand values
        style.outline = 'medium none auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.outline, 'medium')

        // Omitted values
        style.outline = 'medium'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.outline, 'medium')
        style.outline = 'solid'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'outline-style' ? 'solid' : initial(longhand)))
        assert.equal(style.outline, 'solid')
    })
})
describe('overflow', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('overflow')[0]

        // Initial longhand values
        style.overflow = 'visible visible'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.overflow, 'visible')

        // Omitted values
        style.overflow = 'visible'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.overflow, 'visible')
        style.overflow = 'visible hidden'
        assert.equal(style.overflowX, initial('overflow-x'))
        assert.equal(style.overflowY, 'hidden')
        assert.equal(style.overflow, 'visible hidden')

        // Legacy value alias
        style.overflow = 'overlay'
        longhands.forEach(longhand => assert.equal(style[longhand], 'auto'))
        assert.equal(style.overflow, 'auto')
    })
})
describe('overflow-clip-margin', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('overflow-clip-margin')[0]

        // All equal longhand values
        style.overflowClipMargin = '0px'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.overflowClipMargin, '0px')

        // Omitted values
        style.overflowClipMargin = 'content-box 0px'
        longhands.forEach(longhand => assert.equal(style[longhand], 'content-box'))
        assert.equal(style.overflowClipMargin, 'content-box')

        // All longhands cannot be represented
        style.overflowClipMarginTop = '1px'
        assert.equal(style.marker, '')
        assert.equal(style.cssText, 'overflow-clip-margin-top: 1px; overflow-clip-margin-right: content-box; overflow-clip-margin-bottom: content-box; overflow-clip-margin-left: content-box;')
    })
})
describe('overflow-clip-margin-block, overflow-clip-margin-inline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('overflow-clip-margin-block')[0]

        // All equal longhand values
        style.overflowClipMarginBlock = '0px'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.overflowClipMarginBlock, '0px')

        // Omitted values
        style.overflowClipMarginBlock = 'content-box 0px'
        longhands.forEach(longhand => assert.equal(style[longhand], 'content-box'))
        assert.equal(style.overflowClipMarginBlock, 'content-box')

        // All longhands cannot be represented
        style.overflowClipMarginBlockStart = '1px'
        assert.equal(style.marker, '')
        assert.equal(style.cssText, 'overflow-clip-margin-block-start: 1px; overflow-clip-margin-block-end: content-box;')
    })
})
describe('overscroll-behavior', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('overscroll-behavior')[0]

        // Initial longhand values
        style.overscrollBehavior = 'auto auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.overscrollBehavior, 'auto')

        // Omitted values
        style.overscrollBehavior = 'auto'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.overscrollBehavior, 'auto')
        style.overscrollBehavior = 'auto contain'
        assert.equal(style.overscrollBehaviorX, initial('overscroll-behavior-x'))
        assert.equal(style.overscrollBehaviorY, 'contain')
        assert.equal(style.overscrollBehavior, 'auto contain')
    })
})
describe('padding', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('padding')[0]

        // Initial longhand values
        style.padding = '0 0 0 0'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.padding, '0px')

        // Omitted values
        const values = ['0px', '1px', '2px']
        style.padding = '1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '1px'))
        assert.equal(style.padding, '1px')
        style.padding = '0px 1px'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i % 2]))
        assert.equal(style.padding, '0px 1px')
        style.padding = '0px 1px 2px'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i === 3 ? 1 : i]))
        assert.equal(style.padding, '0px 1px 2px')
    })
})
describe('padding-block, padding-inline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('padding-block')[0]

        // Initial longhand values
        style.paddingBlock = '0 0'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.paddingBlock, '0px')

        // Omitted values
        style.paddingBlock = '1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '1px'))
        assert.equal(style.paddingBlock, '1px')
        style.paddingBlock = '0px 1px'
        assert.equal(style.paddingBlockStart, initial('padding-block-start'))
        assert.equal(style.paddingBlockEnd, '1px')
        assert.equal(style.paddingBlock, '0px 1px')
    })
})
describe('place-content', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('place-content')[0]

        // Initial longhand values
        style.placeContent = 'normal normal'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.placeContent, 'normal')

        // Omitted values
        style.placeContent = 'normal'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.placeContent, 'normal')
        style.placeContent = 'normal space-between'
        assert.equal(style.alignContent, initial('align-content'))
        assert.equal(style.justifyContent, 'space-between')
        assert.equal(style.placeContent, 'normal space-between')
        style.placeContent = 'baseline'
        assert.equal(style.alignContent, 'baseline')
        assert.equal(style.justifyContent, 'start')
        assert.equal(style.placeContent, 'baseline')
    })
})
describe('place-items', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('place-items')[0]

        // Initial longhand values
        style.placeItems = 'normal legacy'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.placeItems, 'normal legacy')

        // Omitted values
        style.placeItems = 'normal'
        longhands.forEach(longhand => assert.equal(style[longhand], 'normal'))
        assert.equal(style.placeItems, 'normal')
        style.placeItems = 'normal stretch'
        assert.equal(style.alignItems, initial('align-items'))
        assert.equal(style.justifyItems, 'stretch')
        assert.equal(style.placeItems, 'normal stretch')
    })
})
describe('place-self', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('place-self')[0]

        // Initial longhand values
        style.placeSelf = 'auto auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.placeSelf, 'auto')

        // Omitted values
        style.placeSelf = 'auto'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.placeSelf, 'auto')
        style.placeSelf = 'auto normal'
        assert.equal(style.alignSelf, initial('align-self'))
        assert.equal(style.justifySelf, 'normal')
        assert.equal(style.placeSelf, 'auto normal')
    })
})
describe('pointer-timeline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('pointer-timeline')[0]
        const timeline = 'none block'

        // Initial longhand values
        style.pointerTimeline = timeline
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.pointerTimeline, 'none')

        // Omitted values
        style.pointerTimeline = 'none'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.pointerTimeline, 'none')
        style.pointerTimeline = 'none inline'
        assert.equal(style.pointerTimelineName, initial('pointer-timeline-name'))
        assert.equal(style.pointerTimelineAxis, 'inline')
        assert.equal(style.pointerTimeline, 'none inline')

        // All longhands cannot be represented
        style.pointerTimelineName = 'none, none'
        assert.equal(style.pointerTimeline, '')
        assert.equal(style.cssText, 'pointer-timeline-name: none, none; pointer-timeline-axis: inline;')

        // Coordinated value list
        style.pointerTimeline = `${timeline}, ${timeline}`
        longhands.forEach(longhand => assert.equal(style[longhand], `${initial(longhand)}, ${initial(longhand)}`))
        assert.equal(style.pointerTimeline, 'none, none')
    })
})
describe('position-try', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('position-try')[0]

        // Initial longhand values
        style.positionTry = 'normal none'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.positionTry, 'none')

        // Omitted values
        style.positionTry = 'none'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.positionTry, 'none')
        style.positionTry = 'most-width none'
        assert.equal(style.positionTryOrder, 'most-width')
        assert.equal(style.positionTryFallbacks, initial('position-try-fallbacks'))
        assert.equal(style.positionTry, 'most-width none')
    })
})
describe('rule', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('rule')[0]

        // All equal longhand values
        style.rule = 'medium none currentColor'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.rule, 'medium')

        // All longhands cannot be represented
        style.rowRuleWidth = '1px'
        assert.equal(style.rule, '')
        assert.equal(style.cssText, 'row-rule: 1px; column-rule: medium;')
    })
})
describe('rule-break', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('rule-break')[0]

        // All equal longhand values
        style.ruleBreak = 'spanning-item'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.ruleBreak, 'spanning-item')

        // All longhands cannot be represented
        style.rowRuleBreak = 'none'
        assert.equal(style.ruleBreak, '')
        assert.equal(style.cssText, 'row-rule-break: none; column-rule-break: spanning-item;')
    })
})
describe('rule-color', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('rule-color')[0]

        // All equal longhand values
        style.ruleColor = 'currentColor'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.ruleColor, 'currentcolor')

        // All longhands cannot be represented
        style.rowRuleColor = 'green'
        assert.equal(style.ruleColor, '')
        assert.equal(style.cssText, 'row-rule-color: green; column-rule-color: currentcolor;')
    })
})
describe('rule-outset', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('rule-outset')[0]

        // All equal longhand values
        style.ruleOutset = '50%'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.ruleOutset, '50%')

        // All longhands cannot be represented
        style.rowRuleOutset = '0%'
        assert.equal(style.ruleOutset, '')
        assert.equal(style.cssText, 'row-rule-outset: 0%; column-rule-outset: 50%;')
    })
})
describe('rule-style', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('rule-style')[0]

        // All equal longhand values
        style.ruleStyle = 'none'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.ruleStyle, 'none')

        // All longhands cannot be represented
        style.rowRuleStyle = 'solid'
        assert.equal(style.ruleStyle, '')
        assert.equal(style.cssText, 'row-rule-style: solid; column-rule-style: none;')
    })
})
describe('rule-width', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('rule-width')[0]

        // All equal longhand values
        style.ruleWidth = 'medium'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.ruleWidth, 'medium')

        // All longhands cannot be represented
        style.rowRuleWidth = '1px'
        assert.equal(style.ruleWidth, '')
        assert.equal(style.cssText, 'row-rule-width: 1px; column-rule-width: medium;')
    })
})
describe('scroll-margin', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('scroll-margin')[0]

        // Initial longhand values
        style.scrollMargin = '0 0 0 0'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.scrollMargin, '0px')

        // Omitted values
        const values = ['0px', '1px', '2px']
        style.scrollMargin = '1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '1px'))
        assert.equal(style.scrollMargin, '1px')
        style.scrollMargin = '0px 1px'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i % 2]))
        assert.equal(style.scrollMargin, '0px 1px')
        style.scrollMargin = '0px 1px 2px'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i === 3 ? 1 : i]))
        assert.equal(style.scrollMargin, '0px 1px 2px')
    })
})
describe('scroll-margin-block, scroll-margin-inline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('scroll-margin-block')[0]

        // Initial longhand values
        style.scrollMarginBlock = '0 0'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.scrollMarginBlock, '0px')

        // Omitted values
        style.scrollMarginBlock = '1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '1px'))
        assert.equal(style.scrollMarginBlock, '1px')
        style.scrollMarginBlock = '0px 1px'
        assert.equal(style.scrollMarginBlockStart, initial('scroll-margin-block-start'))
        assert.equal(style.scrollMarginBlockEnd, '1px')
        assert.equal(style.scrollMarginBlock, '0px 1px')
    })
})
describe('scroll-padding', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('scroll-padding')[0]

        // Initial longhand values
        style.scrollPadding = 'auto auto auto auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.scrollPadding, 'auto')

        // Omitted values
        const values = ['0px', '1px', '2px']
        style.scrollPadding = '1px'
        longhands.forEach(longhand => assert.equal(style[longhand], '1px'))
        assert.equal(style.scrollPadding, '1px')
        style.scrollPadding = '0px 1px'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i % 2]))
        assert.equal(style.scrollPadding, '0px 1px')
        style.scrollPadding = '0px 1px 2px'
        longhands.forEach((longhand, i) => assert.equal(style[longhand], values[i === 3 ? 1 : i]))
        assert.equal(style.scrollPadding, '0px 1px 2px')
    })
})
describe('scroll-padding-block, scroll-padding-inline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('scroll-padding-block')[0]

        // Initial longhand values
        style.scrollPaddingBlock = 'auto auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.scrollPaddingBlock, 'auto')

        // Omitted values
        style.scrollPaddingBlock = 'auto'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.scrollPaddingBlock, 'auto')
        style.scrollPaddingBlock = 'auto 1px'
        assert.equal(style.scrollPaddingBlockStart, initial('scroll-padding-block-start'))
        assert.equal(style.scrollPaddingBlockEnd, '1px')
        assert.equal(style.scrollPaddingBlock, 'auto 1px')
    })
})
describe('scroll-timeline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('scroll-timeline')[0]
        const timeline = 'none block'

        // Initial longhand values
        style.scrollTimeline = timeline
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.scrollTimeline, 'none')

        // Omitted values
        style.scrollTimeline = 'none'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.scrollTimeline, 'none')
        style.scrollTimeline = 'none inline'
        assert.equal(style.scrollTimelineName, initial('scroll-timeline-name'))
        assert.equal(style.scrollTimelineAxis, 'inline')
        assert.equal(style.scrollTimeline, 'none inline')

        // All longhands cannot be represented
        style.scrollTimelineName = 'none, none'
        assert.equal(style.scrollTimeline, '')
        assert.equal(style.cssText, 'scroll-timeline-name: none, none; scroll-timeline-axis: inline;')

        // Coordinated value list
        style.scrollTimeline = `${timeline}, ${timeline}`
        longhands.forEach(longhand => assert.equal(style[longhand], `${initial(longhand)}, ${initial(longhand)}`))
        assert.equal(style.scrollTimeline, 'none, none')
    })
})
describe('text-align', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.textAlign = '"12"'
        assert.equal(style.length, 0)
    })
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('text-align')[0]

        // Initial longhand values (not all longhands can be explicitly declared)
        style.textAlign = 'start'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.textAlign, 'start')

        // justify-all
        style.textAlign = 'justify-all'
        longhands.forEach(longhand => assert.equal(style[longhand], 'justify'))
        assert.equal(style.textAlign, 'justify-all')

        // match-parent
        style.textAlign = 'match-parent'
        longhands.forEach(longhand => assert.equal(style[longhand], 'match-parent'))
        assert.equal(style.textAlign, 'match-parent')

        // All longhands cannot be represented
        style.textAlignLast = initial('text-align-last')
        assert.equal(style.textAlign, '')
        assert.equal(style.cssText, 'text-align-all: match-parent; text-align-last: auto;')
        style.textAlignAll = 'justify'
        style.textAlignLast = 'start'
        assert.equal(style.textAlign, '')
        assert.equal(style.cssText, 'text-align-all: justify; text-align-last: start;')
        style.textAlignAll = initial('text-align-all')
        assert.equal(style.textAlign, '')
        assert.equal(style.cssText, 'text-align-all: start; text-align-last: start;')
    })
})
describe('text-box', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('text-box')[0]

        // Initial longhand values
        style.textBox = 'none auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.textBox, 'normal')

        // Omitted values
        const values = [
            ['normal'],
            ['none', {}, 'normal'],
            ['trim-both', { 'text-box-trim': 'trim-both' }],
            ['auto', { 'text-box-trim': 'trim-both' }, 'trim-both'],
            ['text', { 'text-box-edge': 'text', 'text-box-trim': 'trim-both' }],
        ]
        values.forEach(([input, declared = {}, expected = input]) => {
            style.textBox = input
            longhands.forEach(longhand => assert.equal(style[longhand], declared[longhand] ?? initial(longhand)))
            assert.equal(style.textBox, expected)
        })
    })
})
describe('text-decoration', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('text-decoration')[0]

        // Initial longhand values
        style.textDecoration = 'none auto solid currentColor'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.textDecoration, 'none')

        // Omitted values
        style.textDecoration = 'none'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.textDecoration, 'none')
        style.textDecoration = 'from-font'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'text-decoration-thickness' ? 'from-font' : initial(longhand)))
        assert.equal(style.textDecoration, 'from-font')
    })
})
describe('text-decoration-skip', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('text-decoration-skip')[0]

        // All equal longhand values
        style.textDecorationSkip = 'auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.textDecorationSkip, 'auto')

        // none
        style.textDecorationSkip = 'none'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'text-decoration-skip-self' ? 'no-skip' : 'none'))
        assert.equal(style.textDecorationSkip, 'none')

        // All longhands cannot be represented
        style.textDecorationSkipSelf = 'skip-all'
        assert.equal(style.textDecorationSkip, '')
        assert.equal(style.cssText, 'text-decoration-skip-self: skip-all; text-decoration-skip-box: none; text-decoration-skip-spaces: none; text-decoration-skip-ink: none;')
    })
})
describe('text-emphasis', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('text-emphasis')[0]

        // Initial longhand values
        style.textEmphasis = 'none currentColor'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.textEmphasis, 'none')

        // Omitted values
        style.textEmphasis = 'none'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.textEmphasis, 'none')
        style.textEmphasis = 'green'
        assert.equal(style.textEmphasisStyle, initial('text-emphasis-style'))
        assert.equal(style.textEmphasisColor, 'green')
        assert.equal(style.textEmphasis, 'green')
    })
})
describe('text-spacing', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('text-spacing')[0]

        // Initial longhand values (not all longhands can be explicitly declared)
        style.textSpacing = 'normal'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.textSpacing, 'normal')

        // Omitted values
        style.textSpacing = 'space-all'
        assert.equal(style.textSpacingTrim, 'space-all')
        assert.equal(style.textAutospace, initial('text-autospace'))
        assert.equal(style.textSpacing, 'space-all')
        style.textSpacing = 'no-autospace'
        assert.equal(style.textSpacingTrim, initial('text-spacing-trim'))
        assert.equal(style.textAutospace, 'no-autospace')
        assert.equal(style.textSpacing, 'no-autospace')
        style.textSpacing = 'ideograph-alpha ideograph-numeric'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.textSpacing, 'normal')

        // none
        style.textSpacing = 'none'
        assert.equal(style.textSpacingTrim, 'space-all')
        assert.equal(style.textAutospace, 'no-autospace')
        assert.equal(style.textSpacing, 'none')

        // auto
        style.textSpacing = 'auto'
        longhands.forEach(longhand => assert.equal(style[longhand], 'auto'))
        assert.equal(style.textSpacing, 'auto')

        // All longhands cannot be represented
        style.textAutospace = initial('text-autospace')
        assert.equal(style.textSpacing, '')
        assert.equal(style.cssText, 'text-spacing-trim: auto; text-autospace: normal;')
        style.textAutospace = 'no-autospace'
        assert.equal(style.textSpacing, '')
        assert.equal(style.cssText, 'text-spacing-trim: auto; text-autospace: no-autospace;')
        style.textSpacingTrim = 'space-all'
        style.textAutospace = 'auto'
        assert.equal(style.textSpacing, '')
        assert.equal(style.cssText, 'text-spacing-trim: space-all; text-autospace: auto;')
    })
})
describe('text-wrap', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('text-wrap')[0]

        // Initial longhand values
        style.textWrap = 'wrap auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.textWrap, 'wrap')

        // Omitted values
        style.textWrap = 'wrap'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.textWrap, 'wrap')
        style.textWrap = 'balance'
        assert.equal(style.textWrapMode, initial('text-wrap-mode'))
        assert.equal(style.textWrapStyle, 'balance')
        assert.equal(style.textWrap, 'balance')
    })
})
describe('timeline-trigger', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('timeline-trigger')[0]

        // Initial longhand values
        style.timelineTrigger = 'none auto normal normal / auto auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.timelineTrigger, 'none')

        // Omitted values
        const values = [
            ['none'],
            ['none auto normal', {}, 'none'],
            ['none auto 10%', { 'timeline-trigger-range-start': '10%' }],
            ['none auto entry', {
                'timeline-trigger-range-end': 'entry',
                'timeline-trigger-range-start': 'entry',
            }],
            ['none auto normal 10%', { 'timeline-trigger-range-end': '10%' }],
            ['none auto normal normal / 10%', { 'timeline-trigger-exit-range-start': '10%' }, 'none auto normal / 10%'],
            ['none auto normal normal / entry',
                {
                    'timeline-trigger-exit-range-end': 'entry',
                    'timeline-trigger-exit-range-start': 'entry',
                },
                'none auto normal / entry',
            ],
        ]
        values.forEach(([input, declared = {}, expected = input]) => {
            style.timelineTrigger = input
            longhands.forEach(longhand => assert.equal(style[longhand], declared[longhand] ?? initial(longhand)))
            assert.equal(style.timelineTrigger, expected)
        })

        // All longhands cannot be represented
        style.timelineTriggerName = '--trigger, --trigger'
        assert.equal(style.timelineTrigger, '')
        assert.equal(style.cssText, 'timeline-trigger-name: --trigger, --trigger; timeline-trigger-source: auto; timeline-trigger-range: normal; timeline-trigger-exit-range: entry;')

        // Coordinated value list
        style.timelineTrigger = 'none auto normal, none auto normal'
        longhands.forEach(longhand => assert.equal(style[longhand], `${initial(longhand)}, ${initial(longhand)}`))
        assert.equal(style.timelineTrigger, 'none auto normal, none auto normal')
    })
})
describe('timeline-trigger-exit-range', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('timeline-trigger-exit-range')[0]

        // Initial longhand values
        style.timelineTriggerExitRange = 'auto auto'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.timelineTriggerExitRange, 'auto')

        // Omitted values
        const values = [
            ['auto'],
            ['0%', '0%', 'auto'],
            ['auto 0%', 'auto', '0%'],
            ['entry'],
            ['entry 10%', 'entry 10%', 'entry'],
            ['entry 0% entry 100%', 'entry', 'entry', 'entry'],
            ['entry exit 100%', 'entry', 'exit', 'entry exit'],
            ['entry 0% 100%', 'entry', '100%', 'entry 0% 100%'],
            ['entry auto', 'entry', 'auto', 'entry auto'],
        ]
        values.forEach(([input, start = input, end = input, expected = input]) => {
            style.timelineTriggerExitRange = input
            assert.equal(style.timelineTriggerExitRangeStart, start)
            assert.equal(style.timelineTriggerExitRangeEnd, end)
            assert.equal(style.timelineTriggerExitRange, expected)
        })

        // All longhands cannot be represented
        style.timelineTriggerExitRangeStart = 'auto, auto'
        assert.equal(style.animationRange, '')
        assert.equal(style.cssText, 'timeline-trigger-exit-range-start: auto, auto; timeline-trigger-exit-range-end: auto;')

        // Coordinated value list
        style.timelineTriggerExitRange = 'auto, auto'
        longhands.forEach(longhand => assert.equal(style[longhand], `${initial(longhand)}, ${initial(longhand)}`))
        assert.equal(style.timelineTriggerExitRange, 'auto, auto')
    })
})
describe('timeline-trigger-range', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('timeline-trigger-range')[0]

        // Initial longhand values
        style.timelineTriggerRange = 'normal normal'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.timelineTriggerRange, 'normal')

        // Omitted values
        const values = [
            ['normal'],
            ['0%', '0%', 'normal'],
            ['normal 0%', 'normal', '0%'],
            ['entry'],
            ['entry 10%', 'entry 10%', 'entry'],
            ['entry 0% entry 100%', 'entry', 'entry', 'entry'],
            ['entry exit 100%', 'entry', 'exit', 'entry exit'],
            ['entry 0% 100%', 'entry', '100%', 'entry 0% 100%'],
            ['entry normal', 'entry', 'normal', 'entry normal'],
        ]
        values.forEach(([input, start = input, end = input, expected = input]) => {
            style.timelineTriggerRange = input
            assert.equal(style.timelineTriggerRangeStart, start)
            assert.equal(style.timelineTriggerRangeEnd, end)
            assert.equal(style.timelineTriggerRange, expected)
        })

        // All longhands cannot be represented
        style.timelineTriggerRangeStart = 'normal, normal'
        assert.equal(style.animationRange, '')
        assert.equal(style.cssText, 'timeline-trigger-range-start: normal, normal; timeline-trigger-range-end: normal;')

        // Coordinated value list
        style.timelineTriggerRange = 'normal, normal'
        longhands.forEach(longhand => assert.equal(style[longhand], `${initial(longhand)}, ${initial(longhand)}`))
        assert.equal(style.timelineTriggerRange, 'normal, normal')
    })
})
describe('transition', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('transition')[0]
        const transition = '0s ease 0s all'

        // Initial longhand values
        style.transition = transition
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.transition, '0s')

        // Omitted values
        style.transition = '0s'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.transition, '0s')
        style.transition = 'linear'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'transition-timing-function' ? 'linear' : initial(longhand)))
        assert.equal(style.transition, 'linear')

        // All longhands cannot be represented
        style.transitionProperty = 'none, none'
        assert.equal(style.transition, '')
        assert.equal(style.cssText, 'transition-duration: 0s; transition-timing-function: linear; transition-delay: 0s; transition-behavior: normal; transition-property: none, none;')

        // Coordinated value list
        style.transition = `${transition}, ${transition}`
        longhands.forEach(longhand => assert.equal(style[longhand], `${initial(longhand)}, ${initial(longhand)}`))
        assert.equal(style.transition, '0s, 0s')
    })
})
describe('vertical-align', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.verticalAlign = 'text-before-edge'
        style.verticalAlign = 'text-after-edge'
        assert.equal(style.length, 0)
    })
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('vertical-align')[0]

        // Initial longhand values (not all longhands can be explicitly declared)
        style.verticalAlign = 'baseline 0'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.verticalAlign, 'baseline')

        // Omitted values
        style.verticalAlign = 'baseline'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.verticalAlign, 'baseline')
        style.verticalAlign = 'first'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'baseline-source' ? 'first' : initial(longhand)))
        assert.equal(style.verticalAlign, 'first')
        style.verticalAlign = '1px'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'baseline-shift' ? '1px' : initial(longhand)))
        assert.equal(style.verticalAlign, '1px')
    })
})
describe('view-timeline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('view-timeline')[0]
        const timeline = 'none block auto'

        // Initial longhand values
        style.viewTimeline = timeline
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.viewTimeline, 'none')

        // Omitted values
        const values = [
            ['none'],
            ['none inline', { 'view-timeline-axis': 'inline' }],
            ['none 1px', { 'view-timeline-inset': '1px' }],
        ]
        values.forEach(([input, declared = {}]) => {
            style.viewTimeline = input
            longhands.forEach(longhand => assert.equal(style[longhand], declared[longhand] ?? initial(longhand)))
            assert.equal(style.viewTimeline, input)
        })

        // All longhands cannot be represented
        style.viewTimelineName = 'none, none'
        assert.equal(style.viewTimeline, '')
        assert.equal(style.cssText, 'view-timeline-name: none, none; view-timeline-axis: block; view-timeline-inset: 1px;')

        // Coordinated value list
        style.viewTimeline = `${timeline}, ${timeline}`
        longhands.forEach(longhand => assert.equal(style[longhand], `${initial(longhand)}, ${initial(longhand)}`))
        assert.equal(style.viewTimeline, 'none, none')
    })
})
describe('white-space', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('white-space')[0]

        // Initial longhand values
        style.whiteSpace = 'collapse wrap none'
        assert.equal(style.length, longhands.length)
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.whiteSpace, 'normal')

        // Omitted values
        style.whiteSpace = 'collapse'
        longhands.forEach(longhand => assert.equal(style[longhand], initial(longhand)))
        assert.equal(style.whiteSpace, 'normal')
        style.whiteSpace = 'nowrap'
        longhands.forEach(longhand =>
            assert.equal(style[longhand], longhand === 'text-wrap-mode' ? 'nowrap' : initial(longhand)))
        assert.equal(style.whiteSpace, 'nowrap')

        // normal, pre, pre-line, pre-wrap
        whiteSpace.mapping.forEach((mapping, keyword) => {
            style.whiteSpace = keyword
            longhands.forEach((longhand, i) => assert.equal(style[longhand], mapping[i].value))
            assert.equal(style.whiteSpace, keyword)
        })
    })
})

describe('CSSFontFaceDescriptors', () => {
    test('invalid', () => {

        const style = CSSFontFaceDescriptors.create(globalThis, undefined, { parentRule: fontFaceRule })

        // Custom property
        style.setProperty('--custom', 'red')
        // Invalid name
        style.setProperty('font-size-adjust', 'none')
        // Priority
        style.setProperty('font-weight', '1', 'important')
        style.setProperty('size-adjust', '1px', 'important')

        const invalid = [
            // Cascade or element-dependent value
            ['initial'],
            ['inherit(--custom)'],
            ['var(--custom)'],
            // Element-dependent value
            ['--custom()'],
            ['attr(name)'],
            ['random-item(--key, 1)', 'random-item(--key, 1%)'],
            ['interpolate(0, 0: 1)', 'interpolate(0, 0: 1%)'],
            ['toggle(1)', 'toggle(1%)'],
            ['calc-interpolate(0, 0: 1)', 'calc-interpolate(0, 0: 1%)'],
            ['random(1, 1)', 'random(1%, 1%)'],
            ['sibling-count()', 'calc(1% * sibling-count())'],
        ]
        invalid.forEach(([fontWeight, sizeAdjust = fontWeight]) => {
            style.fontWeight = fontWeight
            style.sizeAdjust = sizeAdjust
        })
        assert.equal(style.length, 0)
    })
    test('valid', () => {

        const style = CSSFontFaceDescriptors.create(globalThis, undefined, { parentRule: fontFaceRule })

        // Alias
        assert.equal(style.fontStretch, style.fontWidth)
        style.fontStretch = 'condensed'
        assert.equal(style.fontStretch, 'condensed')
        assert.equal(style.fontWidth, 'condensed')

        // Dependency-free substitution
        style.fontWeight = 'env(name, attr(name))'
        style.sizeAdjust = 'env(name, attr(name))'
        assert.equal(style.fontWeight, 'env(name, attr(name))')
        assert.equal(style.sizeAdjust, 'env(name, attr(name))')
        style.fontWeight = 'if(media(width): 1)'
        style.sizeAdjust = 'if(media(width): 1%)'
        assert.equal(style.fontWeight, 'if(media(width): 1)')
        assert.equal(style.sizeAdjust, 'if(media(width): 1%)')
        style.fontWeight = 'first-valid(1)'
        style.sizeAdjust = 'first-valid(1%)'
        assert.equal(style.fontWeight, '1')
        assert.equal(style.sizeAdjust, '1%')
        style.fontWeight = 'calc(progress(1, 0, 1))'
        style.sizeAdjust = 'calc(1% * progress(1, 0, 1))'
        assert.equal(style.fontWeight, 'calc(1)')
        assert.equal(style.sizeAdjust, 'calc(1%)')

        // Specific serialization rule
        style.ascentOverride = '1% 1%'
        assert.equal(style.ascentOverride, '1%')
        style.descentOverride = '1% 1%'
        assert.equal(style.descentOverride, '1%')
        style.fontSize = '1 1'
        assert.equal(style.fontSize, '1')
        style.fontWidth = 'normal normal'
        assert.equal(style.fontWidth, 'normal')
        style.fontStyle = 'oblique 0deg'
        assert.equal(style.fontStyle, 'normal')
        style.fontStyle = 'oblique 1deg 1deg'
        assert.equal(style.fontStyle, 'oblique 1deg')
        style.fontWeight = 'normal normal'
        assert.equal(style.fontWeight, 'normal')
        style.lineGapOverride = '1% 1%'
        assert.equal(style.lineGapOverride, '1%')
        style.subscriptPositionOverride = '1% 1%'
        assert.equal(style.subscriptPositionOverride, '1%')
        style.subscriptSizeOverride = '1% 1%'
        assert.equal(style.subscriptSizeOverride, '1%')
        style.superscriptPositionOverride = '1% 1%'
        assert.equal(style.superscriptPositionOverride, '1%')
        style.superscriptSizeOverride = '1% 1%'
        assert.equal(style.superscriptSizeOverride, '1%')
    })
})
describe('CSSFunctionDescriptors', () => {
    test('invalid', () => {

        const style = CSSFunctionDescriptors.create(globalThis, undefined, { parentRule: functionRule })

        // Invalid name
        style.setProperty('color', 'red')
        // Priority
        style.setProperty('result', '1', 'important')

        assert.equal(style.length, 0)
    })
})
describe('CSSKeyframeProperties', () => {
    test('invalid', () => {

        const style = CSSKeyframeProperties.create(globalThis, undefined, { parentRule: keyframeRule })

        // Invalid name
        style.setProperty('animation-delay', '1s')
        // Priority
        style.setProperty('font-weight', '1', 'important')

        assert.equal(style.length, 0)
    })
    test('valid', () => {

        const style = CSSKeyframeProperties.create(globalThis, undefined, { parentRule: keyframeRule })

        // Custom property
        style.setProperty('--custom', 'green')
        assert.equal(style.getPropertyValue('--custom'), 'green')

        // Dependency-free substitution
        style.fontWeight = 'env(name)'
        assert.equal(style.fontWeight, 'env(name)')
        style.fontWeight = 'if(media(width): 1)'
        assert.equal(style.fontWeight, 'if(media(width): 1)')
        style.fontWeight = 'first-valid(1)'
        assert.equal(style.fontWeight, '1')
        style.fontWeight = 'calc(progress(1, 0, 1))'
        assert.equal(style.fontWeight, 'calc(1)')

        // Cascade or element-dependent value
        style.fontWeight = 'initial'
        assert.equal(style.fontWeight, 'initial')
        style.fontWeight = 'inherit(--custom)'
        assert.equal(style.fontWeight, 'inherit(--custom)')
        style.fontWeight = 'var(--custom)'
        assert.equal(style.fontWeight, 'var(--custom)')

        // Element-dependent value
        style.fontWeight = '--custom()'
        assert.equal(style.fontWeight, '--custom()')
        style.fontWeight = 'attr(name)'
        assert.equal(style.fontWeight, 'attr(name)')
        style.fontWeight = 'random-item(--key, 1)'
        assert.equal(style.fontWeight, 'random-item(--key, 1)')
        style.fontWeight = 'interpolate(0, 0: 1)'
        assert.equal(style.fontWeight, 'interpolate(0, 0: 1)')
        style.fontWeight = 'toggle(1)'
        assert.equal(style.fontWeight, 'toggle(1)')
        style.fontWeight = 'calc-interpolate(0, 0: 1)'
        assert.equal(style.fontWeight, 'calc-interpolate(0, 0: 1)')
        style.fontWeight = 'random(1, 1)'
        assert.equal(style.fontWeight, 'random(1, 1)')
        style.fontWeight = 'sibling-count()'
        assert.equal(style.fontWeight, 'sibling-count()')
        style.color = 'color-interpolate(0, 0: green)'
        assert.equal(style.color, 'color-interpolate(0, 0: green)')
    })
})
describe('CSSMarginDescriptors', () => {
    test('invalid', () => {
        const style = CSSMarginDescriptors.create(globalThis, undefined, { parentRule: marginRule })
        // Invalid name
        style.setProperty('top', '1px')
        assert.equal(style.length, 0)
    })
    test('valid', () => {

        const style = CSSMarginDescriptors.create(globalThis, undefined, { parentRule: marginRule })

        // Custom property
        style.setProperty('--custom', 'green')
        assert.equal(style.getPropertyValue('--custom'), 'green')

        // Priority
        style.setProperty('font-weight', '1', 'important')
        assert.equal(style.fontWeight, '1')
        assert.equal(style.getPropertyPriority('font-weight'), 'important')

        // Dependency-free substitution
        style.fontWeight = 'env(name)'
        assert.equal(style.fontWeight, 'env(name)')
        style.fontWeight = 'if(media(width): 1)'
        assert.equal(style.fontWeight, 'if(media(width): 1)')
        style.fontWeight = 'first-valid(1)'
        assert.equal(style.fontWeight, '1')
        style.fontWeight = 'calc(progress(1, 0, 1))'
        assert.equal(style.fontWeight, 'calc(1)')

        // Cascade or element-dependent value
        style.fontWeight = 'initial'
        assert.equal(style.fontWeight, 'initial')
        style.fontWeight = 'inherit(--custom)'
        assert.equal(style.fontWeight, 'inherit(--custom)')
        style.fontWeight = 'var(--custom)'
        assert.equal(style.fontWeight, 'var(--custom)')

        // Element-dependent value
        style.fontWeight = '--custom()'
        assert.equal(style.fontWeight, '--custom()')
        style.fontWeight = 'attr(name)'
        assert.equal(style.fontWeight, 'attr(name)')
        style.fontWeight = 'random-item(--key, 1)'
        assert.equal(style.fontWeight, 'random-item(--key, 1)')
        style.fontWeight = 'interpolate(0, 0: 1)'
        assert.equal(style.fontWeight, 'interpolate(0, 0: 1)')
        style.fontWeight = 'toggle(1)'
        assert.equal(style.fontWeight, 'toggle(1)')
        style.fontWeight = 'calc-interpolate(0, 0: 1)'
        assert.equal(style.fontWeight, 'calc-interpolate(0, 0: 1)')
        style.fontWeight = 'random(1, 1)'
        assert.equal(style.fontWeight, 'random(1, 1)')
        style.fontWeight = 'sibling-count()'
        assert.equal(style.fontWeight, 'sibling-count()')
        style.color = 'color-interpolate(0, 0: red)'
        assert.equal(style.color, 'color-interpolate(0, 0: red)')
    })
})
describe('CSSPageDescriptors', () => {
    test('invalid', () => {
        const style = CSSPageDescriptors.create(globalThis, undefined, { parentRule: pageRule })
        // Invalid name
        style.setProperty('top', '1px')
        assert.equal(style.length, 0)
    })
    test('valid', () => {

        const style = CSSPageDescriptors.create(globalThis, undefined, { parentRule: pageRule })

        // Custom property
        style.setProperty('--custom', 'green')
        assert.equal(style.getPropertyValue('--custom'), 'green')

        // Priority
        style.setProperty('size', '1px', 'important')
        assert.equal(style.size, '1px')
        assert.equal(style.getPropertyPriority('size'), 'important')

        // Dependency-free substitution
        style.fontWeight = 'env(name, attr(name))'
        style.size = 'env(name, attr(name))'
        assert.equal(style.fontWeight, 'env(name, attr(name))')
        assert.equal(style.size, 'env(name, attr(name))')
        style.fontWeight = 'if(media(width): 1)'
        style.size = 'if(media(width): 1px)'
        assert.equal(style.fontWeight, 'if(media(width): 1)')
        assert.equal(style.size, 'if(media(width): 1px)')
        style.fontWeight = 'first-valid(1)'
        style.size = 'first-valid(1px)'
        assert.equal(style.fontWeight, '1')
        assert.equal(style.size, '1px')
        style.fontWeight = 'calc(progress(1, 0, 1))'
        style.size = 'calc(1px * progress(1, 0, 1))'
        assert.equal(style.fontWeight, 'calc(1)')
        assert.equal(style.size, 'calc(1px)')

        // Cascade or element-dependent value
        style.fontWeight = 'initial'
        style.size = 'initial'
        assert.equal(style.fontWeight, 'initial')
        assert.equal(style.size, 'initial')
        style.fontWeight = 'inherit(--custom)'
        style.size = 'inherit(--custom)'
        assert.equal(style.fontWeight, 'inherit(--custom)')
        assert.equal(style.size, 'inherit(--custom)')
        style.fontWeight = 'var(--custom)'
        style.size = 'var(--custom)'
        assert.equal(style.fontWeight, 'var(--custom)')
        assert.equal(style.size, 'var(--custom)')

        // Element-dependent value
        style.fontWeight = '--custom()'
        style.size = '--custom()'
        assert.equal(style.fontWeight, '--custom()')
        assert.equal(style.size, '--custom()')
        style.fontWeight = 'attr(name)'
        style.size = 'attr(name)'
        assert.equal(style.fontWeight, 'attr(name)')
        assert.equal(style.size, 'attr(name)')
        style.fontWeight = 'random-item(--key, 1)'
        style.size = 'random-item(--key, 1px)'
        assert.equal(style.fontWeight, 'random-item(--key, 1)')
        assert.equal(style.size, 'random-item(--key, 1px)')
        style.fontWeight = 'interpolate(0, 0: 1)'
        style.size = 'interpolate(0, 0: 1px)'
        assert.equal(style.fontWeight, 'interpolate(0, 0: 1)')
        assert.equal(style.size, 'interpolate(0, 0: 1px)')
        style.fontWeight = 'toggle(1)'
        style.size = 'toggle(1px)'
        assert.equal(style.fontWeight, 'toggle(1)')
        assert.equal(style.size, 'toggle(1px)')
        style.fontWeight = 'calc-interpolate(0, 0: 1)'
        style.size = 'calc-interpolate(0, 0: 1px)'
        assert.equal(style.fontWeight, 'calc-interpolate(0, 0: 1)')
        assert.equal(style.size, 'calc-interpolate(0, 0: 1px)')
        style.fontWeight = 'random(1, 1)'
        style.size = 'random(1px, 1px)'
        assert.equal(style.fontWeight, 'random(1, 1)')
        assert.equal(style.size, 'random(1px, 1px)')
        style.fontWeight = 'sibling-count()'
        style.size = 'calc(1px * sibling-count())'
        assert.equal(style.fontWeight, 'sibling-count()')
        assert.equal(style.size, 'calc(1px * sibling-count())')
        style.color = 'color-interpolate(0, 0: red)'
        assert.equal(style.color, 'color-interpolate(0, 0: red)')

        // Specific serialization rule
        style.size = '1px 1px'
        assert.equal(style.size, '1px')
    })
})
describe('CSSPositionTryDescriptors', () => {
    test('invalid', () => {

        const style = CSSPositionTryDescriptors.create(globalThis, undefined, { parentRule: positionTryRule })

        // Custom property
        style.setProperty('--custom', 'red')
        // Invalid name
        style.setProperty('font-weight', '1')
        // Priority
        style.setProperty('top', '1px', 'important')

        assert.equal(style.length, 0)
    })
    test('valid', () => {

        const style = CSSPositionTryDescriptors.create(globalThis, undefined, { parentRule: positionTryRule })

        // Dependency-free substitution
        style.top = 'env(name)'
        assert.equal(style.top, 'env(name)')
        style.top = 'if(media(width): 1px)'
        assert.equal(style.top, 'if(media(width): 1px)')
        style.top = 'first-valid(1px)'
        assert.equal(style.top, '1px')
        style.top = 'calc(1px * progress(1, 0, 1))'
        assert.equal(style.top, 'calc(1px)')

        // Cascade or element-dependent value
        style.top = 'initial'
        assert.equal(style.top, 'initial')
        style.top = 'inherit(--custom)'
        assert.equal(style.top, 'inherit(--custom)')
        style.top = 'var(--custom)'
        assert.equal(style.top, 'var(--custom)')

        // Element-dependent value
        style.top = '--custom()'
        assert.equal(style.top, '--custom()')
        style.top = 'attr(name)'
        assert.equal(style.top, 'attr(name)')
        style.top = 'random-item(--key, 1px)'
        assert.equal(style.top, 'random-item(--key, 1px)')
        style.top = 'interpolate(0, 0: 1px)'
        assert.equal(style.top, 'interpolate(0, 0: 1px)')
        style.top = 'toggle(1px)'
        assert.equal(style.top, 'toggle(1px)')
        style.top = 'calc-interpolate(0, 0: 1px)'
        assert.equal(style.top, 'calc-interpolate(0, 0: 1px)')
        style.top = 'random(1px, 1px)'
        assert.equal(style.top, 'random(1px, 1px)')
        style.top = 'calc(1px * sibling-count())'
        assert.equal(style.top, 'calc(1px * sibling-count())')
    })
})
