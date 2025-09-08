
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
import { UPDATE_COMPUTED_STYLE_DECLARATION_ERROR } from '../lib/error.js'
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
            expect(Object.hasOwn(prototype, dashed)).toBeTruthy()
            expect(Object.hasOwn(prototype, camel)).toBeTruthy()
            if (prefixed) {
                const webkit = toIDLAttribute(dashed)
                expect(Object.hasOwn(prototype, webkit)).toBeTruthy()
            }
        })
    })
    it('initializes with declarations of a CSSRule', () => {

        const value = properties.color.initial
        const declarations = [{ name: 'color', value: value.parsed }]
        const parentRule = {}
        const style = createStyleBlock({ declarations, parentRule })

        expect(style.color).toBe(value.serialized)
        expect(style.parentRule).toBe(parentRule)
    })
    it('initializes with declarations resulting from parsing `Element.style`', () => {
        const element = {
            getAttribute() {
                return 'color: green !important; color: orange;'
            },
        }
        const style = createStyleBlock({ ownerNode: element })
        expect(style.color).toBe('green')
    })
    it('has array-like properties and methods', () => {

        const style = createStyleBlock()

        style.color = 'green'

        expect(style).toHaveLength(1)
        expect(style[0]).toBe('color')
        expect(style.item(0)).toBe('color')
    })
    it('reflects a dashed property with its camel-cased and webkit cased variants', () => {

        const style = createStyleBlock()

        style['-webkit-line-clamp'] = '1'

        expect(style['-webkit-line-clamp']).toBe('1')
        expect(style.webkitLineClamp).toBe('1')
        expect(style.WebkitLineClamp).toBe('1')

        style.webkitLineClamp = '2'

        expect(style['-webkit-line-clamp']).toBe('2')
        expect(style.webkitLineClamp).toBe('2')
        expect(style.WebkitLineClamp).toBe('2')

        style.WebkitLineClamp = '3'

        expect(style['-webkit-line-clamp']).toBe('3')
        expect(style.webkitLineClamp).toBe('3')
        expect(style.WebkitLineClamp).toBe('3')
    })
    it('reflects a longhand property with its alias', () => {

        const style = createStyleBlock()

        style.order = '1'

        expect(style.order).toBe('1')
        expect(style['-webkit-order']).toBe('1')

        style['-webkit-order'] = '2'

        expect(style.order).toBe('2')
        expect(style['-webkit-order']).toBe('2')
    })
    it('reflects a shorthand property with its alias', () => {

        const style = createStyleBlock()

        style.gap = '1px'

        expect(style.gap).toBe('1px')
        expect(style['grid-gap']).toBe('1px')

        style['grid-gap'] = '2px'

        expect(style.gap).toBe('2px')
        expect(style['grid-gap']).toBe('2px')
    })
    it('sets a declaration for a longhand property mapping to another property', () => {
        const style = createStyleBlock()
        style['-webkit-box-align'] = 'start'
        expect(style['-webkit-box-align']).toBe('start')
        expect(style['align-items']).toBe('')
    })
})
describe('CSSStyleDeclaration.cssText', () => {
    it('does not store a declaration with an invalid name', () => {
        const style = createStyleBlock()
        style.cssText = 'webkitLineClamp: 1; WebkitLineClamp: 1'
        expect(style.cssText).toBe('')
    })
    it('stores a declaration for the target of a property alias', () => {
        const style = createStyleBlock()
        style.cssText = '-webkit-order: 1; grid-gap: 1px'
        expect(style.cssText).toBe('order: 1; gap: 1px;')
    })
    it('stores a declaration for a property mapping to another property', () => {
        const style = createStyleBlock()
        style.cssText = '-webkit-box-align: start'
        expect(style.cssText).toBe('-webkit-box-align: start;')
    })
    it('stores a custom property declaration with an escaped code point', () => {
        const style = createStyleBlock()
        style.cssText = '--custom\\ property: 1'
        expect(style.cssText).toBe('--custom\\ property: 1;')
    })
    it('stores a custom property declaration with an empty string value', () => {
        const style = createStyleBlock()
        style.cssText = '--custom:;'
        expect(style.cssText).toBe('--custom: ;')
        expect(style.getPropertyValue('--custom')).toBe(' ')
    })
    it('stores declarations in specified order', () => {
        const style = createStyleBlock()
        style.cssText = 'color: orange; width: 1px; color: green'
        expect(style.cssText).toBe('width: 1px; color: green;')
        style.cssText = 'color: green !important; width: 1px; color: orange'
        expect(style.cssText).toBe('color: green !important; width: 1px;')
    })
    it('ignores rules', () => {
        const style = createStyleBlock()
        style.cssText = 'color: green; @page { color: red }; .selector { color: red }; font-size: 12px'
        expect(style.cssText).toBe('color: green; font-size: 12px;')
    })
    it('ignores an orphan }', () => {
        const style = createStyleBlock()
        style.cssText = 'color: green; } font-size: 12px'
        expect(style.cssText).toBe('color: green; font-size: 12px;')
    })
})
describe('CSSStyleDeclaration.setProperty(), CSSStyleDeclaration.getPropertyValue(), CSSStyleDeclaration.removeProperty()', () => {
    it('does not store a declaration with an invalid name', () => {

        const style = createStyleBlock()

        style.setProperty(' -webkit-line-clamp', '1')
        style.setProperty('-webkit-line-clamp ', '1')
        style.setProperty('webkitLineClamp', '1')
        style.setProperty('WebkitLineClamp', '1')

        expect(style.getPropertyValue('-webkit-line-clamp')).toBe('')
    })
    it('does not store a declaration with a value including a priority', () => {
        const style = createStyleBlock()
        style.setProperty('font-size', '1px !important')
        expect(style.getPropertyValue('font-size')).toBe('')
    })
    it('does not store a declaration with an invalid priority', () => {
        const style = createStyleBlock()
        style.setProperty('font-size', '1px', ' ')
        style.setProperty('font-size', '1px', '!important')
        expect(style.getPropertyValue('font-size')).toBe('')
    })
    it('sets and removes a declaration for a standard property normalized to lowercase', () => {

        const style = createStyleBlock()

        style.setProperty('-WEBKIT-LINE-CLAMP', '1')

        expect(style.getPropertyValue('-WEBKIT-LINE-CLAMP')).toBe('1')
        expect(style.getPropertyValue('webkitLineClamp')).toBe('')
        expect(style.getPropertyValue('WebkitLineClamp')).toBe('')

        style.removeProperty('-WEBKIT-LINE-CLAMP')

        expect(style.getPropertyValue('-webkit-line-clamp')).toBe('')
    })
    it('sets and removes a declaration for the target of a longhand property alias', () => {

        const style = createStyleBlock()

        style.setProperty('-webkit-order', '1')

        expect(style.getPropertyValue('order')).toBe('1')
        expect(style.getPropertyValue('-webkit-order')).toBe('1')

        style.removeProperty('-webkit-order')

        expect(style.getPropertyValue('order')).toBe('')
        expect(style.getPropertyValue('-webkit-order')).toBe('')
    })
    it('sets and removes a declaration for the target of a shorthand property alias', () => {

        const style = createStyleBlock()

        style.setProperty('grid-gap', '1px')

        expect(style.getPropertyValue('gap')).toBe('1px')
        expect(style.getPropertyValue('grid-gap')).toBe('1px')

        style.removeProperty('grid-gap')

        expect(style.getPropertyValue('gap')).toBe('')
        expect(style.getPropertyValue('grid-gap')).toBe('')
    })
    it('sets a declaration for a longhand property mapping to another property', () => {

        const style = createStyleBlock()

        style.setProperty('-webkit-box-align', 'start')

        expect(style.getPropertyValue('-webkit-box-align')).toBe('start')
        expect(style.getPropertyValue('align-items')).toBe('')
    })
    it('sets and removes a declaration for a custom property with an escaped name', () => {

        const style = createStyleBlock()

        style.setProperty('--custom PROP', '1')

        expect(style.getPropertyValue('--custom PROP')).toBe('1')
        expect(style.getPropertyValue('--custom\ PROP')).toBe('1')

        style.removeProperty('--custom PROP')

        expect(style.getPropertyValue('--custom PROP')).toBe('')
    })
    it('sets and removes a declaration for a custom property containing an escaped code point', () => {

        const style = createStyleBlock()

        style.setProperty('--custom\ PROP', '1')

        expect(style.getPropertyValue('--custom PROP')).toBe('1')
        expect(style.getPropertyValue('--custom\ PROP')).toBe('1')

        style.removeProperty('--custom\ PROP')

        expect(style.getPropertyValue('--custom\ PROP')).toBe('')
    })
    it('sets a declaration with a priority', () => {

        const style = createStyleBlock()

        // Standard property
        style.setProperty('font-size', '10px', 'important')
        expect(style.getPropertyPriority('font-size')).toBe('important')
        style.setProperty('font-size', '10px')
        expect(style.getPropertyPriority('font-size')).toBe('')

        // Longhand property alias
        style.setProperty('order', '1', 'important')
        expect(style.getPropertyPriority('-webkit-order')).toBe('important')

        // Shorthand property alias
        style.setProperty('gap', '1px', 'important')
        expect(style.getPropertyPriority('grid-gap')).toBe('important')

        // Custom property
        style.setProperty('--custom', '1', 'important')
        expect(style.getPropertyPriority('--custom')).toBe('important')
    })
    it('removes a declaration for the specified name when the specified value is an empty string', () => {

        const style = createStyleBlock()

        style.cssText = 'color: green; --custom: 1;'
        style.setProperty('color', '')
        style.setProperty('--custom', '')

        expect(style.getPropertyValue('color')).toBe('')
        expect(style.getPropertyValue('--custom')).toBe('')
        expect(style).toHaveLength(0)
    })
    it('updates a declaration not preceded by a declaration for a property of the same logical property group', () => {

        const style = createStyleBlock()

        style.borderTopColor = 'orange'
        style.width = '1px'

        style.borderTopColor = 'orange'
        expect(style.cssText).toBe('border-top-color: orange; width: 1px;')

        style.borderTopColor = 'green'
        expect(style.cssText).toBe('border-top-color: green; width: 1px;')

        style.setProperty('border-top-color', 'green', 'important')
        expect(style.cssText).toBe('border-top-color: green !important; width: 1px;')
    })
    it('removes then append a declaration followed by a declaration for a property of the same logical property group and with a different mapping', () => {

        const style = createStyleBlock()

        style.borderTopColor = 'green'
        style.borderBlockStartColor = 'orange'

        style.borderTopColor = 'green'
        expect(style.cssText).toBe('border-block-start-color: orange; border-top-color: green;')

        style.borderBlockStartColor = 'green'
        expect(style.cssText).toBe('border-top-color: green; border-block-start-color: green;')
    })
})

