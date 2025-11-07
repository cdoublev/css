
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
        invalid.forEach(input => style.color = input)
        expect(style).toHaveLength(0)
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
        invalid.forEach(([substitution, property]) => style[property] = substitution)
        expect(style).toHaveLength(0)
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
        invalid.forEach(input => style.setProperty('--custom', input))
        expect(style).toHaveLength(0)
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
describe('animation-range-start, animation-range-end, timeline-trigger-exit-range-end, timeline-trigger-exit-range-start, timeline-trigger-range-end, timeline-trigger-range-start', () => {
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
            style.cssText = `background-position: ${input}`
            expect(style.backgroundPosition).toBe(expected)
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
            style.cssText = `border-image-outset: ${input}`
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
            style.cssText = `border-image-slice: ${input}`
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
            style.cssText = `border-image-width: ${input}`
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
        style.pageBreakAfter = 'recto'
        expect(style).toHaveLength(0)
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
        style.pageBreakInside = 'avoid-page'
        expect(style).toHaveLength(0)
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
        style.colorScheme = 'only only'
        expect(style).toHaveLength(0)
    })
})
describe('counter-increment, counter-set, counter-reset', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.counterIncrement = 'counter 0'
        expect(style.counterIncrement).toBe('counter 0')
        style.counterIncrement = 'counter 1'
        expect(style.counterIncrement).toBe('counter')
        style.counterSet = 'counter 0'
        expect(style.counterSet).toBe('counter')
        style.counterSet = 'counter 1'
        expect(style.counterSet).toBe('counter 1')
        style.counterReset = 'counter 0'
        expect(style.counterReset).toBe('counter')
        style.counterReset = 'counter 1'
        expect(style.counterReset).toBe('counter 1')
        style.counterReset = 'reversed(counter) 0'
        expect(style.counterReset).toBe('reversed(counter) 0')
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
        expect(style).toHaveLength(0)
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
        style.flowInto = 'none element'
        expect(style).toHaveLength(0)
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
        invalid.forEach(input => style.glyphOrientationVertical = input)
        expect(style).toHaveLength(0)
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
        invalid.forEach(input => style.gridTemplateAreas = input)
        expect(style).toHaveLength(0)
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
            style.cssText = `grid-template-rows: ${input}`
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
describe('image-orientation', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.imageOrientation = '0deg flip'
        expect(style.imageOrientation).toBe('flip')
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
            style.cssText = `offset-path: ${input}`
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
            style.cssText = `offset-rotate: ${input}`
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
            ['markers stroke fill'],
        ]
        valid.forEach(([input, expected = input]) => {
            style.cssText = `paint-order: ${input}`
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
        style.src = '{]}, local("serif")'
        style.src = 'local("serif"), {]}'
        expect(style).toHaveLength(0)
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
            expect(style.src).toBe('local("serif")')
        })
    })
})
describe('text-align-all', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.textAlignAll = '"12"'
        expect(style).toHaveLength(0)
    })
})
describe('text-autospace', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.textAutospace = 'ideograph-alpha ideograph-numeric'
        expect(style.textAutospace).toBe('normal')
    })
})
describe('text-decoration-skip-self', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.textDecorationSkipSelf = 'skip-underline skip-overline skip-line-through'
        expect(style.textDecorationSkipSelf).toBe('skip-all')
    })
})
describe('text-decoration-trim', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.textDecorationTrim = '1px 1px'
        expect(style.textDecorationTrim).toBe('1px')
    })
})
describe('text-emphasis-position', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.textEmphasisPosition = 'over right'
        expect(style.textEmphasisPosition).toBe('over')
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
describe('view-timeline-inset', () => {
    test('valid', () => {
        const style = createStyleBlock()
        style.viewTimelineInset = 'auto auto'
        expect(style.viewTimelineInset).toBe('auto')
    })
})
describe('view-transition-class', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.viewTransitionClass = 'class NONE'
        expect(style).toHaveLength(0)
    })
})
describe('view-transition-name', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.viewTransitionName = 'AUTO'
        style.viewTransitionName = 'match-element'
        expect(style).toHaveLength(0)
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
            expect(style.voicePitch).toBe('x-low')
        })
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
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('-webkit-line-clamp')[0]

        // none
        style.webkitLineClamp = 'none'
        expect(style).toHaveLength(longhands.length)
        expect(style.maxLines).toBe('none')
        expect(style.blockEllipsis).toBe('auto')
        expect(style.continue).toBe('auto')
        expect(style.webkitLineClamp).toBe('none')
        expect(style.cssText).toBe('-webkit-line-clamp: none;')

        // <integer>
        style.webkitLineClamp = '1'
        expect(style.maxLines).toBe('1')
        expect(style.blockEllipsis).toBe('auto')
        expect(style.continue).toBe('-webkit-legacy')
        expect(style.webkitLineClamp).toBe('1')
        expect(style.cssText).toBe('line-clamp: 1 -webkit-legacy;')

        // All longhands cannot be represented
        style.continue = initial('continue')
        expect(style.webkitLineClamp).toBe('')
        expect(style.cssText).toBe('max-lines: 1; block-ellipsis: auto; continue: auto;')
        style.blockEllipsis = initial('block-ellipsis')
        style.continue = '-webkit-legacy'
        expect(style.webkitLineClamp).toBe('')
        expect(style.cssText).toBe('line-clamp: 1 no-ellipsis -webkit-legacy;')
        style.maxLines = initial('max-lines')
        style.blockEllipsis = 'auto'
        expect(style.webkitLineClamp).toBe('')
        expect(style.cssText).toBe('line-clamp: auto -webkit-legacy;')
        style.blockEllipsis = initial('block-ellipsis')
        style.continue = initial('continue')
        expect(style.webkitLineClamp).toBe('')
        expect(style.cssText).toBe('line-clamp: none;')
    })
})
describe('-webkit-text-stroke', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('-webkit-text-stroke')[0]

        // Initial longhand values
        style.webkitTextStroke = '0 currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.webkitTextStroke).toBe('0px')

        // Omitted values
        style.webkitTextStroke = '0px'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.webkitTextStroke).toBe('0px')
        style.webkitTextStroke = 'green'
        expect(style.webkitTextStrokeWidth).toBe(initial('-webkit-text-stroke-width'))
        expect(style.webkitTextStrokeColor).toBe('green')
        expect(style.webkitTextStroke).toBe('green')
    })
})
describe('all', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('all')[0]

        style.all = 'initial'

        // All equal longhand values
        expect(style).toHaveLength(longhands.length)
        expect(style[longhands[0]]).toBe('initial')
        expect(style.all).toBe('initial')
        expect(style.cssText).toBe('all: initial;')
        expect(style.direction).toBe('')
        expect(style.unicodeBidi).toBe('')

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
        expect(style.all).toBe('')
        expect(style.cssText).toBe(`${[...initial].map(name => `${name}: initial`).join('; ')}; ${head}: inherit;`)
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
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.animation).toBe(animation)

        // Omitted values
        style.animation = 'auto'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.animation).toBe(animation)
        style.animation = 'linear'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'animation-timing-function' ? 'linear' : initial(longhand)))
        expect(style.animation).toBe(animation.replace('ease', 'linear'))

        // All longhands cannot be represented
        style.animationName = 'none, none'
        expect(style.animation).toBe('')
        expect(style.cssText).toBe('animation-duration: auto; animation-timing-function: linear; animation-delay: 0s; animation-iteration-count: 1; animation-direction: normal; animation-fill-mode: none; animation-play-state: running; animation-name: none, none; animation-timeline: auto; animation-composition: replace; animation-range: normal; animation-trigger: none;')

        // Coordinated value list
        style.animation = `${animation}, ${animation}`
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(resetOnly.includes(longhand)
                ? initial(longhand)
                : `${initial(longhand)}, ${initial(longhand)}`))
        expect(style.animation).toBe(`${animation}, ${animation}`)
    })
})
describe('animation-range', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('animation-range')[0]

        // Initial longhand values
        style.animationRange = 'normal normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.animationRange).toBe('normal')

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
            expect(style.animationRangeStart).toBe(start)
            expect(style.animationRangeEnd).toBe(end)
            expect(style.animationRange).toBe(expected)
        })

        // All longhands cannot be represented
        style.animationRangeStart = 'normal, normal'
        expect(style.animationRange).toBe('')
        expect(style.cssText).toBe('animation-range-start: normal, normal; animation-range-end: normal;')

        // Coordinated value list
        style.animationRange = 'normal, normal'
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.animationRange).toBe('normal, normal')
    })
})
describe('background', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const subProperties = shorthands.get('background')
        const longhands = subProperties.flat()
        const [, resetOnly] = subProperties
        const background = 'none 0% 0% / auto repeat repeat scroll padding-box border-box transparent'

        // Initial longhand values + important
        style.cssText = `background: ${background} !important`
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => {
            expect(style[longhand]).toBe(initial(longhand))
            expect(style.getPropertyPriority(longhand)).toBe('important')
        })
        expect(style.background).toBe('none')
        expect(style.getPropertyPriority('background')).toBe('important')
        expect(style.cssText).toBe('background: none !important;')

        // Empty string
        style.background = ''
        longhands.forEach(longhand => expect(style[longhand]).toBe(''))
        expect(style.background).toBe('')

        // CSS-wide keyword
        style.background = 'initial'
        longhands.forEach(longhand => expect(style[longhand]).toBe('initial'))
        expect(style.background).toBe('initial')

        // Pending substitution
        style.background = 'var(--custom)'
        longhands.forEach(longhand => expect(style[longhand]).toBe(''))
        expect(style.background).toBe('var(--custom)')
        style.background = 'toggle(none)'
        longhands.forEach(longhand => expect(style[longhand]).toBe(''))
        expect(style.background).toBe('toggle(none)')

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
            longhands.forEach(longhand => expect(style[longhand]).toBe(declared[longhand] ?? initial(longhand)))
            expect(style.background).toBe(input)
        })

        // All longhands cannot be represented
        style.backgroundImage = 'none, none'
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-image: none, none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-area; background-color: transparent; background-blend-mode: normal;')
        style.backgroundImage = 'initial'
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-image: initial; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-area; background-color: transparent; background-blend-mode: normal;')
        style.setProperty('background-image', 'none', 'important')
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-image: none !important; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-area; background-color: transparent; background-blend-mode: normal;')
        style.background = 'var(--custom)'
        style.backgroundImage = 'var(--custom)'
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-image: var(--custom); background-position: ; background-size: ; background-repeat-x: ; background-repeat-y: ; background-attachment: ; background-origin: ; background-clip: ; background-color: ; background-blend-mode: ;')
        style.background = 'toggle(initial)'
        style.backgroundImage = 'toggle(initial)'
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-image: toggle(initial); background-position: ; background-size: ; background-repeat-x: ; background-repeat-y: ; background-attachment: ; background-origin: ; background-clip: ; background-color: ; background-blend-mode: ;')

        // Coordinated value list
        style.background = `${background.replace(' transparent', '')}, ${background}`
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(
                (longhand === 'background-color' || resetOnly.includes(longhand))
                    ? initial(longhand)
                    : `${initial(longhand)}, ${initial(longhand)}`))
        expect(style.background).toBe('none, none')
    })
})
describe('background-repeat', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('background-repeat')[0]

        // Initial longhand values
        style.backgroundRepeat = 'repeat repeat'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.backgroundRepeat).toBe('repeat')

        // Omitted values
        const values = [
            ['no-repeat'],
            ['repeat space', 'repeat', 'space'],
            ['repeat-x', 'repeat', 'no-repeat'],
            ['repeat-y', 'no-repeat', 'repeat'],
        ]
        values.forEach(([input, x = input, y = x]) => {
            style.backgroundRepeat = input
            expect(style.backgroundRepeatX).toBe(x)
            expect(style.backgroundRepeatY).toBe(y)
            expect(style.backgroundRepeat).toBe(input)
        })
    })
})
describe('block-step', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('block-step')[0]

        // Initial longhand values
        style.blockStep = 'none margin-box auto up'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.blockStep).toBe('none')

        // Omitted values
        style.blockStep = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.blockStep).toBe('none')
        style.blockStep = 'padding-box'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'block-step-insert' ? 'padding-box' : initial(longhand)))
        expect(style.blockStep).toBe('padding-box')
    })
})
describe('border', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border').flat()

        // Initial longhand values
        style.border = 'medium none currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.border).toBe('medium')

        // Omitted values
        style.border = 'medium'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.border).toBe('medium')
        style.border = 'solid'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand.endsWith('style') ? 'solid' : initial(longhand)))
        expect(style.border).toBe('solid')

        // All longhands cannot be represented
        style.borderImageWidth = '1px'
        expect(style.border).toBe('')
        expect(style.cssText).toBe('border-width: medium; border-style: solid; border-color: currentcolor; border-image: 100% / 1px;')

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
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-block')[0]

        // Initial longhand values
        style.borderBlock = 'medium none currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlock).toBe('medium')

        // Omitted values
        style.borderBlock = 'medium'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlock).toBe('medium')
        style.borderBlock = 'solid'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand.endsWith('style') ? 'solid' : initial(longhand)))
        expect(style.borderBlock).toBe('solid')

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
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-block-color')[0]

        // Initial longhand values
        style.borderBlockColor = 'currentColor currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlockColor).toBe('currentcolor')

        // Omitted values
        style.borderBlockColor = 'green'
        longhands.forEach(longhand => expect(style[longhand]).toBe('green'))
        expect(style.borderBlockColor).toBe('green')
        style.borderBlockColor = 'currentcolor green'
        expect(style.borderBlockStartColor).toBe(initial('border-block-start-color'))
        expect(style.borderBlockEndColor).toBe('green')
        expect(style.borderBlockColor).toBe('currentcolor green')
    })
})
describe('border-block-end-radius, border-block-start-radius, border-bottom-radius, border-inline-end-radius, border-inline-start-radius, border-left-radius, border-right-radius, border-top-radius', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-block-end-radius')[0]

        // Initial longhand values
        style.borderBlockEndRadius = '0 0 / 0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlockEndRadius).toBe('0px')

        // Omitted values
        style.borderBlockEndRadius = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.borderBlockEndRadius).toBe('1px')
        style.borderBlockEndRadius = '0px 1px / 0px'
        expect(style.borderEndStartRadius).toBe(initial('border-end-start-radius'))
        expect(style.borderEndEndRadius).toBe('1px 0px')
        expect(style.borderBlockEndRadius).toBe('0px 1px / 0px')
        style.borderBlockEndRadius = '0px / calc(0px)'
        longhands.forEach(longhand => expect(style[longhand]).toBe('0px calc(0px)'))
        expect(style.borderBlockEndRadius).toBe('0px / calc(0px)')
        style.borderBlockEndRadius = '0px / 1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('0px 1px'))
        expect(style.borderBlockEndRadius).toBe('0px / 1px')
    })
})
describe('border-block-style, border-inline-style', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-block-style')[0]

        // Initial longhand values
        style.borderBlockStyle = 'none none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlockStyle).toBe('none')

        // Omitted values
        style.borderBlockStyle = 'solid'
        longhands.forEach(longhand => expect(style[longhand]).toBe('solid'))
        expect(style.borderBlockStyle).toBe('solid')
        style.borderBlockStyle = 'none solid'
        expect(style.borderBlockStartStyle).toBe(initial('border-block-start-style'))
        expect(style.borderBlockEndStyle).toBe('solid')
        expect(style.borderBlockStyle).toBe('none solid')
    })
})
describe('border-block-width, border-inline-width', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-block-width')[0]

        // Initial longhand values
        style.borderBlockWidth = 'medium medium'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlockWidth).toBe('medium')

        // Omitted values
        style.borderBlockWidth = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.borderBlockWidth).toBe('1px')
        style.borderBlockWidth = 'medium 1px'
        expect(style.borderBlockStartWidth).toBe(initial('border-block-start-width'))
        expect(style.borderBlockEndWidth).toBe('1px')
        expect(style.borderBlockWidth).toBe('medium 1px')
    })
})
describe('border-block-end, border-block-start, border-bottom, border-inline-end, border-inline-start, border-left, border-right, border-top', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-top')[0]

        // Initial longhand values
        style.borderTop = 'medium none currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderTop).toBe('medium')

        // Omitted values
        style.borderTop = 'medium'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderTop).toBe('medium')
        style.borderTop = 'solid'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand.endsWith('style') ? 'solid' : initial(longhand)))
        expect(style.borderTop).toBe('solid')
    })
})
describe('border-clip', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-clip')[0]

        // All equal longhand values
        style.borderClip = 'normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderClip).toBe('normal')

        // All longhands cannot be represented
        style.borderTopClip = '1px'
        expect(style.borderClip).toBe('')
        expect(style.cssText).toBe('border-top-clip: 1px; border-right-clip: normal; border-bottom-clip: normal; border-left-clip: normal;')
    })
})
describe('border-color', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-color')[0]

        // Initial longhand values
        style.borderColor = 'currentColor currentColor currentColor currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderColor).toBe('currentcolor')

        // Omitted values
        const values = ['currentcolor', 'red', 'green']
        style.borderColor = 'red'
        longhands.forEach(longhand => expect(style[longhand]).toBe('red'))
        expect(style.borderColor).toBe('red')
        style.borderColor = 'currentcolor red'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.borderColor).toBe('currentcolor red')
        style.borderColor = 'currentcolor red green'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.borderColor).toBe('currentcolor red green')

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
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-image')[0]

        // Initial longhand values
        style.borderImage = 'none 100% / 1 / 0 stretch'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderImage).toBe('none')

        // Omitted values
        const values = [
            ['none'],
            ['100% / 0', { 'border-image-width': '0' }],
            ['100% / / 1', { 'border-image-outset': '1' }, '100% / 1 / 1'],
        ]
        values.forEach(([input, declared = {}, expected = input]) => {
            style.borderImage = input
            longhands.forEach(longhand => expect(style[longhand]).toBe(declared[longhand] ?? initial(longhand)))
            expect(style.borderImage).toBe(expected)
        })
    })
})
describe('border-radius', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-radius')[0]

        // Initial longhand values
        style.borderRadius = '0 0 0 0 / 0 0 0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderRadius).toBe('0px')

        // Omitted values
        style.borderRadius = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.borderRadius).toBe('1px')
        style.borderRadius = '0px 1px 2px 3px / 0px 1px'
        expect(style.borderTopLeftRadius).toBe(initial('border-top-left-radius'))
        expect(style.borderTopRightRadius).toBe('1px')
        expect(style.borderBottomRightRadius).toBe('2px 0px')
        expect(style.borderBottomLeftRadius).toBe('3px 1px')
        expect(style.borderRadius).toBe('0px 1px 2px 3px / 0px 1px')
        style.borderRadius = '0px / 1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('0px 1px'))
        expect(style.borderRadius).toBe('0px / 1px')
        style.borderRadius = '0px / calc(0px)'
        longhands.forEach(longhand => expect(style[longhand]).toBe('0px calc(0px)'))
        expect(style.borderRadius).toBe('0px / calc(0px)')
    })
})
describe('border-style', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-style')[0]

        // Initial longhand values
        style.borderStyle = 'none none none none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderStyle).toBe('none')

        // Omitted values
        const values = ['none', 'dashed', 'solid']
        style.borderStyle = 'solid'
        longhands.forEach(longhand => expect(style[longhand]).toBe('solid'))
        expect(style.borderStyle).toBe('solid')
        style.borderStyle = 'none dashed'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.borderStyle).toBe('none dashed')
        style.borderStyle = 'none dashed solid'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.borderStyle).toBe('none dashed solid')
    })
})
describe('border-width', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('border-width')[0]

        // Initial longhand values
        style.borderWidth = 'medium medium medium medium'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderWidth).toBe('medium')

        // Omitted values
        const values = ['medium', '1px', '2px']
        style.borderWidth = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.borderWidth).toBe('1px')
        style.borderWidth = 'medium 1px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.borderWidth).toBe('medium 1px')
        style.borderWidth = 'medium 1px 2px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.borderWidth).toBe('medium 1px 2px')
    })
})
describe('box-shadow', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('box-shadow')[0]
        const shadow = 'currentcolor none 0px 0px outset'

        // Initial longhand values
        style.boxShadow = 'currentColor none 0 0 outset'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.boxShadow).toBe('currentcolor none')

        // Omitted values
        const values = [
            ['none', { 'box-shadow-color': 'transparent' }],
            ['none 1px', { 'box-shadow-blur': '1px', 'box-shadow-color': 'transparent' }],
            ['0px 0px', { 'box-shadow-offset': '0px 0px' }],
        ]
        values.forEach(([input, declared = {}]) => {
            style.boxShadow = input
            longhands.forEach(longhand => expect(style[longhand]).toBe(declared[longhand] ?? initial(longhand)))
            expect(style.boxShadow).toBe(input)
        })

        // All longhands cannot be represented
        style.boxShadowOffset = '0px 0px, 0px 0px'
        expect(style.boxShadow).toBe('')
        expect(style.cssText).toBe('box-shadow-color: currentcolor; box-shadow-offset: 0px 0px, 0px 0px; box-shadow-blur: 0px; box-shadow-spread: 0px; box-shadow-position: outset;')

        // Coordinated value list
        style.boxShadow = `${shadow}, ${shadow}`
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.boxShadow).toBe('currentcolor none, currentcolor none')
    })
})
describe('caret', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('caret')[0]

        // Initial longhand values
        style.caret = 'auto auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.caret).toBe('auto')

        // Omitted values
        style.caret = 'auto'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.caret).toBe('auto')
        style.caret = 'manual'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'caret-animation' ? 'manual' : initial(longhand)))
        expect(style.caret).toBe('manual')
    })
})
describe('column-rule', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('column-rule')[0]

        // Initial longhand values
        style.columnRule = 'medium none currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.columnRule).toBe('medium')

        // Omitted values
        style.columnRule = 'medium'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.columnRule).toBe('medium')
        style.columnRule = 'solid'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'column-rule-style' ? 'solid' : initial(longhand)))
        expect(style.columnRule).toBe('solid')
    })
})
describe('columns', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('columns')[0]

        // Initial longhand values
        style.columns = 'auto auto / auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.columns).toBe('auto')

        // Omitted values
        const values = [
            ['auto'],
            ['1', { 'column-count': '1' }],
            ['auto / 1px', { 'column-height': '1px' }],
        ]
        values.forEach(([input, declared = {}]) => {
            style.columns = input
            longhands.forEach(longhand => expect(style[longhand]).toBe(declared[longhand] ?? initial(longhand)))
            expect(style.columns).toBe(input)
        })
    })
})
describe('contain-intrinsic-size', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('contain-intrinsic-size')[0]

        // Initial longhand values
        style.containIntrinsicSize = 'none none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.containIntrinsicSize).toBe('none')

        // Omitted values
        style.containIntrinsicSize = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.containIntrinsicSize).toBe('1px')
        style.containIntrinsicSize = 'none 1px'
        expect(style.containIntrinsicWidth).toBe(initial('contain-intrinsic-width'))
        expect(style.containIntrinsicHeight).toBe('1px')
        expect(style.containIntrinsicSize).toBe('none 1px')
    })
})
describe('container', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('container')[0]

        // Initial longhand values
        style.container = 'none / normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.container).toBe('none')

        // Omitted values
        style.container = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.container).toBe('none')
        style.container = 'none / size'
        expect(style.containerName).toBe(initial('container-name'))
        expect(style.containerType).toBe('size')
        expect(style.container).toBe('none / size')
    })
})
describe('corner', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('corner')[0]

        // Initial longhand values
        style.corner = '0 0 0 0 / 0 0 0 0 round round round round'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.corner).toBe('0px')

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
            longhands.forEach(longhand => expect(style[longhand]).toBe(declared[longhand] ?? initial(longhand)))
            expect(style.corner).toBe(input)
        })
    })
})
describe('corner-block-end, corner-block-start, corner-bottom, corner-inline-end, corner-inline-start, corner-left, corner-right, corner-top', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('corner-block-end')[0]

        // Initial longhand values
        style.cornerBlockEnd = '0 0 / 0 0 round round'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.cornerBlockEnd).toBe('0px')

        // Omitted values
        style.cornerBlockEnd = '1px'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand.endsWith('radius') ? '1px' : initial(longhand)))
        expect(style.cornerBlockEnd).toBe('1px')
        style.cornerBlockEnd = '0px 1px / 0px'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'border-end-end-radius' ? '1px 0px' : initial(longhand)))
        expect(style.cornerBlockEnd).toBe('0px 1px / 0px')
        style.cornerBlockEnd = '0px / calc(0px)'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand.includes('radius') ? '0px calc(0px)' : initial(longhand)))
        expect(style.cornerBlockEnd).toBe('0px / calc(0px)')
        style.cornerBlockEnd = '0px / 1px'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand.includes('radius') ? '0px 1px' : initial(longhand)))
        expect(style.cornerBlockEnd).toBe('0px / 1px')
        style.cornerBlockEnd = 'scoop'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand.includes('shape') ? 'scoop' : initial(longhand)))
        expect(style.cornerBlockEnd).toBe('scoop')
        style.cornerBlockEnd = 'round scoop'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'corner-end-end-shape' ? 'scoop' : initial(longhand)))
        expect(style.cornerBlockEnd).toBe('round scoop')
    })
})
describe('corner-end-end, corner-end-start, corner-bottom-left, corner-bottom-right, corner-start-end, corner-start-start, corner-top-left, corner-top-right', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('corner-end-end')[0]

        // Initial longhand values
        style.cornerEndEnd = '0 0 round'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.cornerEndEnd).toBe('0px')

        // Omitted values
        style.cornerEndEnd = '0px'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.cornerEndEnd).toBe('0px')
        style.cornerEndEnd = 'scoop'
        expect(style.borderEndEndRadius).toBe(initial('border-end-end-radius'))
        expect(style.cornerEndEndShape).toBe('scoop')
        expect(style.cornerEndEnd).toBe('scoop')
    })
})
describe('corner-shape', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('corner-shape')[0]

        // Initial longhand values
        style.cornerShape = 'round round round round'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.cornerShape).toBe('round')

        // Omitted values
        const values = ['round', 'scoop', 'bevel']
        style.cornerShape = 'scoop'
        longhands.forEach(longhand => expect(style[longhand]).toBe('scoop'))
        expect(style.cornerShape).toBe('scoop')
        style.cornerShape = 'round scoop'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.cornerShape).toBe('round scoop')
        style.cornerShape = 'round scoop bevel'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.cornerShape).toBe('round scoop bevel')
    })
})
describe('corner-block-end-shape, corner-block-start-shape, corner-bottom-shape, corner-inline-end-shape, corner-inline-start-shape, corner-left-shape, corner-right-shape, corner-top-shape', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('corner-block-end-shape')[0]

        // Initial longhand values
        style.cornerBlockEndShape = 'round round'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.cornerBlockEndShape).toBe('round')

        // Omitted values
        style.cornerBlockEndShape = 'scoop'
        longhands.forEach(longhand => expect(style[longhand]).toBe('scoop'))
        expect(style.cornerBlockEndShape).toBe('scoop')
        style.cornerBlockEndShape = 'round scoop'
        expect(style.cornerEndStartShape).toBe(initial('corner-end-start-shape'))
        expect(style.cornerEndEndShape).toBe('scoop')
        expect(style.cornerBlockEndShape).toBe('round scoop')
    })
})
describe('cue, pause, rest', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('cue')[0]

        // Initial longhand values
        style.cue = 'none none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.cue).toBe('none')

        // Omitted values
        style.cue = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.cue).toBe('none')
        style.cue = 'none url("icon.wav")'
        expect(style.cueBefore).toBe(initial('cue-before'))
        expect(style.cueAfter).toBe('url("icon.wav")')
        expect(style.cue).toBe('none url("icon.wav")')
    })
})
describe('event-trigger', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('event-trigger')[0]

        // Initial longhand values
        style.eventTrigger = 'none none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.eventTrigger).toBe('none')

        // All longhands cannot be represented
        style.eventTriggerName = '--trigger, --trigger'
        expect(style.eventTrigger).toBe('')
        expect(style.cssText).toBe('event-trigger-name: --trigger, --trigger; event-trigger-source: none;')

        // Coordinated value list
        style.eventTrigger = '--trigger none, --trigger none'
        longhands.forEach(longhand =>
            expect(style[longhand])
                .toBe(longhand === 'event-trigger-name' ? '--trigger, --trigger' : 'none, none'))
        expect(style.eventTrigger).toBe('--trigger none, --trigger none')
    })
})
describe('flex', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('flex')[0]

        // Initial longhand values
        style.flex = '0 1 auto'
        expect(style).toHaveLength(longhands.length)
        expect(style.flexGrow).toBe('0')
        expect(style.flexShrink).toBe('1')
        expect(style.flexBasis).toBe('auto')
        expect(style.flex).toBe('0 auto')

        // Omitted values
        style.flex = '1'
        expect(style.flexGrow).toBe('1')
        expect(style.flexShrink).toBe('1')
        expect(style.flexBasis).toBe('0px')
        expect(style.flex).toBe('1')
        style.flex = '1 1'
        expect(style.flexGrow).toBe('1')
        expect(style.flexShrink).toBe('1')
        expect(style.flexBasis).toBe('0px')
        expect(style.flex).toBe('1')
        style.flex = '0px'
        expect(style.flexGrow).toBe('1')
        expect(style.flexShrink).toBe('1')
        expect(style.flexBasis).toBe('0px')
        expect(style.flex).toBe('1')

        // none
        style.flex = 'none'
        expect(style.flexGrow).toBe('0')
        expect(style.flexShrink).toBe('0')
        expect(style.flexBasis).toBe('auto')
        expect(style.flex).toBe('none')
    })
})
describe('flex-flow', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('flex-flow')[0]

        // Initial longhand values
        style.flexFlow = 'row nowrap'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.flexFlow).toBe('row')

        // Omitted values
        style.flexFlow = 'row'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.flexFlow).toBe('row')
        style.flexFlow = 'wrap'
        expect(style.flexDirection).toBe(initial('flex-direction'))
        expect(style.flexWrap).toBe('wrap')
        expect(style.flexFlow).toBe('wrap')
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
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.font).toBe('medium monospace')

        // Omitted values
        style.font = 'medium monospace'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.font).toBe('medium monospace')
        style.font = 'medium / 1 monospace'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'line-height' ? '1' : initial(longhand)))
        expect(style.font).toBe('medium / 1 monospace')

        // All longhands cannot be represented
        style.fontVariantCaps = 'all-petite-caps'
        expect(style.font).toBe('')
        expect(style.cssText).toBe('font-style: normal; font-variant: all-petite-caps; font-weight: normal; font-width: normal; font-size: medium; line-height: 1; font-family: monospace; font-feature-settings: normal; font-kerning: auto; font-language-override: normal; font-optical-sizing: auto; font-size-adjust: none; font-variation-settings: normal;')
        style.fontVariantCaps = initial('font-variant-caps')
        style.fontWidth = '110%'
        expect(style.font).toBe('')
        expect(style.cssText).toBe('font-style: normal; font-variant: normal; font-weight: normal; font-width: 110%; font-size: medium; line-height: 1; font-family: monospace; font-feature-settings: normal; font-kerning: auto; font-language-override: normal; font-optical-sizing: auto; font-size-adjust: none; font-variation-settings: normal;')

        // System font
        style.font = 'caption'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(resetOnly.includes(longhand) ? initial(longhand) : ''))
        expect(style.font).toBe('caption')
        style.fontStyle = 'italic'
        expect(style.font).toBe('')
        expect(style.cssText).toBe('font-style: italic; font-variant-ligatures: ; font-variant-caps: ; font-variant-alternates: ; font-variant-numeric: ; font-variant-east-asian: ; font-variant-position: ; font-variant-emoji: ; font-weight: ; font-width: ; font-size: ; line-height: ; font-family: ; font-feature-settings: normal; font-kerning: auto; font-language-override: normal; font-optical-sizing: auto; font-size-adjust: none; font-variation-settings: normal;')
    })
})
describe('font-synthesis', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('font-synthesis')[0]

        // Initial longhand values
        style.fontSynthesis = 'weight style small-caps position'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.fontSynthesis).toBe('weight style small-caps position')

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
            longhands.forEach((longhand, i) => expect(style[longhand]).toBe(expected[i]))
            expect(style.fontSynthesis).toBe(input)
        })

        // All longhands cannot be represented
        style.fontSynthesisStyle = 'oblique-only'
        expect(style.fontSynthesis).toBe('')
        expect(style.cssText).toBe('font-synthesis-weight: none; font-synthesis-style: oblique-only; font-synthesis-small-caps: auto; font-synthesis-position: auto;')
    })
})
describe('font-variant', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('font-variant')[0]

        // Initial longhand values (not all longhands can be explicitly declared)
        style.fontVariant = 'normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.fontVariant).toBe('normal')

        // Omitted values
        style.fontVariant = 'none'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'font-variant-ligatures' ? 'none' : initial(longhand)))
        expect(style.fontVariant).toBe('none')
        style.fontVariant = 'small-caps'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'font-variant-caps' ? 'small-caps' : initial(longhand)))
        expect(style.fontVariant).toBe('small-caps')

        // All longhands cannot be represented
        style.fontVariantLigatures = 'none'
        expect(style.fontVariant).toBe('')
        expect(style.cssText).toBe('font-variant-ligatures: none; font-variant-caps: small-caps; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; font-variant-emoji: normal;')
    })
})
describe('gap', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('gap')[0]

        // Initial longhand values
        style.gap = 'normal normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.gap).toBe('normal')

        // Omitted values
        style.gap = 'normal'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.gap).toBe('normal')
        style.gap = 'normal 1px'
        expect(style.rowGap).toBe(initial('row-gap'))
        expect(style.columnGap).toBe('1px')
        expect(style.gap).toBe('normal 1px')
    })
})
describe('grid', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('grid')[0]

        // Explicit row and column templates
        style.grid = 'none / none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.grid).toBe('none')

        // Implicit row track list and explicit column template
        style.grid = 'auto-flow none / none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.grid).toBe('none')

        // Explicit row template and implicit column track list
        style.grid = 'none / auto-flow auto'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'grid-auto-flow' ? 'column' : initial(longhand)))
        expect(style.grid).toBe('none / auto-flow')

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
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('grid-area')[0]

        // Initial longhand values
        style.gridArea = 'auto / auto / auto / auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.gridArea).toBe('auto')

        // Omitted values
        const values = ['a', 'b', 'c']
        style.gridArea = 'a'
        longhands.forEach(longhand => expect(style[longhand]).toBe('a'))
        expect(style.gridArea).toBe('a')
        style.gridArea = 'a / b'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.gridArea).toBe('a / b')
        style.gridArea = 'a / b / c'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.gridArea).toBe('a / b / c')
        style.gridArea = '1'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'grid-row-start' ? '1' : initial(longhand)))
        expect(style.gridArea).toBe('1')
        style.gridArea = '1 / auto / 1 / 1'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'grid-column-start' ? initial(longhand) : '1'))
        expect(style.gridArea).toBe('1 / auto / 1 / 1')
        style.gridArea = '1 / 1 / auto / 1'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'grid-row-end' ? initial(longhand) : '1'))
        expect(style.gridArea).toBe('1 / 1 / auto / 1')
        style.gridArea = '1 / 1 / 1 / 1'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1'))
        expect(style.gridArea).toBe('1 / 1 / 1 / 1')
    })
})
describe('grid-column, grid-row', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('grid-column')[0]

        // Initial longhand values
        style.gridColumn = 'auto / auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.gridColumn).toBe('auto')

        // Omitted values
        style.gridColumn = 'a'
        longhands.forEach(longhand => expect(style[longhand]).toBe('a'))
        expect(style.gridColumn).toBe('a')
        style.gridColumn = 'a / b'
        expect(style.gridColumnStart).toBe('a')
        expect(style.gridColumnEnd).toBe('b')
        expect(style.gridColumn).toBe('a / b')
        style.gridColumn = '1'
        expect(style.gridColumnStart).toBe('1')
        expect(style.gridColumnEnd).toBe(initial('grid-column-end'))
        expect(style.gridColumn).toBe('1')
        style.gridColumn = '1 / 1'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1'))
        expect(style.gridColumn).toBe('1 / 1')
    })
})
describe('grid-template', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('grid-template')[0]

        // Row and column templates
        style.gridTemplate = 'none / none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.gridTemplate).toBe('none')

        // Areas
        style.gridTemplate = `
            [top a-top] "a a" 1px  [a-bottom]
                [b-top] "b b" auto [b-bottom bottom]
            / auto`
        expect(style.gridTemplateAreas).toBe('"a a" "b b"')
        expect(style.gridTemplateRows).toBe('[top a-top] 1px [a-bottom b-top] auto [b-bottom bottom]')
        expect(style.gridTemplateColumns).toBe('auto')
        expect(style.gridTemplate).toBe('[top a-top] "a a" 1px [a-bottom b-top] "b b" [b-bottom bottom] / auto')

        // Empty <line-names>
        style.gridTemplate = '[] "." [] [a] "." [] / [] 1px []'
        expect(style.gridTemplateAreas).toBe('"." "."')
        expect(style.gridTemplateRows).toBe('auto [a] auto')
        expect(style.gridTemplateColumns).toBe('1px')
        expect(style.gridTemplate).toBe('"." [a] "." / 1px')

        // Areas and a shorter row track list
        style.gridTemplateRows = 'auto'
        expect(style.gridTemplate).toBe('')
        expect(style.cssText).toBe('grid-template-rows: auto; grid-template-columns: 1px; grid-template-areas: "." ".";')

        // Areas and a longer row track list
        style.gridTemplateRows = 'auto auto auto'
        expect(style.gridTemplate).toBe('')
        expect(style.cssText).toBe('grid-template-rows: auto auto auto; grid-template-columns: 1px; grid-template-areas: "." ".";')
        style.gridTemplateRows = initial('grid-template-rows')

        // Areas and no row track list
        style.gridTemplateAreas = '"a"'
        expect(style.gridTemplate).toBe('')
        expect(style.cssText).toBe('grid-template-rows: none; grid-template-columns: 1px; grid-template-areas: "a";')

        // Areas and a repeated row track list
        style.gridTemplateRows = 'repeat(1, 1px)'
        expect(style.gridTemplate).toBe('')
        expect(style.cssText).toBe('grid-template-rows: repeat(1, 1px); grid-template-columns: 1px; grid-template-areas: "a";')
        style.gridTemplateRows = 'repeat(auto-fill, 1px)'
        expect(style.gridTemplate).toBe('')
        expect(style.cssText).toBe('grid-template-rows: repeat(auto-fill, 1px); grid-template-columns: 1px; grid-template-areas: "a";')

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
    })
})
describe('inset', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('inset')[0]

        // Initial longhand values
        style.inset = 'auto auto auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.inset).toBe('auto')

        // Omitted values
        const values = ['auto', '1px', '2px']
        style.inset = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.inset).toBe('1px')
        style.inset = 'auto 1px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.inset).toBe('auto 1px')
        style.inset = 'auto 1px 2px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.inset).toBe('auto 1px 2px')
    })
})
describe('inset-block, inset-inline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('inset-block')[0]

        // Initial longhand values
        style.insetBlock = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.insetBlock).toBe('auto')

        // Omitted values
        style.insetBlock = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.insetBlock).toBe('1px')
        style.insetBlock = 'auto 1px'
        expect(style.insetBlockStart).toBe(initial('inset-block-start'))
        expect(style.insetBlockEnd).toBe('1px')
        expect(style.insetBlock).toBe('auto 1px')
    })
})
describe('interest-delay', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('interest-delay')[0]

        // Initial longhand values
        style.interestDelay = 'normal normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.interestDelay).toBe('normal')

        // Omitted values
        style.interestDelay = '1s'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1s'))
        expect(style.interestDelay).toBe('1s')
        style.interestDelay = 'normal 1s'
        expect(style.interestDelayStart).toBe(initial('interest-delay-start'))
        expect(style.interestDelayEnd).toBe('1s')
        expect(style.interestDelay).toBe('normal 1s')
    })
})
describe('line-clamp', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('line-clamp')[0]

        // Initial longhand values (not all longhands can be explicitly declared)
        style.lineClamp = 'none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.lineClamp).toBe('none')
        expect(style.cssText).toBe('line-clamp: none;')

        // Omitted values
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

        // All longhands cannot be represented
        style.maxLines = '1'
        style.continue = initial('continue')
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
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('list-style')[0]

        // Initial longhand values
        style.listStyle = 'outside none disc'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.listStyle).toBe('outside')

        // Omitted values
        const values = [
            ['outside'],
            ['none', { 'list-style-type': 'none' }],
            ['outside inside', { 'list-style-type': 'inside' }],
            ['outside outside', { 'list-style-type': 'outside' }],
        ]
        values.forEach(([input, declared = {}]) => {
            style.listStyle = input
            longhands.forEach(longhand => expect(style[longhand]).toBe(declared[longhand] ?? initial(longhand)))
            expect(style.listStyle).toBe(input)
        })
    })
})
describe('margin', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('margin')[0]

        // Initial longhand values
        style.margin = '0 0 0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.margin).toBe('0px')

        // Omitted values
        const values = ['0px', '1px', '2px']
        style.margin = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.margin).toBe('1px')
        style.margin = '0px 1px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.margin).toBe('0px 1px')
        style.margin = '0px 1px 2px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.margin).toBe('0px 1px 2px')
    })
})
describe('margin-block, margin-inline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('margin-block')[0]

        // Initial longhand values
        style.marginBlock = '0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.marginBlock).toBe('0px')

        // Omitted values
        style.marginBlock = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.marginBlock).toBe('1px')
        style.marginBlock = '0px 1px'
        expect(style.marginBlockStart).toBe(initial('margin-block-start'))
        expect(style.marginBlockEnd).toBe('1px')
        expect(style.marginBlock).toBe('0px 1px')
    })
})
describe('marker', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('marker')[0]

        // All equal longhand values
        style.marker = 'none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.marker).toBe('none')

        // All longhands cannot be represented
        style.markerStart = 'url("#start")'
        expect(style.marker).toBe('')
        expect(style.cssText).toBe('marker-start: url("#start"); marker-mid: none; marker-end: none;')
    })
})
describe('mask', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const subProperties = shorthands.get('mask')
        const [, resetOnly] = subProperties
        const longhands = subProperties.flat()
        const mask = 'none 0% 0% / auto repeat border-box border-box add match-source'

        // Initial longhand values
        style.mask = mask
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.mask).toBe('none')

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
            longhands.forEach(longhand => expect(style[longhand]).toBe(declared[longhand] ?? initial(longhand)))
            expect(style.mask).toBe(input)
        })

        // All longhands cannot be represented
        style.maskImage = 'none, none'
        expect(style.mask).toBe('')
        expect(style.cssText).toBe('mask-image: none, none; mask-position: 0% 0%; mask-size: auto; mask-repeat: repeat; mask-origin: border-box; mask-clip: no-clip; mask-composite: add; mask-mode: match-source; mask-border: none;')

        // Coordinated value list
        style.mask = `${mask}, ${mask}`
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(resetOnly.includes(longhand)
                ? initial(longhand)
                : `${initial(longhand)}, ${initial(longhand)}`))
        expect(style.mask).toBe('none, none')
    })
})
describe('mask-border', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('mask-border')[0]

        // Initial longhand values
        style.maskBorder = 'none 0 / auto / 0 stretch alpha'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.maskBorder).toBe('none')

        // Omitted values
        const values = [
            ['none'],
            ['0 / 1', { 'mask-border-width': '1' }],
            ['0 / / 1', { 'mask-border-outset': '1' }, '0 / auto / 1'],
        ]
        values.forEach(([input, declared = {}, expected = input]) => {
            style.maskBorder = input
            longhands.forEach(longhand => expect(style[longhand]).toBe(declared[longhand] ?? initial(longhand)))
            expect(style.maskBorder).toBe(expected)
        })
    })
})
describe('offset', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('offset')[0]

        // Initial longhand values
        style.offset = 'normal none 0 auto / auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.offset).toBe('normal')

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
            longhands.forEach(longhand => expect(style[longhand]).toBe(declared[longhand] ?? initial(longhand)))
            expect(style.offset).toBe(expected)
        })
    })
})
describe('outline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('outline')[0]

        // Initial longhand values
        style.outline = 'medium none auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.outline).toBe('medium')

        // Omitted values
        style.outline = 'medium'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.outline).toBe('medium')
        style.outline = 'solid'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'outline-style' ? 'solid' : initial(longhand)))
        expect(style.outline).toBe('solid')
    })
})
describe('overflow', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('overflow')[0]

        // Initial longhand values
        style.overflow = 'visible visible'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overflow).toBe('visible')

        // Omitted values
        style.overflow = 'visible'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overflow).toBe('visible')
        style.overflow = 'visible hidden'
        expect(style.overflowX).toBe(initial('overflow-x'))
        expect(style.overflowY).toBe('hidden')
        expect(style.overflow).toBe('visible hidden')

        // Legacy value alias
        style.overflow = 'overlay'
        longhands.forEach(longhand => expect(style[longhand]).toBe('auto'))
        expect(style.overflow).toBe('auto')
    })
})
describe('overflow-clip-margin', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('overflow-clip-margin')[0]

        // All equal longhand values
        style.overflowClipMargin = '0px'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overflowClipMargin).toBe('0px')

        // Omitted values
        style.overflowClipMargin = 'content-box 0px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('content-box'))
        expect(style.overflowClipMargin).toBe('content-box')

        // All longhands cannot be represented
        style.overflowClipMarginTop = '1px'
        expect(style.marker).toBe('')
        expect(style.cssText).toBe('overflow-clip-margin-top: 1px; overflow-clip-margin-right: content-box; overflow-clip-margin-bottom: content-box; overflow-clip-margin-left: content-box;')
    })
})
describe('overflow-clip-margin-block, overflow-clip-margin-inline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('overflow-clip-margin-block')[0]

        // All equal longhand values
        style.overflowClipMarginBlock = '0px'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overflowClipMarginBlock).toBe('0px')

        // Omitted values
        style.overflowClipMarginBlock = 'content-box 0px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('content-box'))
        expect(style.overflowClipMarginBlock).toBe('content-box')

        // All longhands cannot be represented
        style.overflowClipMarginBlockStart = '1px'
        expect(style.marker).toBe('')
        expect(style.cssText).toBe('overflow-clip-margin-block-start: 1px; overflow-clip-margin-block-end: content-box;')
    })
})
describe('overscroll-behavior', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('overscroll-behavior')[0]

        // Initial longhand values
        style.overscrollBehavior = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overscrollBehavior).toBe('auto')

        // Omitted values
        style.overscrollBehavior = 'auto'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overscrollBehavior).toBe('auto')
        style.overscrollBehavior = 'auto contain'
        expect(style.overscrollBehaviorX).toBe(initial('overscroll-behavior-x'))
        expect(style.overscrollBehaviorY).toBe('contain')
        expect(style.overscrollBehavior).toBe('auto contain')
    })
})
describe('padding', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('padding')[0]

        // Initial longhand values
        style.padding = '0 0 0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.padding).toBe('0px')

        // Omitted values
        const values = ['0px', '1px', '2px']
        style.padding = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.padding).toBe('1px')
        style.padding = '0px 1px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.padding).toBe('0px 1px')
        style.padding = '0px 1px 2px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.padding).toBe('0px 1px 2px')
    })
})
describe('padding-block, padding-inline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('padding-block')[0]

        // Initial longhand values
        style.paddingBlock = '0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.paddingBlock).toBe('0px')

        // Omitted values
        style.paddingBlock = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.paddingBlock).toBe('1px')
        style.paddingBlock = '0px 1px'
        expect(style.paddingBlockStart).toBe(initial('padding-block-start'))
        expect(style.paddingBlockEnd).toBe('1px')
        expect(style.paddingBlock).toBe('0px 1px')
    })
})
describe('place-content', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('place-content')[0]

        // Initial longhand values
        style.placeContent = 'normal normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.placeContent).toBe('normal')

        // Omitted values
        style.placeContent = 'normal'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.placeContent).toBe('normal')
        style.placeContent = 'normal space-between'
        expect(style.alignContent).toBe(initial('align-content'))
        expect(style.justifyContent).toBe('space-between')
        expect(style.placeContent).toBe('normal space-between')
        style.placeContent = 'baseline'
        expect(style.alignContent).toBe('baseline')
        expect(style.justifyContent).toBe('start')
        expect(style.placeContent).toBe('baseline')
    })
})
describe('place-items', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('place-items')[0]

        // Initial longhand values
        style.placeItems = 'normal legacy'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.placeItems).toBe('normal legacy')

        // Omitted values
        style.placeItems = 'normal'
        longhands.forEach(longhand => expect(style[longhand]).toBe('normal'))
        expect(style.placeItems).toBe('normal')
        style.placeItems = 'normal stretch'
        expect(style.alignItems).toBe(initial('align-items'))
        expect(style.justifyItems).toBe('stretch')
        expect(style.placeItems).toBe('normal stretch')
    })
})
describe('place-self', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('place-self')[0]

        // Initial longhand values
        style.placeSelf = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.placeSelf).toBe('auto')

        // Omitted values
        style.placeSelf = 'auto'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.placeSelf).toBe('auto')
        style.placeSelf = 'auto normal'
        expect(style.alignSelf).toBe(initial('align-self'))
        expect(style.justifySelf).toBe('normal')
        expect(style.placeSelf).toBe('auto normal')
    })
})
describe('pointer-timeline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('pointer-timeline')[0]
        const timeline = 'none block'

        // Initial longhand values
        style.pointerTimeline = timeline
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.pointerTimeline).toBe('none')

        // Omitted values
        style.pointerTimeline = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.pointerTimeline).toBe('none')
        style.pointerTimeline = 'none inline'
        expect(style.pointerTimelineName).toBe(initial('pointer-timeline-name'))
        expect(style.pointerTimelineAxis).toBe('inline')
        expect(style.pointerTimeline).toBe('none inline')

        // All longhands cannot be represented
        style.pointerTimelineName = 'none, none'
        expect(style.pointerTimeline).toBe('')
        expect(style.cssText).toBe('pointer-timeline-name: none, none; pointer-timeline-axis: inline;')

        // Coordinated value list
        style.pointerTimeline = `${timeline}, ${timeline}`
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.pointerTimeline).toBe('none, none')
    })
})
describe('position-try', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('position-try')[0]

        // Initial longhand values
        style.positionTry = 'normal none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.positionTry).toBe('none')

        // Omitted values
        style.positionTry = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.positionTry).toBe('none')
        style.positionTry = 'most-width none'
        expect(style.positionTryOrder).toBe('most-width')
        expect(style.positionTryFallbacks).toBe(initial('position-try-fallbacks'))
        expect(style.positionTry).toBe('most-width none')
    })
})
describe('scroll-margin', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('scroll-margin')[0]

        // Initial longhand values
        style.scrollMargin = '0 0 0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollMargin).toBe('0px')

        // Omitted values
        const values = ['0px', '1px', '2px']
        style.scrollMargin = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.scrollMargin).toBe('1px')
        style.scrollMargin = '0px 1px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.scrollMargin).toBe('0px 1px')
        style.scrollMargin = '0px 1px 2px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.scrollMargin).toBe('0px 1px 2px')
    })
})
describe('scroll-margin-block, scroll-margin-inline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('scroll-margin-block')[0]

        // Initial longhand values
        style.scrollMarginBlock = '0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollMarginBlock).toBe('0px')

        // Omitted values
        style.scrollMarginBlock = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.scrollMarginBlock).toBe('1px')
        style.scrollMarginBlock = '0px 1px'
        expect(style.scrollMarginBlockStart).toBe(initial('scroll-margin-block-start'))
        expect(style.scrollMarginBlockEnd).toBe('1px')
        expect(style.scrollMarginBlock).toBe('0px 1px')
    })
})
describe('scroll-padding', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('scroll-padding')[0]

        // Initial longhand values
        style.scrollPadding = 'auto auto auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollPadding).toBe('auto')

        // Omitted values
        const values = ['0px', '1px', '2px']
        style.scrollPadding = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.scrollPadding).toBe('1px')
        style.scrollPadding = '0px 1px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i % 2]))
        expect(style.scrollPadding).toBe('0px 1px')
        style.scrollPadding = '0px 1px 2px'
        longhands.forEach((longhand, i) => expect(style[longhand]).toBe(values[i === 3 ? 1 : i]))
        expect(style.scrollPadding).toBe('0px 1px 2px')
    })
})
describe('scroll-padding-block, scroll-padding-inline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('scroll-padding-block')[0]

        // Initial longhand values
        style.scrollPaddingBlock = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollPaddingBlock).toBe('auto')

        // Omitted values
        style.scrollPaddingBlock = 'auto'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollPaddingBlock).toBe('auto')
        style.scrollPaddingBlock = 'auto 1px'
        expect(style.scrollPaddingBlockStart).toBe(initial('scroll-padding-block-start'))
        expect(style.scrollPaddingBlockEnd).toBe('1px')
        expect(style.scrollPaddingBlock).toBe('auto 1px')
    })
})
describe('scroll-timeline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('scroll-timeline')[0]
        const timeline = 'none block'

        // Initial longhand values
        style.scrollTimeline = timeline
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollTimeline).toBe('none')

        // Omitted values
        style.scrollTimeline = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollTimeline).toBe('none')
        style.scrollTimeline = 'none inline'
        expect(style.scrollTimelineName).toBe(initial('scroll-timeline-name'))
        expect(style.scrollTimelineAxis).toBe('inline')
        expect(style.scrollTimeline).toBe('none inline')

        // All longhands cannot be represented
        style.scrollTimelineName = 'none, none'
        expect(style.scrollTimeline).toBe('')
        expect(style.cssText).toBe('scroll-timeline-name: none, none; scroll-timeline-axis: inline;')

        // Coordinated value list
        style.scrollTimeline = `${timeline}, ${timeline}`
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.scrollTimeline).toBe('none, none')
    })
})
describe('text-align', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.textAlign = '"12"'
        expect(style).toHaveLength(0)
    })
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('text-align')[0]

        // Initial longhand values (not all longhands can be explicitly declared)
        style.textAlign = 'start'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textAlign).toBe('start')

        // justify-all
        style.textAlign = 'justify-all'
        longhands.forEach(longhand => expect(style[longhand]).toBe('justify'))
        expect(style.textAlign).toBe('justify-all')

        // match-parent
        style.textAlign = 'match-parent'
        longhands.forEach(longhand => expect(style[longhand]).toBe('match-parent'))
        expect(style.textAlign).toBe('match-parent')

        // All longhands cannot be represented
        style.textAlignLast = initial('text-align-last')
        expect(style.textAlign).toBe('')
        expect(style.cssText).toBe('text-align-all: match-parent; text-align-last: auto;')
        style.textAlignAll = 'justify'
        style.textAlignLast = 'start'
        expect(style.textAlign).toBe('')
        expect(style.cssText).toBe('text-align-all: justify; text-align-last: start;')
        style.textAlignAll = initial('text-align-all')
        expect(style.textAlign).toBe('')
        expect(style.cssText).toBe('text-align-all: start; text-align-last: start;')
    })
})
describe('text-box', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('text-box')[0]

        // Initial longhand values
        style.textBox = 'none auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textBox).toBe('normal')

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
            longhands.forEach(longhand => expect(style[longhand]).toBe(declared[longhand] ?? initial(longhand)))
            expect(style.textBox).toBe(expected)
        })
    })
})
describe('text-decoration', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('text-decoration')[0]

        // Initial longhand values
        style.textDecoration = 'none auto solid currentcolor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textDecoration).toBe('none')

        // Omitted values
        style.textDecoration = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textDecoration).toBe('none')
        style.textDecoration = 'from-font'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'text-decoration-thickness' ? 'from-font' : initial(longhand)))
        expect(style.textDecoration).toBe('from-font')
    })
})
describe('text-decoration-skip', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('text-decoration-skip')[0]

        // All equal longhand values
        style.textDecorationSkip = 'auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textDecorationSkip).toBe('auto')

        // none
        style.textDecorationSkip = 'none'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'text-decoration-skip-self' ? 'no-skip' : 'none'))
        expect(style.textDecorationSkip).toBe('none')

        // All longhands cannot be represented
        style.textDecorationSkipSelf = 'skip-all'
        expect(style.textDecorationSkip).toBe('')
        expect(style.cssText).toBe('text-decoration-skip-self: skip-all; text-decoration-skip-box: none; text-decoration-skip-spaces: none; text-decoration-skip-ink: none;')
    })
})
describe('text-emphasis', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('text-emphasis')[0]

        // Initial longhand values
        style.textEmphasis = 'none currentcolor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textEmphasis).toBe('none')

        // Omitted values
        style.textEmphasis = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textEmphasis).toBe('none')
        style.textEmphasis = 'green'
        expect(style.textEmphasisStyle).toBe(initial('text-emphasis-style'))
        expect(style.textEmphasisColor).toBe('green')
        expect(style.textEmphasis).toBe('green')
    })
})
describe('text-spacing', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('text-spacing')[0]

        // Initial longhand values (not all longhands can be explicitly declared)
        style.textSpacing = 'normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textSpacing).toBe('normal')

        // Omitted values
        style.textSpacing = 'space-all'
        expect(style.textSpacingTrim).toBe('space-all')
        expect(style.textAutospace).toBe(initial('text-autospace'))
        expect(style.textSpacing).toBe('space-all')
        style.textSpacing = 'no-autospace'
        expect(style.textSpacingTrim).toBe(initial('text-spacing-trim'))
        expect(style.textAutospace).toBe('no-autospace')
        expect(style.textSpacing).toBe('no-autospace')
        style.textSpacing = 'ideograph-alpha ideograph-numeric'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textSpacing).toBe('normal')

        // none
        style.textSpacing = 'none'
        expect(style.textSpacingTrim).toBe('space-all')
        expect(style.textAutospace).toBe('no-autospace')
        expect(style.textSpacing).toBe('none')

        // auto
        style.textSpacing = 'auto'
        longhands.forEach(longhand => expect(style[longhand]).toBe('auto'))
        expect(style.textSpacing).toBe('auto')

        // All longhands cannot be represented
        style.textAutospace = initial('text-autospace')
        expect(style.textSpacing).toBe('')
        expect(style.cssText).toBe('text-spacing-trim: auto; text-autospace: normal;')
        style.textAutospace = 'no-autospace'
        expect(style.textSpacing).toBe('')
        expect(style.cssText).toBe('text-spacing-trim: auto; text-autospace: no-autospace;')
        style.textSpacingTrim = 'space-all'
        style.textAutospace = 'auto'
        expect(style.textSpacing).toBe('')
        expect(style.cssText).toBe('text-spacing-trim: space-all; text-autospace: auto;')
    })
})
describe('text-wrap', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('text-wrap')[0]

        // Initial longhand values
        style.textWrap = 'wrap auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textWrap).toBe('wrap')

        // Omitted values
        style.textWrap = 'wrap'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.textWrap).toBe('wrap')
        style.textWrap = 'balance'
        expect(style.textWrapMode).toBe(initial('text-wrap-mode'))
        expect(style.textWrapStyle).toBe('balance')
        expect(style.textWrap).toBe('balance')
    })
})
describe('timeline-trigger', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('timeline-trigger')[0]

        // Initial longhand values
        style.timelineTrigger = 'none auto normal normal / auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.timelineTrigger).toBe('none')

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
            longhands.forEach(longhand => expect(style[longhand]).toBe(declared[longhand] ?? initial(longhand)))
            expect(style.timelineTrigger).toBe(expected)
        })

        // All longhands cannot be represented
        style.timelineTriggerName = '--trigger, --trigger'
        expect(style.timelineTrigger).toBe('')
        expect(style.cssText).toBe('timeline-trigger-name: --trigger, --trigger; timeline-trigger-source: auto; timeline-trigger-range: normal; timeline-trigger-exit-range: entry;')

        // Coordinated value list
        style.timelineTrigger = 'none auto normal, none auto normal'
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.timelineTrigger).toBe('none auto normal, none auto normal')
    })
})
describe('timeline-trigger-exit-range', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('timeline-trigger-exit-range')[0]

        // Initial longhand values
        style.timelineTriggerExitRange = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.timelineTriggerExitRange).toBe('auto')

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
            expect(style.timelineTriggerExitRangeStart).toBe(start)
            expect(style.timelineTriggerExitRangeEnd).toBe(end)
            expect(style.timelineTriggerExitRange).toBe(expected)
        })

        // All longhands cannot be represented
        style.timelineTriggerExitRangeStart = 'auto, auto'
        expect(style.animationRange).toBe('')
        expect(style.cssText).toBe('timeline-trigger-exit-range-start: auto, auto; timeline-trigger-exit-range-end: auto;')

        // Coordinated value list
        style.timelineTriggerExitRange = 'auto, auto'
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.timelineTriggerExitRange).toBe('auto, auto')
    })
})
describe('timeline-trigger-range', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('timeline-trigger-range')[0]

        // Initial longhand values
        style.timelineTriggerRange = 'normal normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.timelineTriggerRange).toBe('normal')

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
            expect(style.timelineTriggerRangeStart).toBe(start)
            expect(style.timelineTriggerRangeEnd).toBe(end)
            expect(style.timelineTriggerRange).toBe(expected)
        })

        // All longhands cannot be represented
        style.timelineTriggerRangeStart = 'normal, normal'
        expect(style.animationRange).toBe('')
        expect(style.cssText).toBe('timeline-trigger-range-start: normal, normal; timeline-trigger-range-end: normal;')

        // Coordinated value list
        style.timelineTriggerRange = 'normal, normal'
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.timelineTriggerRange).toBe('normal, normal')
    })
})
describe('transition', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('transition')[0]
        const transition = '0s ease 0s all'

        // Initial longhand values
        style.transition = transition
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.transition).toBe('0s')

        // Omitted values
        style.transition = '0s'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.transition).toBe('0s')
        style.transition = 'linear'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'transition-timing-function' ? 'linear' : initial(longhand)))
        expect(style.transition).toBe('linear')

        // All longhands cannot be represented
        style.transitionProperty = 'none, none'
        expect(style.transition).toBe('')
        expect(style.cssText).toBe('transition-duration: 0s; transition-timing-function: linear; transition-delay: 0s; transition-behavior: normal; transition-property: none, none;')

        // Coordinated value list
        style.transition = `${transition}, ${transition}`
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.transition).toBe('0s, 0s')
    })
})
describe('vertical-align', () => {
    test('invalid', () => {
        const style = createStyleBlock()
        style.verticalAlign = 'text-before-edge'
        style.verticalAlign = 'text-after-edge'
        expect(style).toHaveLength(0)
    })
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('vertical-align')[0]

        // Initial longhand values (not all longhands can be explicitly declared)
        style.verticalAlign = 'baseline 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.verticalAlign).toBe('baseline')

        // Omitted values
        style.verticalAlign = 'baseline'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.verticalAlign).toBe('baseline')
        style.verticalAlign = 'first'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'baseline-source' ? 'first' : initial(longhand)))
        expect(style.verticalAlign).toBe('first')
        style.verticalAlign = '1px'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'baseline-shift' ? '1px' : initial(longhand)))
        expect(style.verticalAlign).toBe('1px')
    })
})
describe('view-timeline', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('view-timeline')[0]
        const timeline = 'none block auto'

        // Initial longhand values
        style.viewTimeline = timeline
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.viewTimeline).toBe('none')

        // Omitted values
        const values = [
            ['none'],
            ['none inline', { 'view-timeline-axis': 'inline' }],
            ['none 1px', { 'view-timeline-inset': '1px' }],
        ]
        values.forEach(([input, declared = {}]) => {
            style.viewTimeline = input
            longhands.forEach(longhand => expect(style[longhand]).toBe(declared[longhand] ?? initial(longhand)))
            expect(style.viewTimeline).toBe(input)
        })

        // All longhands cannot be represented
        style.viewTimelineName = 'none, none'
        expect(style.viewTimeline).toBe('')
        expect(style.cssText).toBe('view-timeline-name: none, none; view-timeline-axis: block; view-timeline-inset: 1px;')

        // Coordinated value list
        style.viewTimeline = `${timeline}, ${timeline}`
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.viewTimeline).toBe('none, none')
    })
})
describe('white-space', () => {
    test('expansion and reification', () => {

        const style = createStyleBlock()
        const longhands = shorthands.get('white-space')[0]

        // Initial longhand values
        style.whiteSpace = 'collapse wrap none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.whiteSpace).toBe('normal')

        // Omitted values
        style.whiteSpace = 'collapse'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.whiteSpace).toBe('normal')
        style.whiteSpace = 'nowrap'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(longhand === 'text-wrap-mode' ? 'nowrap' : initial(longhand)))
        expect(style.whiteSpace).toBe('nowrap')

        // normal, pre, pre-line, pre-wrap
        whiteSpace.mapping.forEach((mapping, keyword) => {
            style.whiteSpace = keyword
            longhands.forEach((longhand, index) => expect(style[longhand]).toBe(mapping[index].value))
            expect(style.whiteSpace).toBe(keyword)
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
        expect(style).toHaveLength(0)
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
        style.superscriptPositionOverride = '1% 1%'
        expect(style.superscriptPositionOverride).toBe('1%')
        style.superscriptSizeOverride = '1% 1%'
        expect(style.superscriptSizeOverride).toBe('1%')
    })
})
describe('CSSFunctionDescriptors', () => {
    test('invalid', () => {

        const style = CSSFunctionDescriptors.create(globalThis, undefined, { parentRule: functionRule })

        // Invalid name
        style.setProperty('color', 'red')
        // Priority
        style.setProperty('result', '1', 'important')

        expect(style).toHaveLength(0)
    })
})
describe('CSSKeyframeProperties', () => {
    test('invalid', () => {

        const style = CSSKeyframeProperties.create(globalThis, undefined, { parentRule: keyframeRule })

        // Invalid name
        style.setProperty('animation-delay', '1s')
        // Priority
        style.setProperty('font-weight', '1', 'important')

        expect(style).toHaveLength(0)
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
        expect(style).toHaveLength(0)
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
        expect(style).toHaveLength(0)
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
        // Invalid name
        style.setProperty('font-weight', '1')
        // Priority
        style.setProperty('top', '1px', 'important')

        expect(style).toHaveLength(0)
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