describe('CSS-wide keywords', () => {
    test('valid', () => {
        const style = createStyleBlock()
        substitutions.keywords.forEach(keyword => {
            style.opacity = keyword.toUpperCase()
            expect(style.opacity).toBe(keyword)
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
        invalid.forEach(input => {
            style.color = input
            expect(style.color).toBe('')
        })
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
            style.opacity = input
            expect(style.opacity).toBe(expected)
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
        invalid.forEach(([substitution, property]) => {
            style.setProperty(property, substitution)
            expect(style.getPropertyValue(property)).toBe('')
        })
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
            style.setProperty(property, input)
            expect(style.getPropertyValue(property)).toBe(expected)
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
        invalid.forEach(input => {
            style.setProperty('--custom', input)
            expect(style.getPropertyValue('--custom')).toBe('')
        })
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
            expect(style.getPropertyValue('--custom')).toBe(expected.replace(' !important', ''))
            expect(style.cssText).toBe(`--custom: ${expected.trim()};`)
        })
    })
})
describe('alignment-baseline', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.alignmentBaseline = 'text-before-edge'
        expect(style.alignmentBaseline).toBe('text-top')
        style.alignmentBaseline = 'text-after-edge'
        expect(style.alignmentBaseline).toBe('text-bottom')
    })
})
describe('animation-range-center', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.animationRangeCenter = 'source 50%'
        expect(style.animationRangeCenter).toBe('source')
    })
})
describe('animation-range-start, animation-range-end, animation-trigger-exit-range-end, animation-trigger-exit-range-start, animation-trigger-range-end, animation-trigger-range-start', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.animationRangeStart = 'entry 0%'
        expect(style.animationRangeStart).toBe('entry')
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
            style.backgroundPosition = input
            expect(style.backgroundPosition).toBe(expected)
            expect(style.cssText).toBe(`background-position: ${expected};`)
        })
    })
})
describe('background-size', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.backgroundSize = '100% auto'
        expect(style.backgroundSize).toBe('100%')
    })
})
describe('border-end-end-radius, border-end-start-radius, border-bottom-left-radius, border-bottom-right-radius, border-start-end-radius, border-start-start-radius, border-top-left-radius, border-top-right-radius', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.borderBottomLeftRadius = '1px 1px'
        expect(style.borderBottomLeftRadius).toBe('1px')
        style.borderBottomLeftRadius = '1px 2px'
        expect(style.borderBottomLeftRadius).toBe('1px 2px')
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
            style.borderImageOutset = input
            expect(style.borderImageOutset).toBe(expected)
        })
    })
})
describe('border-image-repeat, mask-border-repeat', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.borderImageRepeat = 'stretch stretch'
        expect(style.borderImageRepeat).toBe('stretch')
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
            style.borderImageSlice = input
            expect(style.borderImageSlice).toBe(expected)
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
            style.borderImageWidth = input
            expect(style.borderImageWidth).toBe(expected)
        })
    })
})
describe('border-spacing', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.borderSpacing = '1px 1px'
        expect(style.borderSpacing).toBe('1px')
    })
})
describe('break-after, break-before, page-break-after, page-break-before', () => {
    test('invalid', () => {

        const style = createStyleBlock()

        // Unmapped target value
        style.pageBreakAfter = 'recto'
        expect(style.breakAfter).toBe('')
        expect(style.pageBreakAfter).toBe('')
        expect(style.cssText).toBe('')
    })
    test('valid', () => {

        const style = createStyleBlock()

        // Unmapped value
        style.breakAfter = 'recto'
        expect(style.breakAfter).toBe('recto')
        expect(style.pageBreakAfter).toBe('')
        expect(style.cssText).toBe('break-after: recto;')

        // Legacy mapped value
        style.breakAfter = 'page'
        expect(style.breakAfter).toBe('page')
        expect(style.pageBreakAfter).toBe('always')
        expect(style.cssText).toBe('break-after: page;')
        style.cssText = ''
        style.pageBreakAfter = 'always'
        expect(style.breakAfter).toBe('page')
        expect(style.pageBreakAfter).toBe('always')
        expect(style.cssText).toBe('break-after: page;')

        // Substitution-value
        style.breakAfter = 'var(--custom)'
        expect(style.breakAfter).toBe('var(--custom)')
        expect(style.pageBreakAfter).toBe('var(--custom)')
        expect(style.cssText).toBe('break-after: var(--custom);')
        style.cssText = ''
        style.pageBreakAfter = 'var(--custom)'
        expect(style.breakAfter).toBe('var(--custom)')
        expect(style.pageBreakAfter).toBe('var(--custom)')
        expect(style.cssText).toBe('break-after: var(--custom);')
    })
})
describe('break-inside, page-break-inside', () => {
    test('invalid', () => {

        const style = createStyleBlock()

        // Unmapped target value
        style.pageBreakInside = 'avoid-page'
        expect(style.breakInside).toBe('')
        expect(style.pageBreakInside).toBe('')
        expect(style.cssText).toBe('')
    })
    test('valid', () => {

        const style = createStyleBlock()

        // Unmapped value
        style.breakInside = 'avoid-page'
        expect(style.breakInside).toBe('avoid-page')
        expect(style.pageBreakInside).toBe('')
        expect(style.cssText).toBe('break-inside: avoid-page;')

        // Substitution-value
        style.breakInside = 'var(--custom)'
        expect(style.breakInside).toBe('var(--custom)')
        expect(style.pageBreakInside).toBe('var(--custom)')
        expect(style.cssText).toBe('break-inside: var(--custom);')
        style.cssText = ''
        style.pageBreakInside = 'var(--custom)'
        expect(style.breakInside).toBe('var(--custom)')
        expect(style.pageBreakInside).toBe('var(--custom)')
        expect(style.cssText).toBe('break-inside: var(--custom);')
    })
})
describe('clip-path', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.clipPath = 'inset(1px) border-box'
        expect(style.clipPath).toBe('inset(1px)')
    })
})
describe('color-scheme', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.colorScheme = 'NORMAL only'
        expect(style.colorScheme).toBe('')
        style.colorScheme = 'only only'
        expect(style.colorScheme).toBe('')
    })
})
describe('counter-increment, counter-set', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.counterIncrement = 'counter 1'
        expect(style.counterIncrement).toBe('counter')
    })
})
describe('counter-reset', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.counterReset = 'counter 0'
        expect(style.counterReset).toBe('counter')
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
        invalid.forEach(input => {
            style.containerName = input
            expect(style.containerName).toBe('')
        })
    })
    test('valid', () => {
        const style = createStyleBlock()
        style.containerName = 'none'
        expect(style.containerName).toBe('none')
    })
})
describe('cue-after, cue-before', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.cueAfter = 'url("icon.wav") 0db'
        expect(style.cueAfter).toBe('url("icon.wav")')
        // tmp
        style.cueAfter = 'url("icon.wav") 1db'
        expect(style.cueAfter).toBe('url("icon.wav") 1db')
    })
})
describe('display', () => {
    test('valid', () => {
        const style = createStyleBlock()
        // Alias value
        display.aliases.forEach((to, from) => {
            style.display = from
            expect(style.display).toBe(to)
        })
        // Legacy mapped value
        for (const mapped of compatibility.values.keywords['display'].mappings.keys()) {
            style.display = mapped
            expect(style.display).toBe(mapped)
        }
    })
})
describe('float', () => {
    test('mirroring with cssFloat', () => {
        const style = createStyleBlock()
        style.cssFloat = 'left'
        expect(style.float).toBe('left')
        expect(style.cssText).toBe('float: left;')
        style.setProperty('float', 'right')
        expect(style.cssFloat).toBe('right')
    })
})
describe('flow-into', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.flowInto = 'AUTO'
        expect(style.flowInto).toBe('')
        style.flowInto = 'none element'
        expect(style.flowInto).toBe('')
    })
})
describe('font-size-adjust', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.fontSizeAdjust = 'ex-height 1'
        expect(style.fontSizeAdjust).toBe('1')
    })
})
describe('font-style', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.fontStyle = 'oblique 0deg'
        expect(style.fontStyle).toBe('normal')
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

        invalid.forEach(value => {
            style.glyphOrientationVertical = value
            expect(style.textOrientation).toBe('')
            expect(style.glyphOrientationVertical).toBe('')
        })
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
            expect(style.textOrientation).toBe(value)
            expect(style.glyphOrientationVertical).toBe(mapped)
            expect(style.cssText).toBe(`text-orientation: ${value};`)
            style.cssText = ''
            style.glyphOrientationVertical = legacy
            expect(style.textOrientation).toBe(value)
            expect(style.glyphOrientationVertical).toBe(mapped)
            expect(style.cssText).toBe(`text-orientation: ${value};`)
        })

        // Substitution-value
        style.textOrientation = 'var(--custom)'
        expect(style.textOrientation).toBe('var(--custom)')
        expect(style.glyphOrientationVertical).toBe('var(--custom)')
        expect(style.cssText).toBe('text-orientation: var(--custom);')
        style.glyphOrientationVertical = 'var(--custom)'
        expect(style.textOrientation).toBe('var(--custom)')
        expect(style.glyphOrientationVertical).toBe('var(--custom)')
        expect(style.cssText).toBe('text-orientation: var(--custom);')
    })
})
describe('grid-auto-flow', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.gridAutoFlow = 'row dense'
        expect(style.gridAutoFlow).toBe('dense')
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
        invalid.forEach(input => {
            style.gridTemplateAreas = input
            expect(style.gridTemplateAreas).toBe('')
        })
    })
    test('valid', () => {
        const style = createStyleBlock()
        style.gridTemplateAreas = '"  a  .b.  c  " "a . . . c'
        expect(style.gridTemplateAreas).toBe('"a . b . c" "a . . . c"')
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
            style.gridTemplateRows = input
            expect(style.gridTemplateRows).toBe(expected)
        })
    })
})
describe('hyphenate-limit-chars', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.hyphenateLimitChars = '0 1 1'
        expect(style.hyphenateLimitChars).toBe('0 1')
        style.hyphenateLimitChars = '0 auto auto'
        expect(style.hyphenateLimitChars).toBe('0')
    })
})
describe('image-rendering', () => {
    test('valid', () => {
        const style = createStyleBlock()
        // Legacy mapped value
        style.imageRendering = 'optimizeSpeed'
        expect(style.imageRendering).toBe('optimizespeed')
        style.imageRendering = 'optimizeQuality'
        expect(style.imageRendering).toBe('optimizequality')
    })
})
describe('image-resolution', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.imageResolution = 'from-image 1dppx'
        expect(style.imageResolution).toBe('from-image')
    })
})
describe('initial-letter', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.initialLetter = '1 drop'
        expect(style.initialLetter).toBe('1')
    })
})
describe('object-fit', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.objectFit = 'contain scale-down'
        expect(style.objectFit).toBe('scale-down')
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
            style.offsetPath = input
            expect(style.offsetPath).toBe(expected)
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
            style.offsetRotate = input
            expect(style.offsetRotate).toBe(expected)
        })
    })
})
describe('overflow-clip-margin-block-end, overflow-clip-margin-block-start, overflow-clip-margin-bottom, overflow-clip-margin-inline-end, overflow-clip-margin-inline-starty, overflow-clip-margin-left, overflow-clip-margin-right, overflow-clip-margin-top', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.overflowClipMarginBlockEnd = 'content-box 0px'
        expect(style.overflowClipMarginBlockEnd).toBe('content-box')
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
        ]
        valid.forEach(([input, expected]) => {
            style.paintOrder = input
            expect(style.paintOrder).toBe(expected)
        })
    })
})
describe('scale', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.scale = '100% 100% 1'
        expect(style.scale).toBe('100%')
    })
})
describe('scroll-snap-align', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.scrollSnapAlign = 'none none'
        expect(style.scrollSnapAlign).toBe('none')
    })
})
describe('scroll-snap-type', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.scrollSnapType = 'x proximity'
        expect(style.scrollSnapType).toBe('x')
    })
})
describe('shape-outside', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.shapeOutside = 'inset(1px) margin-box'
        expect(style.shapeOutside).toBe('inset(1px)')
    })
})
describe('@font-face/src', () => {
    test('invalid', () => {
        const style = CSSFontFaceDescriptors.create(globalThis, undefined, { parentRule: fontFaceRule })
        const invalid = [
            '{]}, local("serif")',
            'local("serif"), {]}',
        ]
        invalid.forEach(input => {
            style.src = input
            expect(style.src).toBe('')
        })
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
            style.src = input
            expect(style.src).toBe('local("serif")')
        })
    })
})
describe('text-emphasis-position', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.textEmphasisPosition = 'over right'
        expect(style.textEmphasisPosition).toBe('over')
    })
})
describe('text-align-all', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.textAlignAll = '"12"'
        expect(style.textAlignAll).toBe('')
    })
})
describe('text-decoration-trim', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.textDecorationTrim = '1px 1px'
        expect(style.textDecorationTrim).toBe('1px')
    })
})
describe('text-justify', () => {
    test('valid', () => {
        const style = createStyleBlock()
        // Legacy value alias
        style.textJustify = 'distribute'
        expect(style.textJustify).toBe('inter-character')
    })
})
describe('translate', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.translate = '0px 0px 0px'
        expect(style.translate).toBe('0px')
    })
})
describe('view-transition-name', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.viewTransitionName = 'AUTO'
        expect(style.viewTransitionName).toBe('')
        style.viewTransitionName = 'match-element'
        expect(style.viewTransitionName).toBe('')
    })
})
describe('voice-pitch, voice-range', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.voicePitch = 'x-low 100%'
        expect(style.voicePitch).toBe('x-low')
    })
})
describe('voice-rate', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.voiceRate = 'normal 100%'
        expect(style.voiceRate).toBe('normal')
        style.voiceRate = '100%'
        expect(style.voiceRate).toBe('100%')
    })
})

describe('-webkit-line-clamp', () => {

    const longhands = shorthands.get('-webkit-line-clamp')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values (not all longhands can be explicitly declared)
        style.webkitLineClamp = 'none'
        expect(style).toHaveLength(longhands.length)
        expect(style.maxLines).toBe('none')
        expect(style.blockEllipsis).toBe('auto')
        expect(style.continue).toBe('auto')
        expect(style.webkitLineClamp).toBe('none')
        expect(style.cssText).toBe('-webkit-line-clamp: none;')

        // Missing longhand values
        style.webkitLineClamp = '1'
        expect(style.maxLines).toBe('1')
        expect(style.blockEllipsis).toBe('auto')
        expect(style.continue).toBe('-webkit-legacy')
        expect(style.webkitLineClamp).toBe('1')
        expect(style.cssText).toBe('line-clamp: 1 -webkit-legacy;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.webkitLineClamp).toBe('')
        expect(style.cssText).toBe('line-clamp: none;')

        // All longhands cannot be represented
        style.blockEllipsis = 'auto'
        style.continue = '-webkit-legacy'
        expect(style.webkitLineClamp).toBe('')
        expect(style.cssText).toBe('line-clamp: auto -webkit-legacy;')
        style.maxLines = '1'
        style.continue = 'auto'
        expect(style.webkitLineClamp).toBe('')
        expect(style.cssText).toBe('max-lines: 1; block-ellipsis: auto; continue: auto;')
        style.blockEllipsis = initial('block-ellipsis')
        style.continue = '-webkit-legacy'
        expect(style.webkitLineClamp).toBe('')
        expect(style.cssText).toBe('line-clamp: 1 no-ellipsis -webkit-legacy;')
    })
})
describe('-webkit-text-stroke', () => {

    const longhands = shorthands.get('-webkit-text-stroke')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.webkitTextStroke = '0px currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.webkitTextStroke).toBe('0px')
        expect(style.cssText).toBe('-webkit-text-stroke: 0px;')

        // Missing longhand values
        style.webkitTextStroke = '0px'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.webkitTextStroke).toBe('0px')
        expect(style.cssText).toBe('-webkit-text-stroke: 0px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.webkitTextStroke).toBe('0px')
        expect(style.cssText).toBe('-webkit-text-stroke: 0px;')
    })
})
describe('all', () => {

    const longhands = shorthands.get('all')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        style.all = 'initial'

        expect(style).toHaveLength(longhands.length)
        expect(style[longhands[0]]).toBe('initial')
        expect(style.all).toBe('initial')
        expect(style.cssText).toBe('all: initial;')
        expect(style.direction).toBe('')
        expect(style.unicodeBidi).toBe('')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // All equal longhand values
        longhands.forEach(longhand => style[longhand] = 'initial')
        expect(style.all).toBe('initial')
        expect(style.cssText).toBe('all: initial;')

        // Not all equal longhand values
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
        expect(style.all).toBe('')
        expect(style.cssText).toBe(`${[...initial].map(name => `${name}: initial`).join('; ')}; ${head}: inherit;`)
    })
})
describe('animation', () => {

    const subProperties = shorthands.get('animation')
    const [, resetOnly] = subProperties
    const longhands = subProperties.flat()
    const animation = 'auto ease 0s 1 normal none running none auto'

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.animation = animation
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.animation).toBe(animation)
        expect(style.cssText).toBe(`animation: ${animation};`)

        // Missing longhand values
        style.animation = 'auto'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.animation).toBe(animation)
        expect(style.cssText).toBe(`animation: ${animation};`)

        // Coordinated value list
        const repeated = `${animation}, ${animation}`
        style.animation = repeated
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(resetOnly.includes(longhand)
                ? initial(longhand)
                : `${initial(longhand)}, ${initial(longhand)}`))
        expect(style.animation).toBe(repeated)
        expect(style.cssText).toBe(`animation: ${repeated};`)
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.animation).toBe(animation)
        expect(style.cssText).toBe(`animation: ${animation};`)

        // Different lengths of longhand values
        style.animationName = 'none, none'
        expect(style.animation).toBe('')
        expect(style.cssText).toBe('animation-duration: auto; animation-timing-function: ease; animation-delay: 0s; animation-iteration-count: 1; animation-direction: normal; animation-fill-mode: none; animation-play-state: running; animation-name: none, none; animation-timeline: auto; animation-composition: replace; animation-range: normal; animation-trigger: once;')
    })
})
describe('animation-range', () => {

    const longhands = shorthands.get('animation-range')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.animationRange = 'normal normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.animationRange).toBe('normal')
        expect(style.cssText).toBe('animation-range: normal;')

        // Missing longhand values
        const values = [
            ['normal'],
            ['0%', '0%', 'normal'],
            ['entry'],
            ['entry 10%', 'entry 10%', 'entry'],
            ['10% entry', '10%', 'entry'],
        ]
        values.forEach(([shorthand, start = shorthand, end = shorthand]) => {
            style.animationRange = shorthand
            expect(style.animationRangeStart).toBe(start)
            expect(style.animationRangeEnd).toBe(end)
            expect(style.animationRange).toBe(shorthand)
            expect(style.cssText).toBe(`animation-range: ${shorthand};`)
        })

        // Coordinated value list
        style.animationRange = 'normal, normal'
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.animationRange).toBe('normal, normal')
        expect(style.cssText).toBe('animation-range: normal, normal;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.animationRange).toBe('normal')
        expect(style.cssText).toBe('animation-range: normal;')

        // Different lengths of longhand values
        style.animationRangeStart = 'normal, normal'
        expect(style.animationRange).toBe('')
        expect(style.cssText).toBe('animation-range-start: normal, normal; animation-range-end: normal;')

        // Same <timeline-range-name>
        style.animationRangeStart = 'entry'
        style.animationRangeEnd = 'entry'
        expect(style.animationRange).toBe('entry')
        expect(style.cssText).toBe('animation-range: entry;')

        // Different <timeline-range-name>
        style.animationRangeEnd = 'normal'
        expect(style.animationRange).toBe('entry normal')
        expect(style.cssText).toBe('animation-range: entry normal;')

        // Ambiguous <length-percentage>
        style.animationRangeEnd = '100%'
        expect(style.animationRange).toBe('entry 0% 100%')
        expect(style.cssText).toBe('animation-range: entry 0% 100%;')
    })
})
describe('animation-trigger', () => {

    const longhands = shorthands.get('animation-trigger')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values (not all longhands can be explicitly declared)
        style.animationTrigger = 'once auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.animationTrigger).toBe('once')
        expect(style.cssText).toBe('animation-trigger: once;')
        style.animationTrigger = 'once --timeline normal normal'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'animation-trigger-timeline' ? '--timeline' : initial(longhand)))
        expect(style.animationTrigger).toBe('--timeline')
        expect(style.cssText).toBe('animation-trigger: --timeline;')

        // Missing longhand values
        style.animationTrigger = 'once'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.animationTrigger).toBe('once')
        expect(style.cssText).toBe('animation-trigger: once;')
        style.animationTrigger = 'none'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'animation-trigger-timeline' ? 'none' : initial(longhand)))
        expect(style.animationTrigger).toBe('none')
        expect(style.cssText).toBe('animation-trigger: none;')
        style.animationTrigger = '--timeline entry'
        longhands.forEach(longhand => {
            if (longhand === 'animation-trigger-timeline') {
                expect(style[longhand]).toBe('--timeline')
            } else if (longhand.includes('trigger-range')) {
                expect(style[longhand]).toBe('entry')
            } else {
                expect(style[longhand]).toBe(initial(longhand))
            }
        })
        expect(style.animationTrigger).toBe('--timeline entry')
        expect(style.cssText).toBe('animation-trigger: --timeline entry;')
        style.animationTrigger = '--timeline 10%'
        longhands.forEach(longhand => {
            if (longhand === 'animation-trigger-timeline') {
                expect(style[longhand]).toBe('--timeline')
            } else if (longhand === 'animation-trigger-range-start') {
                expect(style[longhand]).toBe('10%')
            } else {
                expect(style[longhand]).toBe(initial(longhand))
            }
        })
        expect(style.animationTrigger).toBe('--timeline 10%')
        expect(style.cssText).toBe('animation-trigger: --timeline 10%;')
        style.animationTrigger = '--timeline normal normal entry'
        longhands.forEach(longhand => {
            if (longhand === 'animation-trigger-timeline') {
                expect(style[longhand]).toBe('--timeline')
            } else if (longhand.includes('trigger-exit-range')) {
                expect(style[longhand]).toBe('entry')
            } else {
                expect(style[longhand]).toBe(initial(longhand))
            }
        })
        expect(style.animationTrigger).toBe('--timeline normal normal entry')
        expect(style.cssText).toBe('animation-trigger: --timeline normal normal entry;')
        style.animationTrigger = '--timeline normal normal 10%'
        longhands.forEach(longhand => {
            if (longhand === 'animation-trigger-timeline') {
                expect(style[longhand]).toBe('--timeline')
            } else if (longhand === 'animation-trigger-exit-range-start') {
                expect(style[longhand]).toBe('10%')
            } else {
                expect(style[longhand]).toBe(initial(longhand))
            }
        })
        expect(style.animationTrigger).toBe('--timeline normal normal 10%')
        expect(style.cssText).toBe('animation-trigger: --timeline normal normal 10%;')

        // Coordinated value list
        style.animationTrigger = 'once, once'
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.animationTrigger).toBe('once, once')
        expect(style.cssText).toBe('animation-trigger: once, once;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.animationTrigger).toBe('once')
        expect(style.cssText).toBe('animation-trigger: once;')

        // Different lengths of longhand values
        style.animationTriggerBehavior = 'once, once'
        expect(style.animationTrigger).toBe('')
        expect(style.cssText).toBe('animation-trigger-behavior: once, once; animation-trigger-timeline: auto; animation-trigger-range: normal; animation-trigger-exit-range: auto;')
        style.animationTriggerBehavior = 'once'

        // Ranges cannot be specified when the timeline is `auto` or `none`
        style.animationTriggerRange = 'entry'
        expect(style.animationTrigger).toBe('')
        expect(style.cssText).toBe('animation-trigger-behavior: once; animation-trigger-timeline: auto; animation-trigger-range: entry; animation-trigger-exit-range: auto;')
        style.animationTriggerRange = 'normal'

        // Omitted range end values
        style.animationTrigger = '--timeline entry 0% entry 100%'
        expect(style.animationTrigger).toBe('--timeline entry')

        // Range values cannot be omitted when there are non-initial range values on the right
        style.animationTrigger = '--timeline normal 1%'
        expect(style.animationTrigger).toBe('--timeline normal 1%'/* auto normal*/)
    })
})
describe('animation-trigger-exit-range', () => {

    const longhands = shorthands.get('animation-trigger-exit-range')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.animationTriggerExitRange = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.animationTriggerExitRange).toBe('auto')
        expect(style.cssText).toBe('animation-trigger-exit-range: auto;')

        // Missing longhand values
        const values = [
            ['auto'],
            ['0%', '0%', 'auto'],
            ['entry'],
            ['entry 10%', 'entry 10%', 'entry'],
            ['10% entry', '10%', 'entry'],
        ]
        values.forEach(([shorthand, start = shorthand, end = shorthand]) => {
            style.animationTriggerExitRange = shorthand
            expect(style.animationTriggerExitRangeStart).toBe(start)
            expect(style.animationTriggerExitRangeEnd).toBe(end)
            expect(style.animationTriggerExitRange).toBe(shorthand)
            expect(style.cssText).toBe(`animation-trigger-exit-range: ${shorthand};`)
        })

        // Coordinated value list
        style.animationTriggerExitRange = 'auto, auto'
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.animationTriggerExitRange).toBe('auto, auto')
        expect(style.cssText).toBe('animation-trigger-exit-range: auto, auto;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.animationTriggerExitRange).toBe('auto')
        expect(style.cssText).toBe('animation-trigger-exit-range: auto;')

        // Different lengths of longhand values
        style.animationTriggerExitRangeStart = 'auto, auto'
        expect(style.animationTriggerExitRange).toBe('')
        expect(style.cssText).toBe('animation-trigger-exit-range-start: auto, auto; animation-trigger-exit-range-end: auto;')

        // Same <timeline-range-name>
        style.animationTriggerExitRangeStart = 'entry'
        style.animationTriggerExitRangeEnd = 'entry'
        expect(style.animationTriggerExitRange).toBe('entry')
        expect(style.cssText).toBe('animation-trigger-exit-range: entry;')

        // Different <timeline-range-name>
        style.animationTriggerExitRangeEnd = 'normal'
        expect(style.animationTriggerExitRange).toBe('entry normal')
        expect(style.cssText).toBe('animation-trigger-exit-range: entry normal;')

        // Ambiguous <length-percentage>
        style.animationTriggerExitRangeEnd = '100%'
        expect(style.animationTriggerExitRange).toBe('entry 0% 100%')
        expect(style.cssText).toBe('animation-trigger-exit-range: entry 0% 100%;')
    })
})
describe('animation-trigger-range', () => {

    const longhands = shorthands.get('animation-trigger-range')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.animationTriggerRange = 'normal normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.animationTriggerRange).toBe('normal')
        expect(style.cssText).toBe('animation-trigger-range: normal;')

        // Missing longhand values
        const values = [
            ['normal'],
            ['0%', '0%', 'normal'],
            ['entry'],
            ['entry 10%', 'entry 10%', 'entry'],
            ['10% entry', '10%', 'entry'],
        ]
        values.forEach(([shorthand, start = shorthand, end = shorthand]) => {
            style.animationTriggerRange = shorthand
            expect(style.animationTriggerRangeStart).toBe(start)
            expect(style.animationTriggerRangeEnd).toBe(end)
            expect(style.animationTriggerRange).toBe(shorthand)
            expect(style.cssText).toBe(`animation-trigger-range: ${shorthand};`)
        })

        // Coordinated value list
        style.animationTriggerRange = 'normal, normal'
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.animationTriggerRange).toBe('normal, normal')
        expect(style.cssText).toBe('animation-trigger-range: normal, normal;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.animationTriggerRange).toBe('normal')
        expect(style.cssText).toBe('animation-trigger-range: normal;')

        // Different lengths of longhand values
        style.animationTriggerRangeStart = 'normal, normal'
        expect(style.animationTriggerRange).toBe('')
        expect(style.cssText).toBe('animation-trigger-range-start: normal, normal; animation-trigger-range-end: normal;')

        // Same <timeline-range-name>
        style.animationTriggerRangeStart = 'entry'
        style.animationTriggerRangeEnd = 'entry'
        expect(style.animationTriggerRange).toBe('entry')
        expect(style.cssText).toBe('animation-trigger-range: entry;')

        // Different <timeline-range-name>
        style.animationTriggerRangeEnd = 'normal'
        expect(style.animationTriggerRange).toBe('entry normal')
        expect(style.cssText).toBe('animation-trigger-range: entry normal;')

        // Ambiguous <length-percentage>
        style.animationTriggerRangeEnd = '100%'
        expect(style.animationTriggerRange).toBe('entry 0% 100%')
        expect(style.cssText).toBe('animation-trigger-range: entry 0% 100%;')
    })
})
describe('background', () => {

    const subProperties = shorthands.get('background')
    const [, resetOnly] = subProperties
    const longhands = subProperties.flat()

    test('shorthand expansion', () => {

        const style = createStyleBlock()
        const background = 'none 0% 0% / auto repeat repeat scroll padding-box border-box transparent'

        // Initial longhand values
        style.background = background
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.background).toBe('none')
        expect(style.cssText).toBe('background: none;')

        // Empty string
        style.background = ''
        longhands.forEach(longhand => expect(style[longhand]).toBe(''))
        expect(style.background).toBe('')
        expect(style.cssText).toBe('')

        // Missing longhand values + important
        style.cssText = 'background: none !important'
        longhands.forEach(longhand => {
            expect(style[longhand]).toBe(initial(longhand))
            expect(style.getPropertyPriority(longhand)).toBe('important')
        })
        expect(style.background).toBe('none')
        expect(style.cssText).toBe('background: none !important;')
        expect(style.getPropertyPriority('background')).toBe('important')

        // CSS-wide keyword
        style.background = 'initial'
        longhands.forEach(longhand => expect(style[longhand]).toBe('initial'))
        expect(style.background).toBe('initial')
        expect(style.cssText).toBe('background: initial;')

        // Pending substitution
        style.background = 'var(--custom)'
        longhands.forEach(longhand => expect(style[longhand]).toBe(''))
        expect(style.background).toBe('var(--custom)')
        expect(style.cssText).toBe('background: var(--custom);')
        style.background = 'toggle(none)'
        longhands.forEach(longhand => expect(style[longhand]).toBe(''))
        expect(style.background).toBe('toggle(none)')
        expect(style.cssText).toBe('background: toggle(none);')

        // background-position background-size
        style.background = '0% 0% / cover'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'background-size' ? 'cover' : initial(longhand)))
        expect(style.background).toBe('0% 0% / cover')
        expect(style.cssText).toBe('background: 0% 0% / cover;')

        // background-repeat-x background-repeat-y
        style.background = 'repeat-x'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'background-repeat-y' ? 'no-repeat' : initial(longhand)))
        expect(style.background).toBe('repeat-x')
        expect(style.cssText).toBe('background: repeat-x;')
        style.background = 'repeat-y'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'background-repeat-x' ? 'no-repeat' : initial(longhand)))
        expect(style.background).toBe('repeat-y')
        expect(style.cssText).toBe('background: repeat-y;')

        // background-origin background-clip
        style.background = 'padding-box content-box'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'background-clip' ? 'content-box' : initial(longhand)))
        expect(style.background).toBe('content-box')
        expect(style.cssText).toBe('background: content-box;')
        style.background = 'padding-box'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'background-clip' ? 'padding-box' : initial(longhand)))
        expect(style.background).toBe('padding-box')
        expect(style.cssText).toBe('background: padding-box;')
        style.background = 'border-box border-box'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'background-origin' ? 'border-box' : initial(longhand)))
        expect(style.background).toBe('border-box')
        expect(style.cssText).toBe('background: border-box;')

        // Coordinated value list
        style.background = `${background.replace(' transparent', '')}, ${background}`
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(
                (longhand === 'background-color' || resetOnly.includes(longhand))
                    ? initial(longhand)
                    : `${initial(longhand)}, ${initial(longhand)}`))
        expect(style.background).toBe('none, none')
        expect(style.cssText).toBe('background: none, none;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.background).toBe('none')
        expect(style.cssText).toBe('background: none;')

        // Different lengths of longhand values
        style.backgroundImage = 'none, none'
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-image: none, none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; background-color: transparent; background-blend-mode: normal;')

        // Missing longhand declaration
        style.backgroundImage = ''
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; background-color: transparent; background-blend-mode: normal;')
        style.backgroundImage = initial('background-image')

        // Important
        longhands.forEach(longhand => style.setProperty(longhand, initial(longhand), 'important'))
        expect(style.background).toBe('none')
        expect(style.cssText).toBe('background: none !important;')
        style.backgroundImage = ''
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-position: 0% 0% !important; background-size: auto !important; background-repeat: repeat !important; background-attachment: scroll !important; background-origin: padding-box !important; background-clip: border-box !important; background-color: transparent !important; background-blend-mode: normal !important;')

        // CSS-wide keyword
        longhands.forEach(longhand => style[longhand] = 'initial')
        expect(style.background).toBe('initial')
        expect(style.cssText).toBe('background: initial;')
        style.backgroundImage = ''
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: initial; background-blend-mode: initial;')

        // Pending substitution
        longhands.forEach(longhand => style[longhand] = 'var(--custom)')
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-position: var(--custom); background-size: var(--custom); background-repeat-x: var(--custom); background-repeat-y: var(--custom); background-attachment: var(--custom); background-origin: var(--custom); background-clip: var(--custom); background-color: var(--custom); background-blend-mode: var(--custom); background-image: var(--custom);')
        style.background = 'var(--custom)'
        style.backgroundImage = 'var(--custom)'
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-position: ; background-size: ; background-repeat-x: ; background-repeat-y: ; background-attachment: ; background-origin: ; background-clip: ; background-color: ; background-blend-mode: ; background-image: var(--custom);')
        longhands.forEach(longhand => style[longhand] = 'toggle(initial)')
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-position: toggle(initial); background-size: toggle(initial); background-repeat-x: toggle(initial); background-repeat-y: toggle(initial); background-attachment: toggle(initial); background-origin: toggle(initial); background-clip: toggle(initial); background-color: toggle(initial); background-blend-mode: toggle(initial); background-image: toggle(initial);')
        style.background = 'toggle(initial)'
        style.backgroundImage = 'toggle(initial)'
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-position: ; background-size: ; background-repeat-x: ; background-repeat-y: ; background-attachment: ; background-origin: ; background-clip: ; background-color: ; background-blend-mode: ; background-image: toggle(initial);')
    })
})
describe('background-repeat', () => {

    const longhands = shorthands.get('background-repeat')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.backgroundRepeat = 'repeat repeat'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.backgroundRepeat).toBe('repeat')
        expect(style.cssText).toBe('background-repeat: repeat;')

        // Missing longhand values
        style.backgroundRepeat = 'no-repeat'
        longhands.forEach(longhand => expect(style[longhand]).toBe('no-repeat'))
        expect(style.backgroundRepeat).toBe('no-repeat')
        expect(style.cssText).toBe('background-repeat: no-repeat;')

        // repeat-*
        style.backgroundRepeat = 'repeat-x'
        expect(style.backgroundRepeatX).toBe('repeat')
        expect(style.backgroundRepeatY).toBe('no-repeat')
        expect(style.backgroundRepeat).toBe('repeat-x')
        expect(style.cssText).toBe('background-repeat: repeat-x;')
        style.backgroundRepeat = 'repeat-y'
        expect(style.backgroundRepeatX).toBe('no-repeat')
        expect(style.backgroundRepeatY).toBe('repeat')
        expect(style.backgroundRepeat).toBe('repeat-y')
        expect(style.cssText).toBe('background-repeat: repeat-y;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.backgroundRepeat).toBe('repeat')
        expect(style.cssText).toBe('background-repeat: repeat;')
    })
})
describe('block-step', () => {

    const longhands = shorthands.get('block-step')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.blockStep = 'none margin-box auto up'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.blockStep).toBe('none')
        expect(style.cssText).toBe('block-step: none;')

        // Missing longhand values
        style.blockStep = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.blockStep).toBe('none')
        expect(style.cssText).toBe('block-step: none;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.blockStep).toBe('none')
        expect(style.cssText).toBe('block-step: none;')
    })
})
describe('border', () => {

    const longhands = shorthands.get('border').flat()

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.border = 'medium none currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.border).toBe('medium')
        expect(style.cssText).toBe('border: medium;')

        // Missing longhand values
        style.border = 'medium'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.border).toBe('medium')
        expect(style.cssText).toBe('border: medium;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.border).toBe('medium')
        expect(style.cssText).toBe('border: medium;')

        // Non-initial reset-only sub-property
        style.borderImageWidth = '1px'
        expect(style.border).toBe('')
        expect(style.cssText).toBe('border-width: medium; border-style: none; border-color: currentcolor; border-image: 100% / 1px;')

        // Interleaved logical property declaration
        style.cssText = 'border: 1px solid red; border-block-start-width: 2px; border-block-end-width: 2px; border-color: green'
        expect(style.border).toBe('1px solid green')
        expect(style.cssText).toBe('border: 1px solid green; border-block-width: 2px;')
        style.cssText = 'border: 1px solid red; border-block-start-color: orange; border-block-end-color: orange; border-color: green'
        expect(style.border).toBe('1px solid green')
        /* (Ideally) expect(style.cssText).toBe('border-block-color: orange; border: 1px solid green;') */
        expect(style.cssText).toBe('border-width: 1px; border-style: solid; border-image: none; border-block-color: orange; border-color: green;')
        style.cssText = 'border: 1px solid red; border-block-start-color: orange; border-block-start-width: 1px; border-color: green'
        expect(style.border).toBe('1px solid green')
        /* (Ideally) expect(style.cssText).toBe('border-block-start-color: orange; border: 1px solid green; border-block-start-width: 1px;') */
        expect(style.cssText).toBe('border-width: 1px; border-style: solid; border-image: none; border-block-start-color: orange; border-block-start-width: 1px; border-color: green;')
        style.cssText = 'border-image: none; border-block-start-width: 2px; border-width: 1px; border-style: solid; border-color: green;'
        expect(style.border).toBe('1px solid green')
        expect(style.cssText).toBe('border-image: none; border-block-start-width: 2px; border-width: 1px; border-style: solid; border-color: green;')
    })
})
describe('border-block, border-inline', () => {

    const longhands = shorthands.get('border-block')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderBlock = 'medium none currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlock).toBe('medium')
        expect(style.cssText).toBe('border-block: medium;')

        // Missing longhand values
        style.borderBlock = 'medium'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlock).toBe('medium')
        expect(style.cssText).toBe('border-block: medium;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderBlock).toBe('medium')
        expect(style.cssText).toBe('border-block: medium;')

        // Interleaved logical property declaration
        style.cssText = 'border-block-width: 1px; border-top-width: 2px; border-block-style: solid; border-block-color: green'
        expect(style.borderBlock).toBe('1px solid green')
        expect(style.cssText).toBe('border-block: 1px solid green; border-top-width: 2px;')
        style.cssText = 'border-block-width: 1px; border-top-style: none; border-block-style: solid; border-block-color: green'
        expect(style.borderBlock).toBe('1px solid green')
        /* (Ideally) expect(style.cssText).toBe('border-top-style: none; border-block: 1px solid green;') */
        expect(style.cssText).toBe('border-block-width: 1px; border-top-style: none; border-block-style: solid; border-block-color: green;')
        style.cssText = 'border-block-width: 1px; border-top-width: 2px; border-top-style: none; border-block-style: solid; border-block-color: green'
        expect(style.borderBlock).toBe('1px solid green')
        /* (Ideally) expect(style.cssText).toBe('border-top-style: none; border-block: 1px solid green; border-top-width: 2px;') */
        expect(style.cssText).toBe('border-block-width: 1px; border-top-width: 2px; border-top-style: none; border-block-style: solid; border-block-color: green;')
    })
})
describe('border-block-color, border-inline-color', () => {

    const longhands = shorthands.get('border-block-color')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderBlockColor = 'currentColor currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlockColor).toBe('currentcolor')
        expect(style.cssText).toBe('border-block-color: currentcolor;')

        // Missing longhand values
        style.borderBlockColor = 'green'
        longhands.forEach(longhand => expect(style[longhand]).toBe('green'))
        expect(style.borderBlockColor).toBe('green')
        expect(style.cssText).toBe('border-block-color: green;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderBlockColor).toBe('currentcolor')
        expect(style.cssText).toBe('border-block-color: currentcolor;')
    })
})
describe('border-block-end-radius, border-block-start-radius, border-bottom-radius, border-inline-end-radius, border-inline-start-radius, border-left-radius, border-right-radius, border-top-radius', () => {

    const longhands = shorthands.get('border-block-end-radius')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderBlockEndRadius = '0 0 / 0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlockEndRadius).toBe('0px')
        expect(style.cssText).toBe('border-block-end-radius: 0px;')

        // Missing longhand values
        style.borderBlockEndRadius = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.borderBlockEndRadius).toBe('1px')
        expect(style.cssText).toBe('border-block-end-radius: 1px;')
        style.borderBlockEndRadius = '1px / calc(1px)'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px calc(1px)'))
        expect(style.borderBlockEndRadius).toBe('1px / calc(1px)')
        expect(style.cssText).toBe('border-block-end-radius: 1px / calc(1px);')
        style.borderBlockEndRadius = '1px / 2px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px 2px'))
        expect(style.borderBlockEndRadius).toBe('1px / 2px')
        expect(style.cssText).toBe('border-block-end-radius: 1px / 2px;')
        style.borderBlockEndRadius = '1px 2px / 1px'
        expect(style.borderEndStartRadius).toBe('1px')
        expect(style.borderEndEndRadius).toBe('2px 1px')
        expect(style.borderBlockEndRadius).toBe('1px 2px / 1px')
        expect(style.cssText).toBe('border-block-end-radius: 1px 2px / 1px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderBlockEndRadius).toBe('0px')
        expect(style.cssText).toBe('border-block-end-radius: 0px;')
    })
})
describe('border-block-style, border-inline-style', () => {

    const longhands = shorthands.get('border-block-style')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderBlockStyle = 'none none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlockStyle).toBe('none')
        expect(style.cssText).toBe('border-block-style: none;')

        // Missing longhand values
        style.borderBlockStyle = 'solid'
        longhands.forEach(longhand => expect(style[longhand]).toBe('solid'))
        expect(style.borderBlockStyle).toBe('solid')
        expect(style.cssText).toBe('border-block-style: solid;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderBlockStyle).toBe('none')
        expect(style.cssText).toBe('border-block-style: none;')
    })
})
describe('border-block-width, border-inline-width', () => {

    const longhands = shorthands.get('border-block-width')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderBlockWidth = 'medium medium'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlockWidth).toBe('medium')
        expect(style.cssText).toBe('border-block-width: medium;')

        // Missing longhand values
        style.borderBlockWidth = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.borderBlockWidth).toBe('1px')
        expect(style.cssText).toBe('border-block-width: 1px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderBlockWidth).toBe('medium')
        expect(style.cssText).toBe('border-block-width: medium;')
    })
})
describe('border-bottom, border-left, border-right, border-top', () => {

    const longhands = shorthands.get('border-top')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderTop = 'medium none currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderTop).toBe('medium')
        expect(style.cssText).toBe('border-top: medium;')

        // Missing longhand values
        style.borderTop = 'medium'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderTop).toBe('medium')
        expect(style.cssText).toBe('border-top: medium;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderTop).toBe('medium')
        expect(style.cssText).toBe('border-top: medium;')
    })
})
describe('border-clip', () => {

    const longhands = shorthands.get('border-clip')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        style.borderClip = 'normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderClip).toBe('normal')
        expect(style.cssText).toBe('border-clip: normal;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // All equal longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderClip).toBe('normal')
        expect(style.cssText).toBe('border-clip: normal;')

        // Not all equal longhand values
        style.borderClipTop = '1px'
        expect(style.borderClip).toBe('')
        expect(style.cssText).toBe('border-clip-top: 1px; border-clip-right: normal; border-clip-bottom: normal; border-clip-left: normal;')
    })
})
describe('border-color', () => {

    const longhands = shorthands.get('border-color')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderColor = 'currentColor currentColor currentColor currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderColor).toBe('currentcolor')
        expect(style.cssText).toBe('border-color: currentcolor;')

        // Missing longhand values
        const values = ['red', 'orange', 'green']
        style.borderColor = 'red'
        longhands.forEach(longhand => expect(style[longhand]).toBe('red'))
        expect(style.borderColor).toBe('red')
        expect(style.cssText).toBe('border-color: red;')
        style.borderColor = 'red orange'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.borderColor).toBe('red orange')
        expect(style.cssText).toBe('border-color: red orange;')
        style.borderColor = 'red orange green'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.borderColor).toBe('red orange green')
        expect(style.cssText).toBe('border-color: red orange green;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderColor).toBe('currentcolor')
        expect(style.cssText).toBe('border-color: currentcolor;')

        // Interleaved logical property declaration
        style.cssText = 'border-top-color: green; border-block-start-color: orange; border-right-color: green; border-bottom-color: green; border-left-color: green'
        expect(style.borderColor).toBe('green')
        expect(style.cssText).toBe('border-top-color: green; border-block-start-color: orange; border-right-color: green; border-bottom-color: green; border-left-color: green;')
        style.cssText = 'border-top-color: green; border-block-start-width: 1px; border-right-color: green; border-bottom-color: green; border-left-color: green'
        expect(style.borderColor).toBe('green')
        expect(style.cssText).toBe('border-color: green; border-block-start-width: 1px;')
    })
})
describe('border-image', () => {

    const longhands = shorthands.get('border-image')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderImage = 'none 100% / 1 / 0 stretch'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderImage).toBe('none')
        expect(style.cssText).toBe('border-image: none;')

        // Missing longhand values
        style.borderImage = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderImage).toBe('none')
        expect(style.cssText).toBe('border-image: none;')
        style.borderImage = '100% / 0'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'border-image-width' ? '0' : initial(longhand)))
        expect(style.borderImage).toBe('100% / 0')
        expect(style.cssText).toBe('border-image: 100% / 0;')
        style.borderImage = '100% / / 1'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'border-image-outset' ? '1' : initial(longhand)))
        expect(style.borderImage).toBe('100% / 1 / 1')
        expect(style.cssText).toBe('border-image: 100% / 1 / 1;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderImage).toBe('none')
        expect(style.cssText).toBe('border-image: none;')
    })
})
describe('border-radius', () => {

    const longhands = shorthands.get('border-radius')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderRadius = '0 0 0 0 / 0 0 0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderRadius).toBe('0px')
        expect(style.cssText).toBe('border-radius: 0px;')

        // Missing longhand values
        style.borderRadius = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.borderRadius).toBe('1px')
        expect(style.cssText).toBe('border-radius: 1px;')
        style.borderRadius = '1px / calc(1px)'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px calc(1px)'))
        expect(style.borderRadius).toBe('1px / calc(1px)')
        expect(style.cssText).toBe('border-radius: 1px / calc(1px);')
        style.borderRadius = '1px / 2px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px 2px'))
        expect(style.borderRadius).toBe('1px / 2px')
        expect(style.cssText).toBe('border-radius: 1px / 2px;')
        style.borderRadius = '1px 2px 3px 4px / 1px 2px'
        expect(style.borderTopLeftRadius).toBe('1px')
        expect(style.borderTopRightRadius).toBe('2px')
        expect(style.borderBottomRightRadius).toBe('3px 1px')
        expect(style.borderBottomLeftRadius).toBe('4px 2px')
        expect(style.borderRadius).toBe('1px 2px 3px 4px / 1px 2px')
        expect(style.cssText).toBe('border-radius: 1px 2px 3px 4px / 1px 2px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderRadius).toBe('0px')
        expect(style.cssText).toBe('border-radius: 0px;')
    })
})
describe('border-style', () => {

    const longhands = shorthands.get('border-style')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderStyle = 'none none none none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderStyle).toBe('none')
        expect(style.cssText).toBe('border-style: none;')

        // Missing longhand values
        const values = ['dotted', 'dashed', 'solid']
        style.borderStyle = 'dotted'
        longhands.forEach(longhand => expect(style[longhand]).toBe('dotted'))
        expect(style.borderStyle).toBe('dotted')
        expect(style.cssText).toBe('border-style: dotted;')
        style.borderStyle = 'dotted dashed'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.borderStyle).toBe('dotted dashed')
        expect(style.cssText).toBe('border-style: dotted dashed;')
        style.borderStyle = 'dotted dashed solid'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.borderStyle).toBe('dotted dashed solid')
        expect(style.cssText).toBe('border-style: dotted dashed solid;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderStyle).toBe('none')
        expect(style.cssText).toBe('border-style: none;')
    })
})
describe('border-width', () => {

    const longhands = shorthands.get('border-width')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderWidth = 'medium medium medium medium'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderWidth).toBe('medium')
        expect(style.cssText).toBe('border-width: medium;')

        // Missing longhand values
        const values = ['0px', '1px', '2px']
        style.borderWidth = '0px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('0px'))
        expect(style.borderWidth).toBe('0px')
        expect(style.cssText).toBe('border-width: 0px;')
        style.borderWidth = '0px 1px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.borderWidth).toBe('0px 1px')
        expect(style.cssText).toBe('border-width: 0px 1px;')
        style.borderWidth = '0px 1px 2px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.borderWidth).toBe('0px 1px 2px')
        expect(style.cssText).toBe('border-width: 0px 1px 2px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderWidth).toBe('medium')
        expect(style.cssText).toBe('border-width: medium;')
    })
})
describe('box-shadow', () => {

    const longhands = shorthands.get('box-shadow')[0]
    const shadow = 'currentcolor none 0px 0px outset'

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.boxShadow = 'currentColor none 0 0 outset'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.boxShadow).toBe('currentcolor none')
        expect(style.cssText).toBe('box-shadow: currentcolor none;')

        // Missing longhand values
        style.boxShadow = 'none'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'box-shadow-color' ? 'transparent' : initial(longhand)))
        expect(style.boxShadow).toBe('none')
        expect(style.cssText).toBe('box-shadow: none;')
        style.boxShadow = '0px 0px'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'box-shadow-offset' ? '0px 0px' : initial(longhand)))
        expect(style.boxShadow).toBe('0px 0px')
        expect(style.cssText).toBe('box-shadow: 0px 0px;')

        // Coordinated value list
        style.boxShadow = `${shadow}, ${shadow}`
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.boxShadow).toBe('currentcolor none, currentcolor none')
        expect(style.cssText).toBe('box-shadow: currentcolor none, currentcolor none;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.boxShadow).toBe('currentcolor none')
        expect(style.cssText).toBe('box-shadow: currentcolor none;')

        // Different lengths of longhand values
        style.boxShadowOffset = '0px 0px, 0px 0px'
        expect(style.boxShadow).toBe('')
        expect(style.cssText).toBe('box-shadow-color: currentcolor; box-shadow-offset: 0px 0px, 0px 0px; box-shadow-blur: 0px; box-shadow-spread: 0px; box-shadow-position: outset;')
    })
})
describe('caret', () => {

    const longhands = shorthands.get('caret')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.caret = 'auto auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.caret).toBe('auto')
        expect(style.cssText).toBe('caret: auto;')

        // Missing longhand values
        style.caret = 'auto'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.caret).toBe('auto')
        expect(style.cssText).toBe('caret: auto;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.caret).toBe('auto')
        expect(style.cssText).toBe('caret: auto;')
    })
})
describe('column-rule', () => {

    const longhands = shorthands.get('column-rule')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.columnRule = 'medium none currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.columnRule).toBe('medium')
        expect(style.cssText).toBe('column-rule: medium;')

        // Missing longhand values
        style.columnRule = 'medium'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.columnRule).toBe('medium')
        expect(style.cssText).toBe('column-rule: medium;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.columnRule).toBe('medium')
        expect(style.cssText).toBe('column-rule: medium;')
    })
})
describe('columns', () => {

    const longhands = shorthands.get('columns')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.columns = 'auto auto / auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.columns).toBe('auto')
        expect(style.cssText).toBe('columns: auto;')

        // Missing longhand values
        style.columns = 'auto'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.columns).toBe('auto')
        expect(style.cssText).toBe('columns: auto;')
        style.columns = '1'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'column-count' ? '1' : initial(longhand)))
        expect(style.columns).toBe('1')
        expect(style.cssText).toBe('columns: 1;')
        style.columns = 'auto / 1px'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'column-height' ? '1px' : initial(longhand)))
        expect(style.columns).toBe('auto / 1px')
        expect(style.cssText).toBe('columns: auto / 1px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.columns).toBe('auto')
        expect(style.cssText).toBe('columns: auto;')
    })
})
describe('contain-intrinsic-size', () => {

    const longhands = shorthands.get('contain-intrinsic-size')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.containIntrinsicSize = 'none none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.containIntrinsicSize).toBe('none')
        expect(style.cssText).toBe('contain-intrinsic-size: none;')

        // Missing longhand values
        style.containIntrinsicSize = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.containIntrinsicSize).toBe('1px')
        expect(style.cssText).toBe('contain-intrinsic-size: 1px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.containIntrinsicSize).toBe('none')
        expect(style.cssText).toBe('contain-intrinsic-size: none;')
    })
})
describe('container', () => {

    const longhands = shorthands.get('container')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.container = 'none / normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.container).toBe('none')
        expect(style.cssText).toBe('container: none;')

        // Missing longhand values
        style.container = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.container).toBe('none')
        expect(style.cssText).toBe('container: none;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.container).toBe('none')
        expect(style.cssText).toBe('container: none;')
    })
})
describe('corner-shape', () => {

    const longhands = shorthands.get('corner-shape')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.cornerShape = 'round round round round'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.cornerShape).toBe('round')
        expect(style.cssText).toBe('corner-shape: round;')

        // Missing longhand values
        const values = ['round', 'scoop', 'bevel']
        style.cornerShape = 'round'
        longhands.forEach(longhand => expect(style[longhand]).toBe('round'))
        expect(style.cornerShape).toBe('round')
        expect(style.cssText).toBe('corner-shape: round;')
        style.cornerShape = 'round scoop'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.cornerShape).toBe('round scoop')
        expect(style.cssText).toBe('corner-shape: round scoop;')
        style.cornerShape = 'round scoop bevel'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.cornerShape).toBe('round scoop bevel')
        expect(style.cssText).toBe('corner-shape: round scoop bevel;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.cornerShape).toBe('round')
        expect(style.cssText).toBe('corner-shape: round;')
    })
})
describe('corner-block-end-shape, corner-bottom-shape, corner-block-start-shape, corner-inline-end-shape, corner-inline-start-shape, corner-left-shape, corner-right-shape, corner-top-shape', () => {

    const longhands = shorthands.get('corner-block-end-shape')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.cornerBlockEndShape = 'round round'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.cornerBlockEndShape).toBe('round')
        expect(style.cssText).toBe('corner-block-end-shape: round;')

        // Missing longhand values
        style.cornerBlockEndShape = 'round'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.cornerBlockEndShape).toBe('round')
        expect(style.cssText).toBe('corner-block-end-shape: round;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.cornerBlockEndShape).toBe('round')
        expect(style.cssText).toBe('corner-block-end-shape: round;')
    })
})
describe('cue, pause, rest', () => {

    const longhands = shorthands.get('cue')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.cue = 'none none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.cue).toBe('none')
        expect(style.cssText).toBe('cue: none;')

        // Missing longhand values
        style.cue = 'url("icon.wav")'
        longhands.forEach(longhand => expect(style[longhand]).toBe('url("icon.wav")'))
        expect(style.cue).toBe('url("icon.wav")')
        expect(style.cssText).toBe('cue: url("icon.wav");')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.cue).toBe('none')
        expect(style.cssText).toBe('cue: none;')
    })
})
describe('flex', () => {

    const longhands = shorthands.get('flex')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.flex = '0 1 auto'
        expect(style).toHaveLength(longhands.length)
        expect(style.flexGrow).toBe('0')
        expect(style.flexShrink).toBe('1')
        expect(style.flexBasis).toBe('auto')
        expect(style.flex).toBe('0 auto')
        expect(style.cssText).toBe('flex: 0 auto;')

        // Missing longhand values
        style.flex = '1'
        expect(style.flexGrow).toBe('1')
        expect(style.flexShrink).toBe('1')
        expect(style.flexBasis).toBe('0px')
        expect(style.flex).toBe('1')
        expect(style.cssText).toBe('flex: 1;')
        style.flex = '1 1'
        expect(style.flexGrow).toBe('1')
        expect(style.flexShrink).toBe('1')
        expect(style.flexBasis).toBe('0px')
        expect(style.flex).toBe('1')
        expect(style.cssText).toBe('flex: 1;')
        style.flex = '0px'
        expect(style.flexGrow).toBe('1')
        expect(style.flexShrink).toBe('1')
        expect(style.flexBasis).toBe('0px')
        expect(style.flex).toBe('1')
        expect(style.cssText).toBe('flex: 1;')

        // none
        style.flex = 'none'
        expect(style.flexGrow).toBe('0')
        expect(style.flexShrink).toBe('0')
        expect(style.flexBasis).toBe('auto')
        expect(style.flex).toBe('none')
        expect(style.cssText).toBe('flex: none;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.flex).toBe('0 auto')
        expect(style.cssText).toBe('flex: 0 auto;')
    })
})
describe('flex-flow', () => {

    const longhands = shorthands.get('flex-flow')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.flexFlow = 'row nowrap'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.flexFlow).toBe('row')
        expect(style.cssText).toBe('flex-flow: row;')

        // Missing longhand values
        style.flexFlow = 'row'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.flexFlow).toBe('row')
        expect(style.cssText).toBe('flex-flow: row;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.flexFlow).toBe('row')
        expect(style.cssText).toBe('flex-flow: row;')
    })
})
describe('font', () => {

    const subProperties = shorthands.get('font')
    const [, resetOnly] = subProperties
    const longhands = subProperties.flat()

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.font = 'normal normal normal normal medium / normal monospace'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.font).toBe('medium monospace')
        expect(style.cssText).toBe('font: medium monospace;')

        // Missing longhand values
        style.font = 'medium monospace'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.font).toBe('medium monospace')
        expect(style.cssText).toBe('font: medium monospace;')
        style.font = 'medium / 1 monospace'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'line-height' ? '1' : initial(longhand)))
        expect(style.font).toBe('medium / 1 monospace')
        expect(style.cssText).toBe('font: medium / 1 monospace;')

        // System font
        style.font = 'caption'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(resetOnly.includes(longhand) ? initial(longhand) : ''))
        expect(style.font).toBe('caption')
        expect(style.cssText).toBe('font: caption;')
        style.fontStyle = 'italic'
        expect(style.font).toBe('')
        expect(style.cssText).toBe('font-style: italic; font-variant-ligatures: ; font-variant-caps: ; font-variant-alternates: ; font-variant-numeric: ; font-variant-east-asian: ; font-variant-position: ; font-variant-emoji: ; font-weight: ; font-width: ; font-size: ; line-height: ; font-family: ; font-feature-settings: normal; font-kerning: auto; font-language-override: normal; font-optical-sizing: auto; font-size-adjust: none; font-variation-settings: normal;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.font).toBe('medium monospace')
        expect(style.cssText).toBe('font: medium monospace;')

        // Non CSS2 font-variant property
        style.fontVariantCaps = 'all-petite-caps'
        expect(style.font).toBe('')
        expect(style.cssText).toBe('font-style: normal; font-variant: all-petite-caps; font-weight: normal; font-width: normal; font-size: medium; line-height: normal; font-family: monospace; font-feature-settings: normal; font-kerning: auto; font-language-override: normal; font-optical-sizing: auto; font-size-adjust: none; font-variation-settings: normal;')
        style.fontVariantCaps = initial('font-variant-caps')

        // Non CSS3 font-width property
        style.fontWidth = '110%'
        expect(style.font).toBe('')
        expect(style.cssText).toBe('font-style: normal; font-variant: normal; font-weight: normal; font-width: 110%; font-size: medium; line-height: normal; font-family: monospace; font-feature-settings: normal; font-kerning: auto; font-language-override: normal; font-optical-sizing: auto; font-size-adjust: none; font-variation-settings: normal;')
    })
})
describe('font-variant', () => {

    const longhands = shorthands.get('font-variant')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.fontVariant = 'normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.fontVariant).toBe('normal')
        expect(style.cssText).toBe('font-variant: normal;')

        // Missing longhand values
        style.fontVariant = 'normal'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.fontVariant).toBe('normal')
        expect(style.cssText).toBe('font-variant: normal;')

        // none
        style.fontVariant = 'none'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'font-variant-ligatures' ? 'none' : initial(longhand)))
        expect(style.fontVariant).toBe('none')
        expect(style.cssText).toBe('font-variant: none;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.fontVariant).toBe('normal')
        expect(style.cssText).toBe('font-variant: normal;')
    })
})
describe('font-synthesis', () => {

    const longhands = shorthands.get('font-synthesis')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.fontSynthesis = 'weight style small-caps position'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.fontSynthesis).toBe('weight style small-caps position')
        expect(style.cssText).toBe('font-synthesis: weight style small-caps position;')

        // Missing longhand values
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
            longhands.forEach((longhand, i) => expect(style[longhand]).toBe(expected[i]))
            expect(style.fontSynthesis).toBe(input)
            expect(style.cssText).toBe(`font-synthesis: ${input};`)
        })

        // none
        style.fontSynthesis = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe('none'))
        expect(style.fontSynthesis).toBe('none')
        expect(style.cssText).toBe('font-synthesis: none;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.fontSynthesis).toBe('weight style small-caps position')
        expect(style.cssText).toBe('font-synthesis: weight style small-caps position;')
    })
})
describe('gap', () => {

    const longhands = shorthands.get('gap')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.gap = 'normal normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.gap).toBe('normal')
        expect(style.cssText).toBe('gap: normal;')

        // Missing longhand values
        style.gap = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.gap).toBe('1px')
        expect(style.cssText).toBe('gap: 1px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.gap).toBe('normal')
        expect(style.cssText).toBe('gap: normal;')
    })
})
describe('grid', () => {

    const longhands = shorthands.get('grid')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values (not all longhands can be explicitly declared)
        style.grid = 'none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand.startsWith('grid-auto') ? initial(longhand) : 'none'))
        expect(style.grid).toBe('none')
        expect(style.cssText).toBe('grid: none;')

        // Explicit row and column templates
        style.grid = 'none / none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.grid).toBe('none')
        expect(style.cssText).toBe('grid: none;')

        // Implicit row template and explicit column template
        style.grid = 'auto-flow none / none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.grid).toBe('none')
        expect(style.cssText).toBe('grid: none;')

        // Explicit row template and implicit column template
        style.grid = 'none / auto-flow auto'
        longhands.forEach(longhand => {
            if (longhand === 'grid-auto-columns') {
                expect(style[longhand]).toBe('auto')
            } else if (longhand === 'grid-auto-flow') {
                expect(style[longhand]).toBe('column')
            } else {
                expect(style[longhand]).toBe(initial(longhand))
            }
        })
        expect(style.grid).toBe('none / auto-flow')
        expect(style.cssText).toBe('grid: none / auto-flow;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.grid).toBe('none')
        expect(style.cssText).toBe('grid: none;')

        // Implicit column track list
        style.gridAutoFlow = 'column'
        expect(style.grid).toBe('none / auto-flow')
        expect(style.cssText).toBe('grid: none / auto-flow;')

        // Implicit row and column track list
        style.gridAutoRows = '1px'
        expect(style.grid).toBe('')
        expect(style.cssText).toBe('grid-template: none; grid-auto-flow: column; grid-auto-rows: 1px; grid-auto-columns: auto;')
        style.gridAutoFlow = initial('grid-auto-flow')
        style.gridAutoColumns = '1px'
        expect(style.grid).toBe('')
        expect(style.cssText).toBe('grid-template: none; grid-auto-flow: row; grid-auto-rows: 1px; grid-auto-columns: 1px;')
        style.gridAutoRows = initial('grid-auto-rows')
        expect(style.grid).toBe('')
        expect(style.cssText).toBe('grid-template: none; grid-auto-flow: row; grid-auto-rows: auto; grid-auto-columns: 1px;')
        style.gridAutoColumns = initial('grid-auto-columns')

        // Explicit and implicit row track list
        style.gridTemplateRows = '1px'
        style.gridAutoRows = '1px'
        expect(style.grid).toBe('')
        expect(style.cssText).toBe('grid-template: 1px / none; grid-auto-flow: row; grid-auto-rows: 1px; grid-auto-columns: auto;')
        style.gridAutoRows = initial('grid-auto-rows')
        style.gridAutoFlow = 'row dense'
        expect(style.grid).toBe('')
        expect(style.cssText).toBe('grid-template: 1px / none; grid-auto-flow: dense; grid-auto-rows: auto; grid-auto-columns: auto;')
        style.gridAutoFlow = initial('grid-auto-flow')
        style.gridTemplateRows = initial('grid-template-rows')

        // Explicit and implicit column track list
        style.gridTemplateColumns = '1px'
        style.gridAutoColumns = '1px'
        expect(style.grid).toBe('')
        expect(style.cssText).toBe('grid-template: none / 1px; grid-auto-flow: row; grid-auto-rows: auto; grid-auto-columns: 1px;')
        style.gridAutoColumns = initial('grid-auto-columns')
        style.gridAutoFlow = 'column'
        expect(style.grid).toBe('')
        expect(style.cssText).toBe('grid-template: none / 1px; grid-auto-flow: column; grid-auto-rows: auto; grid-auto-columns: auto;')
        style.gridAutoFlow = initial('grid-auto-flow')
        style.gridTemplateColumns = initial('grid-template-columns')
    })
})
describe('grid-area', () => {

    const longhands = shorthands.get('grid-area')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.gridArea = 'auto / auto / auto / auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.gridArea).toBe('auto')
        expect(style.cssText).toBe('grid-area: auto;')

        // Missing longhand values
        const values = ['a', 'b', 'c']
        style.gridArea = 'a'
        longhands.forEach(longhand => expect(style[longhand]).toBe('a'))
        expect(style.gridArea).toBe('a')
        expect(style.cssText).toBe('grid-area: a;')
        style.gridArea = 'a / b'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.gridArea).toBe('a / b')
        expect(style.cssText).toBe('grid-area: a / b;')
        style.gridArea = 'a / b / c'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.gridArea).toBe('a / b / c')
        expect(style.cssText).toBe('grid-area: a / b / c;')

        // Explicit values
        style.gridArea = '1 / 1 / 1 / 1'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1'))
        expect(style.gridArea).toBe('1 / 1 / 1 / 1')
        expect(style.cssText).toBe('grid-area: 1 / 1 / 1 / 1;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.gridArea).toBe('auto')
        expect(style.cssText).toBe('grid-area: auto;')
    })
})
describe('grid-column, grid-row', () => {

    const longhands = shorthands.get('grid-column')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.gridColumn = 'auto / auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.gridColumn).toBe('auto')
        expect(style.cssText).toBe('grid-column: auto;')

        // Missing longhand values
        const values = ['a', 'b']
        style.gridColumn = 'a'
        longhands.forEach(longhand => expect(style[longhand]).toBe('a'))
        expect(style.gridColumn).toBe('a')
        expect(style.cssText).toBe('grid-column: a;')
        style.gridColumn = 'a / b'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.gridColumn).toBe('a / b')
        expect(style.cssText).toBe('grid-column: a / b;')

        // Explicit values
        style.gridColumn = '1 / 1'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1'))
        expect(style.gridColumn).toBe('1 / 1')
        expect(style.cssText).toBe('grid-column: 1 / 1;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.gridColumn).toBe('auto')
        expect(style.cssText).toBe('grid-column: auto;')
    })
})
describe('grid-template', () => {

    const longhands = shorthands.get('grid-template')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values (not all longhands can be explicitly declared)
        style.gridTemplate = 'none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.gridTemplate).toBe('none')
        expect(style.cssText).toBe('grid-template: none;')

        // Row and column templates
        style.gridTemplate = 'none / none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.gridTemplate).toBe('none')
        expect(style.cssText).toBe('grid-template: none;')

        // Areas
        style.gridTemplate = `
            [top a-top] "a a" 1px  [a-bottom]
                [b-top] "b b" auto [b-bottom bottom]
            / auto`
        expect(style.gridTemplateAreas).toBe('"a a" "b b"')
        expect(style.gridTemplateRows).toBe('[top a-top] 1px [a-bottom b-top] auto [b-bottom bottom]')
        expect(style.gridTemplateColumns).toBe('auto')
        expect(style.gridTemplate).toBe('[top a-top] "a a" 1px [a-bottom b-top] "b b" [b-bottom bottom] / auto')
        expect(style.cssText).toBe('grid-template: [top a-top] "a a" 1px [a-bottom b-top] "b b" [b-bottom bottom] / auto;')

        // Empty <line-names>
        style.gridTemplate = '[] "." [] [a] "." [] / [] 1px []'
        expect(style.gridTemplateAreas).toBe('"." "."')
        expect(style.gridTemplateRows).toBe('auto [a] auto')
        expect(style.gridTemplateColumns).toBe('1px')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.gridTemplate).toBe('none')
        expect(style.cssText).toBe('grid-template: none;')

        // Areas
        style.gridTemplateAreas = '"a a" "b b"'
        style.gridTemplateRows = '[top a-top] 1px [a-bottom b-top] auto [b-bottom bottom]'
        expect(style.gridTemplate).toBe('[top a-top] "a a" 1px [a-bottom b-top] "b b" [b-bottom bottom]')
        expect(style.cssText).toBe('grid-template: [top a-top] "a a" 1px [a-bottom b-top] "b b" [b-bottom bottom];')

        // Areas and a row track list of same length
        style.gridTemplateRows = 'auto auto'
        expect(style.gridTemplate).toBe('"a a" "b b"')
        expect(style.cssText).toBe('grid-template: "a a" "b b";')

        // Areas and a shorter row track list
        style.gridTemplateRows = 'auto'
        expect(style.gridTemplate).toBe('')
        expect(style.cssText).toBe('grid-template-rows: auto; grid-template-columns: none; grid-template-areas: "a a" "b b";')

        // Areas and a longer row track list
        style.gridTemplateRows = 'auto auto auto'
        expect(style.gridTemplate).toBe('')
        expect(style.cssText).toBe('grid-template-rows: auto auto auto; grid-template-columns: none; grid-template-areas: "a a" "b b";')
        style.gridTemplateRows = initial('grid-template-rows')

        // Areas and no row track list
        style.gridTemplateAreas = '"a"'
        expect(style.gridTemplate).toBe('')
        expect(style.cssText).toBe('grid-template-rows: none; grid-template-columns: none; grid-template-areas: "a";')

        // Areas and a repeated row track list
        style.gridTemplateRows = 'repeat(1, 1px)'
        expect(style.gridTemplate).toBe('')
        expect(style.cssText).toBe('grid-template-rows: repeat(1, 1px); grid-template-columns: none; grid-template-areas: "a";')
        style.gridTemplateRows = 'repeat(auto-fill, 1px)'
        expect(style.gridTemplate).toBe('')
        expect(style.cssText).toBe('grid-template-rows: repeat(auto-fill, 1px); grid-template-columns: none; grid-template-areas: "a";')

        // Areas and a repeated column track list
        style.gridTemplateRows = 'auto'
        style.gridTemplateColumns = 'repeat(1, 1px)'
        expect(style.gridTemplate).toBe('')
        expect(style.cssText).toBe('grid-template-rows: auto; grid-template-columns: repeat(1, 1px); grid-template-areas: "a";')
        style.gridTemplateColumns = 'repeat(auto-fill, 1px)'
        expect(style.gridTemplate).toBe('')
        expect(style.cssText).toBe('grid-template-rows: auto; grid-template-columns: repeat(auto-fill, 1px); grid-template-areas: "a";')
        style.gridTemplateColumns = initial('grid-template-columns')

        // Areas and a subgrided track list
        style.gridTemplateRows = 'subgrid []'
        expect(style.gridTemplate).toBe('')
        expect(style.cssText).toBe('grid-template-rows: subgrid []; grid-template-columns: none; grid-template-areas: "a";')
        style.gridTemplateRows = 'auto'
        style.gridTemplateColumns = 'subgrid []'
        expect(style.gridTemplate).toBe('')
        expect(style.cssText).toBe('grid-template-rows: auto; grid-template-columns: subgrid []; grid-template-areas: "a";')

        // Areas and a longer column track list
        style.gridTemplateColumns = '1px 1px'
        expect(style.gridTemplate).toBe('"a" / 1px 1px')
        expect(style.cssText).toBe('grid-template: "a" / 1px 1px;')
    })
})
describe('inset', () => {

    const longhands = shorthands.get('inset')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.inset = 'auto auto auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.inset).toBe('auto')
        expect(style.cssText).toBe('inset: auto;')

        // Missing longhand values
        const values = ['0px', '1px', '2px']
        style.inset = '0px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('0px'))
        expect(style.inset).toBe('0px')
        expect(style.cssText).toBe('inset: 0px;')
        style.inset = '0px 1px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.inset).toBe('0px 1px')
        expect(style.cssText).toBe('inset: 0px 1px;')
        style.inset = '0px 1px 2px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.inset).toBe('0px 1px 2px')
        expect(style.cssText).toBe('inset: 0px 1px 2px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.inset).toBe('auto')
        expect(style.cssText).toBe('inset: auto;')
    })
})
describe('inset-block, inset-inline', () => {

    const longhands = shorthands.get('inset-block')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.insetBlock = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.insetBlock).toBe('auto')
        expect(style.cssText).toBe('inset-block: auto;')

        // Missing longhand values
        style.insetBlock = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.insetBlock).toBe('1px')
        expect(style.cssText).toBe('inset-block: 1px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.insetBlock).toBe('auto')
        expect(style.cssText).toBe('inset-block: auto;')
    })
})
describe('interest-delay', () => {

    const longhands = shorthands.get('interest-delay')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.interestDelay = 'normal normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.interestDelay).toBe('normal')
        expect(style.cssText).toBe('interest-delay: normal;')

        // Missing longhand values
        style.interestDelay = 'normal'
        longhands.forEach(longhand => expect(style[longhand]).toBe('normal'))
        expect(style.interestDelay).toBe('normal')
        expect(style.cssText).toBe('interest-delay: normal;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.interestDelay).toBe('normal')
        expect(style.cssText).toBe('interest-delay: normal;')
    })
})
describe('line-clamp', () => {

    const longhands = shorthands.get('line-clamp')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values (not all longhands can be explicitly declared)
        style.lineClamp = 'none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.lineClamp).toBe('none')
        expect(style.cssText).toBe('line-clamp: none;')

        // Missing longhand values
        style.lineClamp = '1'
        expect(style.maxLines).toBe('1')
        expect(style.blockEllipsis).toBe('auto')
        expect(style.continue).toBe('collapse')
        expect(style.lineClamp).toBe('1')
        expect(style.cssText).toBe('line-clamp: 1;')
        style.lineClamp = 'auto'
        expect(style.maxLines).toBe('none')
        expect(style.blockEllipsis).toBe('auto')
        expect(style.continue).toBe('collapse')
        expect(style.lineClamp).toBe('auto')
        expect(style.cssText).toBe('line-clamp: auto;')
        style.lineClamp = '1 -webkit-legacy'
        expect(style.maxLines).toBe('1')
        expect(style.blockEllipsis).toBe('auto')
        expect(style.continue).toBe('-webkit-legacy')
        expect(style.lineClamp).toBe('1 -webkit-legacy')
        expect(style.cssText).toBe('line-clamp: 1 -webkit-legacy;')
        style.lineClamp = 'no-ellipsis -webkit-legacy'
        expect(style.maxLines).toBe('none')
        expect(style.blockEllipsis).toBe('no-ellipsis')
        expect(style.continue).toBe('-webkit-legacy')
        expect(style.lineClamp).toBe('no-ellipsis -webkit-legacy')
        expect(style.cssText).toBe('line-clamp: no-ellipsis -webkit-legacy;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.lineClamp).toBe('none')
        expect(style.cssText).toBe('line-clamp: none;')

        // All longhands cannot be represented
        style.maxLines = '1'
        expect(style.lineClamp).toBe('')
        expect(style.cssText).toBe('max-lines: 1; block-ellipsis: no-ellipsis; continue: auto;')
        style.maxLines = initial('max-lines')
        style.blockEllipsis = 'auto'
        expect(style.lineClamp).toBe('')
        expect(style.cssText).toBe('-webkit-line-clamp: none;')
        style.blockEllipsis = initial('block-ellipsis')
        style.continue = 'collapse'
        expect(style.lineClamp).toBe('')
        expect(style.cssText).toBe('max-lines: none; block-ellipsis: no-ellipsis; continue: collapse;')
        style.continue = 'discard'
        expect(style.lineClamp).toBe('')
        expect(style.cssText).toBe('max-lines: none; block-ellipsis: no-ellipsis; continue: discard;')
    })
})
describe('list-style', () => {

    const longhands = shorthands.get('list-style')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.listStyle = 'outside none disc'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.listStyle).toBe('outside')
        expect(style.cssText).toBe('list-style: outside;')

        // Missing longhand values
        style.listStyle = 'outside'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.listStyle).toBe('outside')
        expect(style.cssText).toBe('list-style: outside;')

        // Ambiguous values
        style.listStyle = 'none'
        expect(style.listStylePosition).toBe('outside')
        expect(style.listStyleImage).toBe('none')
        expect(style.listStyleType).toBe('none')
        expect(style.listStyle).toBe('none')
        expect(style.cssText).toBe('list-style: none;')
        style.listStyle = 'outside inside'
        expect(style.listStylePosition).toBe('outside')
        expect(style.listStyleImage).toBe('none')
        expect(style.listStyleType).toBe('inside')
        expect(style.listStyle).toBe('outside inside')
        expect(style.cssText).toBe('list-style: outside inside;')
        style.listStyle = 'outside outside'
        expect(style.listStylePosition).toBe('outside')
        expect(style.listStyleImage).toBe('none')
        expect(style.listStyleType).toBe('outside')
        expect(style.listStyle).toBe('outside outside')
        expect(style.cssText).toBe('list-style: outside outside;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.listStyle).toBe('outside')
        expect(style.cssText).toBe('list-style: outside;')
    })
})
describe('margin', () => {

    const longhands = shorthands.get('margin')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.margin = '0 0 0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.margin).toBe('0px')
        expect(style.cssText).toBe('margin: 0px;')

        // Missing longhand values
        const values = ['0px', '1px', '2px']
        style.margin = '0px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('0px'))
        expect(style.margin).toBe('0px')
        expect(style.cssText).toBe('margin: 0px;')
        style.margin = '0px 1px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.margin).toBe('0px 1px')
        expect(style.cssText).toBe('margin: 0px 1px;')
        style.margin = '0px 1px 2px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.margin).toBe('0px 1px 2px')
        expect(style.cssText).toBe('margin: 0px 1px 2px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.margin).toBe('0px')
        expect(style.cssText).toBe('margin: 0px;')
    })
})
describe('margin-block, margin-inline', () => {

    const longhands = shorthands.get('margin-block')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.marginBlock = '0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.marginBlock).toBe('0px')
        expect(style.cssText).toBe('margin-block: 0px;')

        // Missing longhand values
        style.marginBlock = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.marginBlock).toBe('1px')
        expect(style.cssText).toBe('margin-block: 1px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.marginBlock).toBe('0px')
        expect(style.cssText).toBe('margin-block: 0px;')
    })
})
describe('marker', () => {

    const longhands = shorthands.get('marker')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        style.marker = 'none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.marker).toBe('none')
        expect(style.cssText).toBe('marker: none;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // All equal longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.marker).toBe('none')
        expect(style.cssText).toBe('marker: none;')

        // Not all equal longhand values
        style.markerStart = 'url("#start")'
        expect(style.marker).toBe('')
        expect(style.cssText).toBe('marker-start: url("#start"); marker-mid: none; marker-end: none;')
    })
})
describe('mask', () => {

    const subProperties = shorthands.get('mask')
    const [, resetOnly] = subProperties
    const longhands = subProperties.flat()

    test('shorthand expansion', () => {

        const style = createStyleBlock()
        const mask = 'none 0% 0% / auto repeat border-box border-box add match-source'

        // Initial longhand values
        style.mask = mask
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.mask).toBe('none')
        expect(style.cssText).toBe('mask: none;')

        // Missing longhand values
        style.mask = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.mask).toBe('none')
        expect(style.cssText).toBe('mask: none;')

        // no-clip
        style.mask = 'border-box no-clip'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'mask-clip' ? 'no-clip' : initial(longhand)))
        expect(style.mask).toBe('no-clip')
        expect(style.cssText).toBe('mask: no-clip;')

        // mask-position mask-size
        style.mask = '0% 0% / cover'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'mask-size' ? 'cover' : initial(longhand)))
        expect(style.mask).toBe('0% 0% / cover')
        expect(style.cssText).toBe('mask: 0% 0% / cover;')

        // mask-origin mask-clip
        style.mask = 'fill-box'
        longhands.forEach(longhand =>
            expect(style[longhand])
                .toBe((longhand === 'mask-origin' || longhand === 'mask-clip')
                    ? 'fill-box'
                    : initial(longhand)))
        expect(style.mask).toBe('fill-box')
        expect(style.cssText).toBe('mask: fill-box;')
        style.mask = 'fill-box fill-box'
        longhands.forEach(longhand =>
            expect(style[longhand])
                .toBe((longhand === 'mask-origin' || longhand === 'mask-clip')
                    ? 'fill-box'
                    : initial(longhand)))
        expect(style.mask).toBe('fill-box')
        expect(style.cssText).toBe('mask: fill-box;')

        // Coordinated value list
        style.mask = `${mask}, ${mask}`
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(resetOnly.includes(longhand)
                ? initial(longhand)
                : `${initial(longhand)}, ${initial(longhand)}`))
        expect(style.mask).toBe('none, none')
        expect(style.cssText).toBe('mask: none, none;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.mask).toBe('none')
        expect(style.cssText).toBe('mask: none;')

        // Different lengths of longhand values
        style.maskImage = 'none, none'
        expect(style.mask).toBe('')
        expect(style.cssText).toBe('mask-image: none, none; mask-position: 0% 0%; mask-size: auto; mask-repeat: repeat; mask-origin: border-box; mask-clip: border-box; mask-composite: add; mask-mode: match-source; mask-border: none;')
    })
})
describe('mask-border', () => {

    const longhands = shorthands.get('mask-border')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.maskBorder = 'none 0 / auto / 0 stretch alpha'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.maskBorder).toBe('none')
        expect(style.cssText).toBe('mask-border: none;')

        // Missing longhand values
        style.maskBorder = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.maskBorder).toBe('none')
        expect(style.cssText).toBe('mask-border: none;')
        style.maskBorder = '0 / 1'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'mask-border-width' ? '1' : initial(longhand)))
        expect(style.maskBorder).toBe('0 / 1')
        expect(style.cssText).toBe('mask-border: 0 / 1;')
        style.maskBorder = '0 / / 1'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'mask-border-outset' ? '1' : initial(longhand)))
        expect(style.maskBorder).toBe('0 / auto / 1')
        expect(style.cssText).toBe('mask-border: 0 / auto / 1;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.maskBorder).toBe('none')
        expect(style.cssText).toBe('mask-border: none;')
    })
})
describe('offset', () => {

    const longhands = shorthands.get('offset')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.offset = 'normal none 0 auto / auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.offset).toBe('normal')
        expect(style.cssText).toBe('offset: normal;')

        // Missing longhand values
        style.offset = 'normal'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.offset).toBe('normal')
        expect(style.cssText).toBe('offset: normal;')
        style.offset = 'circle()'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'offset-path' ? 'circle()' : initial(longhand)))
        expect(style.offset).toBe('circle()')
        expect(style.cssText).toBe('offset: circle();')
        style.offset = 'none 1px'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'offset-distance' ? '1px' : initial(longhand)))
        expect(style.offset).toBe('none 1px')
        expect(style.cssText).toBe('offset: none 1px;')
        style.offset = 'none reverse'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'offset-rotate' ? 'reverse' : initial(longhand)))
        expect(style.offset).toBe('none reverse')
        expect(style.cssText).toBe('offset: none reverse;')
        style.offset = 'normal / left'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'offset-anchor' ? 'left center' : initial(longhand)))
        expect(style.offset).toBe('normal / left center')
        expect(style.cssText).toBe('offset: normal / left center;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.offset).toBe('normal')
        expect(style.cssText).toBe('offset: normal;')
    })
})
describe('outline', () => {

    const longhands = shorthands.get('outline')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.outline = 'medium none auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.outline).toBe('medium')
        expect(style.cssText).toBe('outline: medium;')

        // Missing longhand values
        style.outline = 'medium'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.outline).toBe('medium')
        expect(style.cssText).toBe('outline: medium;')

        // Lone `auto` sets both `outline-style` and `outline-color`
        style.outline = 'auto'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'outline-width' ? initial(longhand) : 'auto'))
        expect(style.outline).toBe('auto')
        expect(style.cssText).toBe('outline: auto;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.outline).toBe('medium')
        expect(style.cssText).toBe('outline: medium;')
    })
})
describe('overflow', () => {

    const longhands = shorthands.get('overflow')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.overflow = 'visible visible'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overflow).toBe('visible')
        expect(style.cssText).toBe('overflow: visible;')

        // Missing longhand values
        style.overflow = 'hidden'
        longhands.forEach(longhand => expect(style[longhand]).toBe('hidden'))
        expect(style.overflow).toBe('hidden')
        expect(style.cssText).toBe('overflow: hidden;')

        // Legacy value alias
        style.overflow = 'overlay'
        longhands.forEach(longhand => expect(style[longhand]).toBe('auto'))
        expect(style.overflow).toBe('auto')
        expect(style.cssText).toBe('overflow: auto;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.overflow).toBe('visible')
        expect(style.cssText).toBe('overflow: visible;')
    })
})
describe('overflow-clip-margin, overflow-clip-margin-block, overflow-clip-margin-inline', () => {

    const longhands = shorthands.get('overflow-clip-margin')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.overflowClipMargin = '0px'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overflowClipMargin).toBe('0px')
        expect(style.cssText).toBe('overflow-clip-margin: 0px;')

        // Optional <length>
        style.overflowClipMargin = 'content-box 0px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('content-box'))
        expect(style.overflowClipMargin).toBe('content-box')
        expect(style.cssText).toBe('overflow-clip-margin: content-box;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // All equal longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.overflowClipMargin).toBe('0px')
        expect(style.cssText).toBe('overflow-clip-margin: 0px;')

        // Not all equal longhand values
        style.overflowClipMarginTop = '1px'
        expect(style.marker).toBe('')
        expect(style.cssText).toBe('overflow-clip-margin-top: 1px; overflow-clip-margin-right: 0px; overflow-clip-margin-bottom: 0px; overflow-clip-margin-left: 0px;')
    })
})
describe('overflow-clip-margin-block, overflow-clip-margin-inline', () => {

    const longhands = shorthands.get('overflow-clip-margin-block')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.overflowClipMarginBlock = '0px'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overflowClipMarginBlock).toBe('0px')
        expect(style.cssText).toBe('overflow-clip-margin-block: 0px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.overflowClipMarginBlock).toBe('0px')
        expect(style.cssText).toBe('overflow-clip-margin-block: 0px;')
    })
})
describe('overscroll-behavior', () => {

    const longhands = shorthands.get('overscroll-behavior')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.overscrollBehavior = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overscrollBehavior).toBe('auto')
        expect(style.cssText).toBe('overscroll-behavior: auto;')

        // Missing longhand values
        style.overscrollBehavior = 'contain'
        longhands.forEach(longhand => expect(style[longhand]).toBe('contain'))
        expect(style.overscrollBehavior).toBe('contain')
        expect(style.cssText).toBe('overscroll-behavior: contain;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.overscrollBehavior).toBe('auto')
        expect(style.cssText).toBe('overscroll-behavior: auto;')
    })
})
describe('padding', () => {

    const longhands = shorthands.get('padding')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.padding = '0 0 0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.padding).toBe('0px')
        expect(style.cssText).toBe('padding: 0px;')

        // Missing longhand values
        const values = ['0px', '1px', '2px']
        style.padding = '0px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('0px'))
        expect(style.padding).toBe('0px')
        expect(style.cssText).toBe('padding: 0px;')
        style.padding = '0px 1px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.padding).toBe('0px 1px')
        expect(style.cssText).toBe('padding: 0px 1px;')
        style.padding = '0px 1px 2px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.padding).toBe('0px 1px 2px')
        expect(style.cssText).toBe('padding: 0px 1px 2px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.padding).toBe('0px')
        expect(style.cssText).toBe('padding: 0px;')
    })
})
describe('padding-block, padding-inline', () => {

    const longhands = shorthands.get('padding-block')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.paddingBlock = '0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.paddingBlock).toBe('0px')
        expect(style.cssText).toBe('padding-block: 0px;')

        // Missing longhand values
        style.paddingBlock = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.paddingBlock).toBe('1px')
        expect(style.cssText).toBe('padding-block: 1px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.paddingBlock).toBe('0px')
        expect(style.cssText).toBe('padding-block: 0px;')
    })
})
describe('place-content', () => {

    const longhands = shorthands.get('place-content')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.placeContent = 'normal normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.placeContent).toBe('normal')
        expect(style.cssText).toBe('place-content: normal;')

        // Missing longhand values
        style.placeContent = 'stretch'
        longhands.forEach(longhand => expect(style[longhand]).toBe('stretch'))
        expect(style.placeContent).toBe('stretch')
        expect(style.cssText).toBe('place-content: stretch;')

        // <baseline-position>
        style.placeContent = 'baseline'
        expect(style.alignContent).toBe('baseline')
        expect(style.justifyContent).toBe('start')
        expect(style.placeContent).toBe('baseline')
        expect(style.cssText).toBe('place-content: baseline;')
        style.placeContent = 'baseline start'
        expect(style.alignContent).toBe('baseline')
        expect(style.justifyContent).toBe('start')
        expect(style.placeContent).toBe('baseline')
        expect(style.cssText).toBe('place-content: baseline;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.placeContent).toBe('normal')
        expect(style.cssText).toBe('place-content: normal;')
    })
})
describe('place-items', () => {

    const longhands = shorthands.get('place-items')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.placeItems = 'normal legacy'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.placeItems).toBe('normal legacy')
        expect(style.cssText).toBe('place-items: normal legacy;')

        // Missing longhand values
        style.placeItems = 'normal'
        longhands.forEach(longhand => expect(style[longhand]).toBe('normal'))
        expect(style.placeItems).toBe('normal')
        expect(style.cssText).toBe('place-items: normal;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.placeItems).toBe('normal legacy')
        expect(style.cssText).toBe('place-items: normal legacy;')
    })
})
describe('place-self', () => {

    const longhands = shorthands.get('place-self')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.placeSelf = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.placeSelf).toBe('auto')
        expect(style.cssText).toBe('place-self: auto;')

        // Missing longhand values
        style.placeSelf = 'normal'
        longhands.forEach(longhand => expect(style[longhand]).toBe('normal'))
        expect(style.placeSelf).toBe('normal')
        expect(style.cssText).toBe('place-self: normal;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.placeSelf).toBe('auto')
        expect(style.cssText).toBe('place-self: auto;')
    })
})
describe('pointer-timeline', () => {

    const longhands = shorthands.get('pointer-timeline')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()
        const timeline = 'none block'

        // Initial longhand values
        style.pointerTimeline = timeline
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.pointerTimeline).toBe('none')
        expect(style.cssText).toBe('pointer-timeline: none;')

        // Missing longhand values
        style.pointerTimeline = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.pointerTimeline).toBe('none')
        expect(style.cssText).toBe('pointer-timeline: none;')

        // Coordinated value list
        style.pointerTimeline = `${timeline}, ${timeline}`
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.pointerTimeline).toBe('none, none')
        expect(style.cssText).toBe('pointer-timeline: none, none;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.pointerTimeline).toBe('none')
        expect(style.cssText).toBe('pointer-timeline: none;')

        // Different lengths of longhand values
        style.pointerTimelineName = 'none, none'
        expect(style.pointerTimeline).toBe('')
        expect(style.cssText).toBe('pointer-timeline-name: none, none; pointer-timeline-axis: block;')
    })
})
describe('position-try', () => {

    const longhands = shorthands.get('position-try')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.positionTry = 'normal none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.positionTry).toBe('none')
        expect(style.cssText).toBe('position-try: none;')

        // Missing longhand values
        style.positionTry = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.positionTry).toBe('none')
        expect(style.cssText).toBe('position-try: none;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.positionTry).toBe('none')
        expect(style.cssText).toBe('position-try: none;')
    })
})
describe('scroll-margin', () => {

    const longhands = shorthands.get('scroll-margin')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.scrollMargin = '0 0 0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollMargin).toBe('0px')
        expect(style.cssText).toBe('scroll-margin: 0px;')

        // Missing longhand values
        const values = ['0px', '1px', '2px']
        style.scrollMargin = '0px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('0px'))
        expect(style.scrollMargin).toBe('0px')
        expect(style.cssText).toBe('scroll-margin: 0px;')
        style.scrollMargin = '0px 1px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.scrollMargin).toBe('0px 1px')
        expect(style.cssText).toBe('scroll-margin: 0px 1px;')
        style.scrollMargin = '0px 1px 2px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.scrollMargin).toBe('0px 1px 2px')
        expect(style.cssText).toBe('scroll-margin: 0px 1px 2px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.scrollMargin).toBe('0px')
        expect(style.cssText).toBe('scroll-margin: 0px;')
    })
})
describe('scroll-margin-block, scroll-margin-inline', () => {

    const longhands = shorthands.get('scroll-margin-block')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.scrollMarginBlock = '0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollMarginBlock).toBe('0px')
        expect(style.cssText).toBe('scroll-margin-block: 0px;')

        // Missing longhand values
        style.scrollMarginBlock = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.scrollMarginBlock).toBe('1px')
        expect(style.cssText).toBe('scroll-margin-block: 1px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.scrollMarginBlock).toBe('0px')
        expect(style.cssText).toBe('scroll-margin-block: 0px;')
    })
})
describe('scroll-padding', () => {

    const longhands = shorthands.get('scroll-padding')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.scrollPadding = 'auto auto auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollPadding).toBe('auto')
        expect(style.cssText).toBe('scroll-padding: auto;')

        // Missing longhand values
        const values = ['0px', '1px', '2px']
        style.scrollPadding = '0px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('0px'))
        expect(style.scrollPadding).toBe('0px')
        expect(style.cssText).toBe('scroll-padding: 0px;')
        style.scrollPadding = '0px 1px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.scrollPadding).toBe('0px 1px')
        expect(style.cssText).toBe('scroll-padding: 0px 1px;')
        style.scrollPadding = '0px 1px 2px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.scrollPadding).toBe('0px 1px 2px')
        expect(style.cssText).toBe('scroll-padding: 0px 1px 2px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.scrollPadding).toBe('auto')
        expect(style.cssText).toBe('scroll-padding: auto;')
    })
})
describe('scroll-padding-block, scroll-padding-inline', () => {

    const longhands = shorthands.get('scroll-padding-block')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.scrollPaddingBlock = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollPaddingBlock).toBe('auto')
        expect(style.cssText).toBe('scroll-padding-block: auto;')

        // Missing longhand values
        style.scrollPaddingBlock = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.scrollPaddingBlock).toBe('1px')
        expect(style.cssText).toBe('scroll-padding-block: 1px;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.scrollPaddingBlock).toBe('auto')
        expect(style.cssText).toBe('scroll-padding-block: auto;')
    })
})
describe('scroll-timeline', () => {

    const longhands = shorthands.get('scroll-timeline')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()
        const timeline = 'none block'

        // Initial longhand values
        style.scrollTimeline = timeline
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollTimeline).toBe('none')
        expect(style.cssText).toBe('scroll-timeline: none;')

        // Missing longhand values
        style.scrollTimeline = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollTimeline).toBe('none')
        expect(style.cssText).toBe('scroll-timeline: none;')

        // Coordinated value list
        style.scrollTimeline = `${timeline}, ${timeline}`
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.scrollTimeline).toBe('none, none')
        expect(style.cssText).toBe('scroll-timeline: none, none;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.scrollTimeline).toBe('none')
        expect(style.cssText).toBe('scroll-timeline: none;')

        // Different lengths of longhand values
        style.scrollTimelineName = 'none, none'
        expect(style.scrollTimeline).toBe('')
        expect(style.cssText).toBe('scroll-timeline-name: none, none; scroll-timeline-axis: block;')
    })
})
describe('text-align', () => {

    const longhands = shorthands.get('text-align')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values (not all longhands can be explicitly declared)
        style.textAlign = 'start'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textAlign).toBe('start')
        expect(style.cssText).toBe('text-align: start;')

        // match-parent
        style.textAlign = 'match-parent'
        longhands.forEach(longhand => expect(style[longhand]).toBe('match-parent'))
        expect(style.textAlign).toBe('match-parent')
        expect(style.cssText).toBe('text-align: match-parent;')

        // justify-all
        style.textAlign = 'justify-all'
        longhands.forEach(longhand => expect(style[longhand]).toBe('justify'))
        expect(style.textAlign).toBe('justify-all')
        expect(style.cssText).toBe('text-align: justify-all;')

        // <string>
        style.textAlign = '"1"'
        expect(style.textAlignAll).toBe('"1"')
        expect(style.textAlignLast).toBe('auto')
        expect(style.textAlign).toBe('"1"')
        expect(style.cssText).toBe('text-align: "1";')
        style.textAlign = '"12"'
        expect(style.textAlign).toBe('"1"')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.textAlign).toBe('start')
        expect(style.cssText).toBe('text-align: start;')
    })
})
describe('text-box', () => {

    const longhands = shorthands.get('text-box')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.textBox = 'none auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textBox).toBe('normal')
        expect(style.cssText).toBe('text-box: normal;')

        // Missing longhand values
        style.textBox = 'trim-both'
        expect(style.textBoxTrim).toBe('trim-both')
        expect(style.textBoxEdge).toBe('auto')
        expect(style.textBox).toBe('trim-both')
        expect(style.cssText).toBe('text-box: trim-both;')
        style.textBox = 'text'
        expect(style.textBoxTrim).toBe('trim-both')
        expect(style.textBoxEdge).toBe('text')
        expect(style.textBox).toBe('text')
        expect(style.cssText).toBe('text-box: text;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.textBox).toBe('normal')
        expect(style.cssText).toBe('text-box: normal;')

        // All longhands cannot be represented
        style.textBoxEdge = 'text'
        expect(style.textBox).toBe('')
        expect(style.cssText).toBe('text-box-trim: none; text-box-edge: text;')
    })
})
describe('text-emphasis', () => {

    const longhands = shorthands.get('text-emphasis')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.textEmphasis = 'none currentcolor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textEmphasis).toBe('none')
        expect(style.cssText).toBe('text-emphasis: none;')

        // Missing longhand values
        style.textEmphasis = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textEmphasis).toBe('none')
        expect(style.cssText).toBe('text-emphasis: none;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.textEmphasis).toBe('none')
        expect(style.cssText).toBe('text-emphasis: none;')
    })
})
describe('text-decoration', () => {

    const longhands = shorthands.get('text-decoration')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.textDecoration = 'none auto solid currentcolor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textDecoration).toBe('none')
        expect(style.cssText).toBe('text-decoration: none;')

        // Missing longhand values
        style.textDecoration = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textDecoration).toBe('none')
        expect(style.cssText).toBe('text-decoration: none;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.textDecoration).toBe('none')
        expect(style.cssText).toBe('text-decoration: none;')
    })
})
describe('text-decoration-skip', () => {
    it.todo('parses longhand declarations from a shorthand value')
    it.todo('serializes a shorthand value from the declarations for its longhands')
})
describe('text-spacing', () => {

    const longhands = shorthands.get('text-spacing')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values (not all longhands can be explicitly declared)
        style.textSpacing = 'normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textSpacing).toBe('normal')
        expect(style.cssText).toBe('text-spacing: normal;')

        // none
        style.textSpacing = 'none'
        expect(style.textAutospace).toBe('no-autospace')
        expect(style.textSpacingTrim).toBe('space-all')
        expect(style.textSpacing).toBe('none')
        expect(style.cssText).toBe('text-spacing: none;')

        // auto
        style.textSpacing = 'auto'
        expect(style.textAutospace).toBe('auto')
        expect(style.textSpacingTrim).toBe('auto')
        expect(style.textSpacing).toBe('auto')
        expect(style.cssText).toBe('text-spacing: auto;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.textSpacing).toBe('normal')
        expect(style.cssText).toBe('text-spacing: normal;')
    })
})
describe('text-wrap', () => {

    const longhands = shorthands.get('text-wrap')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.textWrap = 'wrap auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textWrap).toBe('wrap')
        expect(style.cssText).toBe('text-wrap: wrap;')

        // Missing longhand values
        style.textWrap = 'wrap'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textWrap).toBe('wrap')
        expect(style.cssText).toBe('text-wrap: wrap;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.textWrap).toBe('wrap')
        expect(style.cssText).toBe('text-wrap: wrap;')
    })
})
describe('transition', () => {

    const longhands = shorthands.get('transition')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()
        const transition = '0s ease 0s all'

        // Initial longhand values
        style.transition = transition
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.transition).toBe('0s')
        expect(style.cssText).toBe('transition: 0s;')

        // Missing longhand values
        style.transition = '0s'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.transition).toBe('0s')
        expect(style.cssText).toBe('transition: 0s;')

        // Coordinated value list
        style.transition = `${transition}, ${transition}`
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.transition).toBe('0s, 0s')
        expect(style.cssText).toBe('transition: 0s, 0s;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.transition).toBe('0s')
        expect(style.cssText).toBe('transition: 0s;')

        // Different lengths of longhand values
        style.transitionProperty = 'none, none'
        expect(style.transition).toBe('')
        expect(style.cssText).toBe('transition-duration: 0s; transition-timing-function: ease; transition-delay: 0s; transition-behavior: normal; transition-property: none, none;')
    })
})
describe('vertical-align', () => {

    const longhands = shorthands.get('vertical-align')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Invalid alignment-baseline value aliases
        style.verticalAlign = 'text-before-edge'
        style.verticalAlign = 'text-after-edge'
        expect(style).toHaveLength(0)

        // Initial longhand values (not all longhands can be explicitly declared)
        style.verticalAlign = 'baseline 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.verticalAlign).toBe('baseline')
        expect(style.cssText).toBe('vertical-align: baseline;')

        // Missing longhand values
        style.verticalAlign = 'baseline'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.verticalAlign).toBe('baseline')
        expect(style.cssText).toBe('vertical-align: baseline;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.verticalAlign).toBe('baseline')
        expect(style.cssText).toBe('vertical-align: baseline;')
    })
})
describe('view-timeline', () => {

    const longhands = shorthands.get('view-timeline')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()
        const timeline = 'none block auto'

        // Initial longhand values
        style.viewTimeline = timeline
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.viewTimeline).toBe('none')
        expect(style.cssText).toBe('view-timeline: none;')

        // Missing longhand values
        style.viewTimeline = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.viewTimeline).toBe('none')
        expect(style.cssText).toBe('view-timeline: none;')

        // Coordinated value list
        style.viewTimeline = `${timeline}, ${timeline}`
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.viewTimeline).toBe('none, none')
        expect(style.cssText).toBe('view-timeline: none, none;')
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.viewTimeline).toBe('none')
        expect(style.cssText).toBe('view-timeline: none;')

        // Different lengths of longhand values
        style.viewTimelineName = 'none, none'
        expect(style.viewTimeline).toBe('')
        expect(style.cssText).toBe('view-timeline-name: none, none; view-timeline-axis: block; view-timeline-inset: auto;')
    })
})
describe('white-space', () => {

    const longhands = shorthands.get('white-space')[0]

    test('shorthand expansion', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.whiteSpace = 'collapse wrap none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.whiteSpace).toBe('normal')
        expect(style.cssText).toBe('white-space: normal;')

        // Missing longhand values
        style.whiteSpace = 'collapse'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.whiteSpace).toBe('normal')
        expect(style.cssText).toBe('white-space: normal;')

        // normal, pre, pre-line, pre-wrap
        whiteSpace.mapping.forEach((mapping, keyword) => {
            style.whiteSpace = keyword
            longhands.forEach((longhand, index) => expect(style[longhand]).toBe(mapping[index].value))
            expect(style.whiteSpace).toBe(keyword)
            expect(style.cssText).toBe(`white-space: ${keyword};`)
        })
    })
    test('shorthand reification', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.whiteSpace).toBe('normal')
        expect(style.cssText).toBe('white-space: normal;')
    })
})

describe('CSSFontFaceDescriptors', () => {
    test('invalid', () => {

        const style = CSSFontFaceDescriptors.create(globalThis, undefined, { parentRule: fontFaceRule })

        // Custom property
        style.setProperty('--custom', 'red')
        expect(style.getPropertyValue('--custom')).toBe('')

        // Invalid name
        style.setProperty('font-size-adjust', 'none')
        expect(style.getPropertyValue('font-size-adjust')).toBe('')
        expect(style.fontSizeAdjust).toBeUndefined()

        // Priority
        style.setProperty('font-weight', '1', 'important')
        expect(style.fontWeight).toBe('')
        style.setProperty('size-adjust', '1px', 'important')
        expect(style.sizeAdjust).toBe('')

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
            expect(style.fontWeight).toBe('')
            expect(style.sizeAdjust).toBe('')
        })
    })
    test('valid', () => {

        const style = CSSFontFaceDescriptors.create(globalThis, undefined, { parentRule: fontFaceRule })

        // Alias
        expect(style.fontStretch).toBe(style.fontWidth)
        style.fontStretch = 'condensed'
        expect(style.fontStretch).toBe('condensed')
        expect(style.fontWidth).toBe('condensed')

        // Dependency-free substitution
        style.fontWeight = 'env(name, attr(name))'
        style.sizeAdjust = 'env(name, attr(name))'
        expect(style.fontWeight).toBe('env(name, attr(name))')
        expect(style.sizeAdjust).toBe('env(name, attr(name))')
        style.fontWeight = 'if(media(width): 1)'
        style.sizeAdjust = 'if(media(width): 1%)'
        expect(style.fontWeight).toBe('if(media(width): 1)')
        expect(style.sizeAdjust).toBe('if(media(width): 1%)')
        style.fontWeight = 'first-valid(1)'
        style.sizeAdjust = 'first-valid(1%)'
        expect(style.fontWeight).toBe('1')
        expect(style.sizeAdjust).toBe('1%')
        style.fontWeight = 'calc(progress(1, 0, 1))'
        style.sizeAdjust = 'calc(1% * progress(1, 0, 1))'
        expect(style.fontWeight).toBe('calc(1)')
        expect(style.sizeAdjust).toBe('calc(1%)')

        // Specific serialization rule
        style.ascentOverride = '1% 1%'
        expect(style.ascentOverride).toBe('1%')
        style.descentOverride = '1% 1%'
        expect(style.descentOverride).toBe('1%')
        style.fontSize = '1 1'
        expect(style.fontSize).toBe('1')
        style.fontWidth = 'normal normal'
        expect(style.fontWidth).toBe('normal')
        style.fontStyle = 'oblique 0deg'
        expect(style.fontStyle).toBe('normal')
        style.fontStyle = 'oblique 1deg 1deg'
        expect(style.fontStyle).toBe('oblique 1deg')
        style.fontWeight = 'normal normal'
        expect(style.fontWeight).toBe('normal')
        style.lineGapOverride = '1% 1%'
        expect(style.lineGapOverride).toBe('1%')
        style.subscriptPositionOverride = '1% 1%'
        expect(style.subscriptPositionOverride).toBe('1%')
        style.subscriptSizeOverride = '1% 1%'
        expect(style.subscriptSizeOverride).toBe('1%')
        style.subscriptPositionOverride = '1% 1%'
        expect(style.subscriptPositionOverride).toBe('1%')
    })
})
describe('CSSFunctionDescriptors', () => {
    test('invalid', () => {

        const style = CSSFunctionDescriptors.create(globalThis, undefined, { parentRule: functionRule })

        // Invalid name
        style.setProperty('color', 'red')
        expect(style.getPropertyValue('color')).toBe('')
        expect(style.color).toBeUndefined()

        // Priority
        style.setProperty('result', '1', 'important')
        expect(style.result).toBe('')
    })
})
describe('CSSKeyframeProperties', () => {
    test('invalid', () => {

        const style = CSSKeyframeProperties.create(globalThis, undefined, { parentRule: keyframeRule })

        // Invalid name
        style.setProperty('animation-delay', '1s')
        expect(style.getPropertyValue('animation-delay')).toBe('')
        expect(style.animationDelay).toBeUndefined()

        // Priority
        style.setProperty('font-weight', '1', 'important')
        expect(style.fontWeight).toBe('')
    })
    test('valid', () => {

        const style = CSSKeyframeProperties.create(globalThis, undefined, { parentRule: keyframeRule })

        // Custom property
        style.setProperty('--custom', 'green')
        expect(style.getPropertyValue('--custom')).toBe('green')

        // Dependency-free substitution
        style.fontWeight = 'env(name)'
        expect(style.fontWeight).toBe('env(name)')
        style.fontWeight = 'if(media(width): 1)'
        expect(style.fontWeight).toBe('if(media(width): 1)')
        style.fontWeight = 'first-valid(1)'
        expect(style.fontWeight).toBe('1')
        style.fontWeight = 'calc(progress(1, 0, 1))'
        expect(style.fontWeight).toBe('calc(1)')

        // Cascade or element-dependent value
        style.fontWeight = 'initial'
        expect(style.fontWeight).toBe('initial')
        style.fontWeight = 'inherit(--custom)'
        expect(style.fontWeight).toBe('inherit(--custom)')
        style.fontWeight = 'var(--custom)'
        expect(style.fontWeight).toBe('var(--custom)')

        // Element-dependent value
        style.fontWeight = '--custom()'
        expect(style.fontWeight).toBe('--custom()')
        style.fontWeight = 'attr(name)'
        expect(style.fontWeight).toBe('attr(name)')
        style.fontWeight = 'random-item(--key, 1)'
        expect(style.fontWeight).toBe('random-item(--key, 1)')
        style.fontWeight = 'interpolate(0, 0: 1)'
        expect(style.fontWeight).toBe('interpolate(0, 0: 1)')
        style.fontWeight = 'toggle(1)'
        expect(style.fontWeight).toBe('toggle(1)')
        style.fontWeight = 'calc-interpolate(0, 0: 1)'
        expect(style.fontWeight).toBe('calc-interpolate(0, 0: 1)')
        style.fontWeight = 'random(1, 1)'
        expect(style.fontWeight).toBe('random(1, 1)')
        style.fontWeight = 'sibling-count()'
        expect(style.fontWeight).toBe('sibling-count()')
        style.color = 'color-interpolate(0, 0: green)'
        expect(style.color).toBe('color-interpolate(0, 0: green)')
    })
})
describe('CSSMarginDescriptors', () => {
    test('invalid', () => {

        const style = CSSMarginDescriptors.create(globalThis, undefined, { parentRule: marginRule })

        // Invalid name
        style.setProperty('top', '1px')
        expect(style.getPropertyValue('top')).toBe('')
        expect(style.top).toBeUndefined()
    })
    test('valid', () => {

        const style = CSSMarginDescriptors.create(globalThis, undefined, { parentRule: marginRule })

        // Custom property
        style.setProperty('--custom', 'green')
        expect(style.getPropertyValue('--custom')).toBe('green')

        // Priority
        style.setProperty('font-weight', '1', 'important')
        expect(style.fontWeight).toBe('1')
        expect(style.getPropertyPriority('font-weight')).toBe('important')

        // Dependency-free substitution
        style.fontWeight = 'env(name)'
        expect(style.fontWeight).toBe('env(name)')
        style.fontWeight = 'if(media(width): 1)'
        expect(style.fontWeight).toBe('if(media(width): 1)')
        style.fontWeight = 'first-valid(1)'
        expect(style.fontWeight).toBe('1')
        style.fontWeight = 'calc(progress(1, 0, 1))'
        expect(style.fontWeight).toBe('calc(1)')

        // Cascade or element-dependent value
        style.fontWeight = 'initial'
        expect(style.fontWeight).toBe('initial')
        style.fontWeight = 'inherit(--custom)'
        expect(style.fontWeight).toBe('inherit(--custom)')
        style.fontWeight = 'var(--custom)'
        expect(style.fontWeight).toBe('var(--custom)')

        // Element-dependent value
        style.fontWeight = '--custom()'
        expect(style.fontWeight).toBe('--custom()')
        style.fontWeight = 'attr(name)'
        expect(style.fontWeight).toBe('attr(name)')
        style.fontWeight = 'random-item(--key, 1)'
        expect(style.fontWeight).toBe('random-item(--key, 1)')
        style.fontWeight = 'interpolate(0, 0: 1)'
        expect(style.fontWeight).toBe('interpolate(0, 0: 1)')
        style.fontWeight = 'toggle(1)'
        expect(style.fontWeight).toBe('toggle(1)')
        style.fontWeight = 'calc-interpolate(0, 0: 1)'
        expect(style.fontWeight).toBe('calc-interpolate(0, 0: 1)')
        style.fontWeight = 'random(1, 1)'
        expect(style.fontWeight).toBe('random(1, 1)')
        style.fontWeight = 'sibling-count()'
        expect(style.fontWeight).toBe('sibling-count()')
        style.color = 'color-interpolate(0, 0: red)'
        expect(style.color).toBe('color-interpolate(0, 0: red)')
    })
})
describe('CSSPageDescriptors', () => {
    test('invalid', () => {

        const style = CSSPageDescriptors.create(globalThis, undefined, { parentRule: pageRule })

        // Invalid name
        style.setProperty('top', '1px')
        expect(style.getPropertyValue('top')).toBe('')
        expect(style.top).toBeUndefined()
    })
    test('valid', () => {

        const style = CSSPageDescriptors.create(globalThis, undefined, { parentRule: pageRule })

        // Custom property
        style.setProperty('--custom', 'green')
        expect(style.getPropertyValue('--custom')).toBe('green')

        // Priority
        style.setProperty('size', '1px', 'important')
        expect(style.size).toBe('1px')
        expect(style.getPropertyPriority('size')).toBe('important')

        // Dependency-free substitution
        style.fontWeight = 'env(name, attr(name))'
        style.size = 'env(name, attr(name))'
        expect(style.fontWeight).toBe('env(name, attr(name))')
        expect(style.size).toBe('env(name, attr(name))')
        style.fontWeight = 'if(media(width): 1)'
        style.size = 'if(media(width): 1px)'
        expect(style.fontWeight).toBe('if(media(width): 1)')
        expect(style.size).toBe('if(media(width): 1px)')
        style.fontWeight = 'first-valid(1)'
        style.size = 'first-valid(1px)'
        expect(style.fontWeight).toBe('1')
        expect(style.size).toBe('1px')
        style.fontWeight = 'calc(progress(1, 0, 1))'
        style.size = 'calc(1px * progress(1, 0, 1))'
        expect(style.fontWeight).toBe('calc(1)')
        expect(style.size).toBe('calc(1px)')

        // Cascade or element-dependent value
        style.fontWeight = 'initial'
        style.size = 'initial'
        expect(style.fontWeight).toBe('initial')
        expect(style.size).toBe('initial')
        style.fontWeight = 'inherit(--custom)'
        style.size = 'inherit(--custom)'
        expect(style.fontWeight).toBe('inherit(--custom)')
        expect(style.size).toBe('inherit(--custom)')
        style.fontWeight = 'var(--custom)'
        style.size = 'var(--custom)'
        expect(style.fontWeight).toBe('var(--custom)')
        expect(style.size).toBe('var(--custom)')

        // Element-dependent value
        style.fontWeight = '--custom()'
        style.size = '--custom()'
        expect(style.fontWeight).toBe('--custom()')
        expect(style.size).toBe('--custom()')
        style.fontWeight = 'attr(name)'
        style.size = 'attr(name)'
        expect(style.fontWeight).toBe('attr(name)')
        expect(style.size).toBe('attr(name)')
        style.fontWeight = 'random-item(--key, 1)'
        style.size = 'random-item(--key, 1px)'
        expect(style.fontWeight).toBe('random-item(--key, 1)')
        expect(style.size).toBe('random-item(--key, 1px)')
        style.fontWeight = 'interpolate(0, 0: 1)'
        style.size = 'interpolate(0, 0: 1px)'
        expect(style.fontWeight).toBe('interpolate(0, 0: 1)')
        expect(style.size).toBe('interpolate(0, 0: 1px)')
        style.fontWeight = 'toggle(1)'
        style.size = 'toggle(1px)'
        expect(style.fontWeight).toBe('toggle(1)')
        expect(style.size).toBe('toggle(1px)')
        style.fontWeight = 'calc-interpolate(0, 0: 1)'
        style.size = 'calc-interpolate(0, 0: 1px)'
        expect(style.fontWeight).toBe('calc-interpolate(0, 0: 1)')
        expect(style.size).toBe('calc-interpolate(0, 0: 1px)')
        style.fontWeight = 'random(1, 1)'
        style.size = 'random(1px, 1px)'
        expect(style.fontWeight).toBe('random(1, 1)')
        expect(style.size).toBe('random(1px, 1px)')
        style.fontWeight = 'sibling-count()'
        style.size = 'calc(1px * sibling-count())'
        expect(style.fontWeight).toBe('sibling-count()')
        expect(style.size).toBe('calc(1px * sibling-count())')
        style.color = 'color-interpolate(0, 0: red)'
        expect(style.color).toBe('color-interpolate(0, 0: red)')

        // Specific serialization rule
        style.size = '1px 1px'
        expect(style.size).toBe('1px')
    })
})
describe('CSSPositionTryDescriptors', () => {
    test('invalid', () => {

        const style = CSSPositionTryDescriptors.create(globalThis, undefined, { parentRule: positionTryRule })

        // Custom property
        style.setProperty('--custom', 'red')
        expect(style.getPropertyValue('--custom')).toBe('')

        // Invalid name
        style.setProperty('font-weight', '1')
        expect(style.getPropertyValue('font-weight')).toBe('')
        expect(style.fontWeight).toBeUndefined()

        // Priority
        style.setProperty('top', '1px', 'important')
        expect(style.top).toBe('')
    })
    test('valid', () => {

        const style = CSSPositionTryDescriptors.create(globalThis, undefined, { parentRule: positionTryRule })

        // Dependency-free substitution
        style.top = 'env(name)'
        expect(style.top).toBe('env(name)')
        style.top = 'if(media(width): 1px)'
        expect(style.top).toBe('if(media(width): 1px)')
        style.top = 'first-valid(1px)'
        expect(style.top).toBe('1px')
        style.top = 'calc(1px * progress(1, 0, 1))'
        expect(style.top).toBe('calc(1px)')

        // Cascade or element-dependent value
        style.top = 'initial'
        expect(style.top).toBe('initial')
        style.top = 'inherit(--custom)'
        expect(style.top).toBe('inherit(--custom)')
        style.top = 'var(--custom)'
        expect(style.top).toBe('var(--custom)')

        // Element-dependent value
        style.top = '--custom()'
        expect(style.top).toBe('--custom()')
        style.top = 'attr(name)'
        expect(style.top).toBe('attr(name)')
        style.top = 'random-item(--key, 1px)'
        expect(style.top).toBe('random-item(--key, 1px)')
        style.top = 'interpolate(0, 0: 1px)'
        expect(style.top).toBe('interpolate(0, 0: 1px)')
        style.top = 'toggle(1px)'
        expect(style.top).toBe('toggle(1px)')
        style.top = 'calc-interpolate(0, 0: 1px)'
        expect(style.top).toBe('calc-interpolate(0, 0: 1px)')
        style.top = 'random(1px, 1px)'
        expect(style.top).toBe('random(1px, 1px)')
        style.top = 'calc(1px * sibling-count())'
        expect(style.top).toBe('calc(1px * sibling-count())')
    })
})
