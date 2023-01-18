
const { cssom: { CSSStyleDeclaration }, install } = require('../lib/index.js')
const { UPDATE_COMPUTED_STYLE_DECLARATION_ERROR } = require('../lib/cssom/CSSStyleDeclaration-impl.js')
const createError = require('../lib/error.js')
const { cssPropertyToIDLAttribute } = require('../lib/utils/script.js')
const properties = require('../lib/properties/definitions.js')
const propertyNames = require('../lib/properties/names.js')
const shorthands = require('../lib/properties/shorthands.js')
const whiteSpace = require('../lib/values/white-space.js')

/**
 * @param {object} [privateData]
 * @returns {CSSStyleDeclaration}
 */
function createStyleBlock(privateData = {}) {
    return CSSStyleDeclaration.create(globalThis, undefined, privateData)
}

// Helper to get initial property value (with better readability)
function initial(property) {
    return properties[property].initial.serialized
}

beforeAll(() => {
    install()
})

describe('CSSStyleDeclaration', () => {
    it('has all properties and methods', () => {

        const style = createStyleBlock()
        const prototype = Object.getPrototypeOf(style)

        // Camel/kebab/pascal cased attributes
        propertyNames.forEach(property => {

            const prefixed = property.startsWith('-webkit-')
            const attribute = cssPropertyToIDLAttribute(property, prefixed)

            // Kebab case
            expect(Object.getOwnPropertyDescriptor(prototype, property).get).toBeDefined()
            expect(Object.getOwnPropertyDescriptor(prototype, property).set).toBeDefined()
            // Camel case
            expect(Object.getOwnPropertyDescriptor(prototype, attribute).get).toBeDefined()
            expect(Object.getOwnPropertyDescriptor(prototype, attribute).set).toBeDefined()
            // Pascal case (only `-webkit` prefixed legacy name aliases and property mappings)
            if (prefixed) {
                const attribute = cssPropertyToIDLAttribute(property)
                expect(Object.getOwnPropertyDescriptor(prototype, attribute).get).toBeDefined()
                expect(Object.getOwnPropertyDescriptor(prototype, attribute).set).toBeDefined()
            }
        })

        // Camel and kebab case attributes mirroring
        style.borderTopColor = 'red'
        expect(style.borderTopColor).toBe('red')
        expect(style['border-top-color']).toBe('red')
        style['border-top-color'] = 'green'
        expect(style.borderTopColor).toBe('green')
        expect(style['border-top-color']).toBe('green')

        // Simple alias
        style.layoutOrder = '1'
        expect(style.layoutOrder).toBe('1')
        expect(style['-webkit-order']).toBe('1')
        expect(style.webkitOrder).toBe('1')
        expect(style.WebkitOrder).toBe('1')
        style.webkitOrder = '2'
        expect(style.layoutOrder).toBe('2')
        expect(style['-webkit-order']).toBe('2')
        expect(style.webkitOrder).toBe('2')
        expect(style.WebkitOrder).toBe('2')
        style.WebkitOrder = '3'
        expect(style.layoutOrder).toBe('3')
        expect(style['-webkit-order']).toBe('3')
        expect(style.webkitOrder).toBe('3')
        expect(style.WebkitOrder).toBe('3')

        // Mapping property
        style['-webkit-box-align'] = 'start'
        expect(style['-webkit-box-align']).toBe('start')
        expect(style.webkitBoxAlign).toBe('start')
        expect(style.WebkitBoxAlign).toBe('start')
        expect(style['align-items']).toBe('')
        style.webkitBoxAlign = 'center'
        expect(style['-webkit-box-align']).toBe('center')
        expect(style.webkitBoxAlign).toBe('center')
        expect(style.WebkitBoxAlign).toBe('center')
        expect(style['align-items']).toBe('')
        style.WebkitBoxAlign = 'end'
        expect(style['-webkit-box-align']).toBe('end')
        expect(style.webkitBoxAlign).toBe('end')
        expect(style.WebkitBoxAlign).toBe('end')
        expect(style['align-items']).toBe('')

        // Property indices map to the corresponding declaration name
        expect(style[0]).toBe('border-top-color')
        expect(style.item(0)).toBe('border-top-color')
        expect(style[1]).toBe('layout-order')
        expect(style.item(1)).toBe('layout-order')
        expect(style[2]).toBe('-webkit-box-align')
        expect(style.item(2)).toBe('-webkit-box-align')
        expect(style[3]).toBeUndefined()
        expect(style.item(3)).toBe('')
        expect(style).toHaveLength(3)

        // Create/read/update/delete declaration value(s)
        style.borderTopColor = ''
        expect(style.getPropertyValue('border-top-color')).toBe('')
        expect(style).toHaveLength(2)
        expect(style[0]).toBe('layout-order')
        expect(style.item(0)).toBe('layout-order')
        style.setProperty('layout-order', '')
        expect(style).toHaveLength(1)
        expect(style[0]).toBe('-webkit-box-align')
        expect(style.item(0)).toBe('-webkit-box-align')
        style.cssText = ''
        expect(style.cssText).toBe('')
        expect(style).toHaveLength(0)
        expect(style[0]).toBeUndefined()
        style.cssText = 'font-size: 16px; font-size: 20px !important; font-size: 24px'
        expect(style.cssText).toBe('font-size: 20px !important;')
        expect(style.fontSize).toBe('20px')
        style.setProperty('font-size', '10px', 'important')
        expect(style.fontSize).toBe('10px')
        expect(style.getPropertyValue('font-size')).toBe('10px')
        expect(style.getPropertyPriority('font-size')).toBe('important')
        expect(style.cssText).toBe('font-size: 10px !important;')
        style.setProperty('font-size', '10px')
        expect(style.getPropertyPriority('font-size')).toBe('')
        expect(style.cssText).toBe('font-size: 10px;')
        style.removeProperty('font-size')
        expect(style.fontSize).toBe('')
        expect(style.cssText).toBe('')
    })
    it('constructs a new instance with a reference to a parent CSS rule', () => {
        const parentRule = {}
        const style = createStyleBlock({ parentRule })
        expect(style.parentRule).toBe(parentRule)
    })
    it('constructs a new instance with the declarations resulting from parsing `Element.style`', () => {
        const element = {
            getAttribute() {
                return 'font-size: 10px;'
            },
        }
        const style = createStyleBlock({ ownerNode: element })
        expect(style.fontSize).toBe('10px')
    })
    it('constructs a new read-only instance with the declarations from `getComputedStyle()`', () => {

        const value = { type: new Set(['dimension', 'length']), unit: 'px', value: 10 }
        const declarations = [{ name: 'font-size', value }]
        const style = createStyleBlock({ computed: true, declarations, ownerNode: {} })
        const error = createError(UPDATE_COMPUTED_STYLE_DECLARATION_ERROR)

        expect(style.fontSize).toBe('10px')
        expect(style.cssText).toBe('')
        expect(() => style.cssText = 'font-size: 20px').toThrow(error)
        expect(() => style.setProperty('font-size', '20px')).toThrow(error)
        expect(() => style.removeProperty('font-size', '20px')).toThrow(error)
    })
    it('does not throw when failing to parse `cssText`', () => {
        const style = createStyleBlock()
        style.color = 'black'
        expect(style.cssText).toBe('color: black;')
        style.cssText = 'color: '
        expect(style.cssText).toBe('')
    })
    it('ignores a rule in `cssText`', () => {
        const style = createStyleBlock()
        style.cssText = 'color: green; @page { color: red }; .selector { color: red }; font-size: 12px'
        expect(style.cssText).toBe('color: green; font-size: 12px;')
    })
    it('stores declarations in the order specified in `cssText`', () => {
        const style = createStyleBlock()
        style.cssText = 'color: orange; width: 1px; color: green'
        expect(style.cssText).toBe('width: 1px; color: green;')
        style.cssText = 'color: green !important; width: 1px; color: orange'
        expect(style.cssText).toBe('color: green !important; width: 1px;')
    })
    it('does not store a declaration for an invalid property specified with `setProperty()`', () => {
        const style = createStyleBlock()
        style.setProperty(' font-size', '1px')
        expect(style.fontSize).toBe('')
        style.setProperty('font-size', '1px !important')
        expect(style.fontSize).toBe('')
        style.setProperty('fontSize', '1px')
        expect(style.fontSize).toBe('')
    })
    it('does not store a declaration value specified with a priority with `setProperty()`', () => {
        const style = createStyleBlock()
        style.setProperty('font-size', '1px !important')
        expect(style.fontSize).toBe('')
    })
    it('normalizes a declaration property to lowercase with `setProperty()`', () => {
        const style = createStyleBlock()
        style.setProperty('FoNt-SiZe', '12px')
        expect(style.fontSize).toBe('12px')
        expect(style.getPropertyValue('font-size')).toBe('12px')
    })
    it('throws an error when declaring a value that cannot be converted to string', () => {
        const style = createStyleBlock()
        expect(() => (style.opacity = Symbol('0')))
            .toThrow("Failed to set the 'opacity' property on 'CSSStyleDeclaration': The provided value is a symbol, which cannot be converted to a string.")
        expect(() => (style.opacity = { toString: () => [0] }))
            .toThrow('Cannot convert object to primitive value')
    })
    it('declares a non-string value that can be converted to string', () => {

        const style = createStyleBlock()

        style.opacity = { toString: () => '0' }
        expect(style.opacity).toBe('0')

        style.opacity = { toString: () => 1 }
        expect(style.opacity).toBe('1')

        style.opacity = BigInt(0)
        expect(style.opacity).toBe('0')
        style.opacity = { toString: () => BigInt(1) }
        expect(style.opacity).toBe('1')

        style.setProperty('--custom', [0])
        expect(style.getPropertyValue('--custom')).toBe('0')

        style.setProperty('--custom', null)
        expect(style.getPropertyValue('--custom')).toBe('')
        style.setProperty('--custom', { toString: () => null })
        expect(style.getPropertyValue('--custom')).toBe('null')

        style.setProperty('--custom', undefined)
        expect(style.getPropertyValue('--custom')).toBe('undefined')
        style.setProperty('--custom', null)
        style.setProperty('--custom', { toString: () => undefined })
        expect(style.getPropertyValue('--custom')).toBe('undefined')

        style.setProperty('--custom', false)
        expect(style.getPropertyValue('--custom')).toBe('false')
        style.setProperty('--custom', { toString: () => true })
        expect(style.getPropertyValue('--custom')).toBe('true')
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

/**
 * @see {@link https://github.com/w3c/csswg-drafts/issues/5649}
 *
 * These tests rely on monkey-patching CSSStyleDeclaration until new interfaces
 * extending it are created for each set of descriptors/properties allowed in a
 * given context.
 *
 * There is currently no support for reading/setting a descriptor not matching a
 * property via `style[descriptor]`.
 */
describe('CSSCounterStyle.style', () => {})
describe('CSSFontFaceRule.style', () => {

    const parentRule = {
        parentStyleSheet: { _rules: [], type: 'text/css' },
        type: new Set(['at-rule', 'font-face']),
    }

    it('does not store an invalid declaration', () => {

        const style = createStyleBlock({ parentRule })

        // Invalid name
        style.fontSizeAdjust = 'none'
        expect(style.fontSizeAdjust).toBe('')
        style.setProperty('font-size-adjust', '')
        expect(style.getPropertyValue('font-size-adjust')).toBe('')
        style.cssText = 'font-size-adjust: none'
        expect(style.getPropertyValue('font-size-adjust')).toBe('')

        // Priority
        style.setProperty('font-weight', '400', 'important')
        expect(style.getPropertyValue('font-weight')).toBe('')
        style.cssText = 'font-weight: 400 !important'
        expect(style.getPropertyValue('font-weight')).toBe('')

        // CSS-wide keyword
        style.fontWeight = 'initial'
        expect(style.fontWeight).toBe('')
        style.setProperty('font-weight', 'inherit')
        expect(style.getPropertyValue('font-weight')).toBe('')
        style.cssText = 'font-weight: unset'
        expect(style.getPropertyValue('font-weight')).toBe('')

        // Custom variable
        style.fontWeight = 'var(--custom)'
        expect(style.fontWeight).toBe('')
        style.setProperty('font-weight', 'var(--custom)')
        expect(style.getPropertyValue('font-weight')).toBe('')
        style.cssText = 'font-weight: var(--custom)'
        expect(style.getPropertyValue('font-weight')).toBe('')
    })
    it('stores a valid declaration', () => {

        const style = createStyleBlock({ parentRule })

        // Descriptor specific value
        // style.fontDisplay = 'auto' // Not supported yet
        // expect(style.fontDisplay).toBe('auto') // Not supported yet
        style.setProperty('font-display', 'block')
        expect(style.getPropertyValue('font-display')).toBe('block')
        style.cssText = 'font-display: swap'
        expect(style.getPropertyValue('font-display')).toBe('swap')

        // Property specific value
        style.fontWeight = '100 200'
        expect(style.fontWeight).toBe('100 200')
        style.setProperty('font-weight', '300 400')
        expect(style.getPropertyValue('font-weight')).toBe('300 400')
        style.cssText = 'font-weight: 500 600'
        expect(style.getPropertyValue('font-weight')).toBe('500 600')
    })
})
describe('CSSKeyframeRule.style', () => {

    const parentStyleSheet = { _rules: [], type: 'text/css' }
    const keyframesRule = {
        parentStyleSheet,
        type: new Set(['at-rule', 'keyframes']),
    }
    const parentRule = {
        parentRule: keyframesRule,
        parentStyleSheet,
        type: new Set(['qualified-rule', 'keyframe']),
    }

    it('does not store an invalid declaration', () => {

        const style = createStyleBlock({ parentRule })

        // Invalid name
        style.animationDelay = '1s'
        expect(style.animationDelay).toBe('')
        style.setProperty('animation-delay', '1s')
        expect(style.animationDelay).toBe('')
        style.cssText = 'animation-delay: 1s'
        expect(style.animationDelay).toBe('')

        // Priority
        style.setProperty('color', 'red', 'important')
        expect(style.color).toBe('')
        style.cssText = 'color: red !important'
        expect(style.color).toBe('')
    })
    it('stores a valid declaration', () => {

        const style = createStyleBlock({ parentRule })

        // Property specific value
        style.color = 'red'
        expect(style.color).toBe('red')
        style.setProperty('color', 'orange')
        expect(style.color).toBe('orange')
        style.cssText = 'color: green'
        expect(style.color).toBe('green')

        // CSS-wide keyword
        style.color = 'initial'
        expect(style.color).toBe('initial')
        style.setProperty('color', 'inherit')
        expect(style.color).toBe('inherit')
        style.cssText = 'color: unset'
        expect(style.color).toBe('unset')

        // Custom variable
        style.color = 'var(--red)'
        expect(style.color).toBe('var(--red)')
        style.setProperty('color', 'var(--orange)')
        expect(style.color).toBe('var(--orange)')
        style.cssText = 'color: var(--green)'
        expect(style.color).toBe('var(--green)')
    })
})
describe('CSSMarginRule.style', () => {

    const parentStyleSheet = { _rules: [], type: 'text/css' }
    const pageRule = {
        parentStyleSheet,
        type: new Set(['at-rule', 'page']),
    }
    const parentRule = {
        parentRule: pageRule,
        parentStyleSheet,
        type: new Set(['at-rule', 'margin']),
    }

    it('does not store an invalid declaration', () => {

        const style = createStyleBlock({ parentRule })

        // Invalid name
        style.top = '1px'
        expect(style.top).toBe('')
        style.setProperty('top', '1px')
        expect(style.getPropertyValue('top')).toBe('')
        style.cssText = 'top: 1px'
        expect(style.getPropertyValue('top')).toBe('')
    })
    it('stores a valid declaration', () => {

        const style = createStyleBlock({ parentRule })

        // Property specific value
        style.color = 'red'
        expect(style.color).toBe('red')
        style.setProperty('color', 'orange')
        expect(style.color).toBe('orange')
        style.cssText = 'color: green'
        expect(style.color).toBe('green')

        // Priority
        style.setProperty('color', 'orange', 'important')
        expect(style.color).toBe('orange')
        expect(style.getPropertyPriority('color')).toBe('important')
        style.cssText = 'color: green !important'
        expect(style.color).toBe('green')
        expect(style.getPropertyPriority('color')).toBe('important')

        // CSS-wide keyword
        style.color = 'initial'
        expect(style.color).toBe('initial')
        style.setProperty('color', 'inherit')
        expect(style.color).toBe('inherit')
        style.cssText = 'color: unset'
        expect(style.color).toBe('unset')

        // Custom variable
        style.color = 'var(--red)'
        expect(style.color).toBe('var(--red)')
        style.setProperty('color', 'var(--orange)')
        expect(style.color).toBe('var(--orange)')
        style.cssText = 'color: var(--green)'
        expect(style.color).toBe('var(--green)')
    })
})
describe('CSSPageRule.style', () => {

    const parentRule = {
        parentStyleSheet: { _rules: [], type: 'text/css' },
        type: new Set(['at-rule', 'page']),
    }

    it('does not store an invalid declaration', () => {

        const style = createStyleBlock({ parentRule })

        // Invalid name
        style.top = '1px'
        expect(style.top).toBe('')
        style.setProperty('top', '1px')
        expect(style.getPropertyValue('top')).toBe('')
        style.cssText = 'top: 1px'
        expect(style.getPropertyValue('top')).toBe('')

        // CSS-wide keyword
        // style.size = 'initial' // Not supported yet
        // expect(style.size).toBe('') // Not supported yet
        style.setProperty('size', 'inherit')
        expect(style.getPropertyValue('size')).toBe('')
        style.cssText = 'size: unset'
        expect(style.getPropertyValue('size')).toBe('')

        // Custom variable
        // style.size = 'var(--custom)' // Not supported yet
        // expect(style.size).toBe('') // Not supported yet
        style.setProperty('size', 'var(--custom)')
        expect(style.getPropertyValue('size')).toBe('')
        style.cssText = 'size: var(--custom)'
        expect(style.getPropertyValue('size')).toBe('')
    })
    it('stores a valid declaration', () => {

        const style = createStyleBlock({ parentRule })

        // Descriptor specific value
        // style.size = '1px' // Not supported yet
        // expect(style.size).toBe('1px') // Not supported yet
        style.setProperty('size', '1px')
        expect(style.getPropertyValue('size')).toBe('1px')
        style.cssText = 'size: 2px'
        expect(style.getPropertyValue('size')).toBe('2px')

        // Property specific value
        style.color = 'red'
        expect(style.color).toBe('red')
        style.setProperty('color', 'red')
        expect(style.color).toBe('red')
        style.cssText = 'color: red'
        expect(style.color).toBe('red')

        // Priority
        style.setProperty('size', '1px', 'important')
        expect(style.getPropertyValue('size')).toBe('1px')
        expect(style.getPropertyPriority('size')).toBe('important')
        style.cssText = 'size: 1px !important'
        expect(style.getPropertyValue('size')).toBe('1px')
        expect(style.getPropertyPriority('size')).toBe('important')
        style.setProperty('color', 'orange', 'important')
        expect(style.color).toBe('orange')
        expect(style.getPropertyPriority('color')).toBe('important')
        style.cssText = 'color: green !important'
        expect(style.color).toBe('green')
        expect(style.getPropertyPriority('color')).toBe('important')

        // CSS-wide keyword
        style.color = 'initial'
        expect(style.color).toBe('initial')
        style.setProperty('color', 'inherit')
        expect(style.color).toBe('inherit')
        style.cssText = 'color: unset'
        expect(style.color).toBe('unset')

        // Custom variable
        style.color = 'var(--red)'
        expect(style.color).toBe('var(--red)')
        style.setProperty('color', 'var(--orange)')
        expect(style.color).toBe('var(--orange)')
        style.cssText = 'color: var(--green)'
        expect(style.color).toBe('var(--green)')
    })
})

describe('--*', () => {
    it('fails to parse an invalid value', () => {
        const style = createStyleBlock()
        const invalid = [
            // <bad-string-token>
            '"\n"',
            // <bad-url-token>
            'url(inval id.url)',
            'url(inval\nid.url)',
            'url(inval\tid.url)',
            'url(inval"id.url)',
            "url(inval'id.url)",
            'url(inval(id.url)',
            'url(inval\u0001id.url)',
            'url(inval\\\nid.url)',
            // Unmatched block associated token
            ')',
            ']',
            '}',
            // Top-level `;` or `!`
            ';',
            '!',
            // Invalid custom variable
            'var(--)',
        ]
        invalid.forEach(input => {
            style.setProperty('--custom', input)
            expect(style.getPropertyValue('--custom')).toBe('')
        })
    })
    it('parses and serializes a valid value', () => {

        const style = createStyleBlock()

        style.setProperty('--custom', 'red')
        expect(style.getPropertyValue('--custom')).toBe('red')
        style.cssText = '--custom: green'
        expect(style.getPropertyValue('--custom')).toBe('green')
        style.removeProperty('--custom')
        expect(style.getPropertyValue('--custom')).toBe('')

        // custom properties are not attributes
        style['--custom'] = 'blue'
        expect(style.getPropertyValue('--custom')).toBe('')

        // custom properties are case-sensitive
        expect(style.getPropertyValue('--Custom')).toBe('')

        // Whitespaces and comments
        const input = '  /* comment */  Red  ,  (  orange  /* comment */  )  ,  green  /* comment */  '
        const trimmed = 'Red  ,  (  orange  /* comment */  )  ,  green'
        style.setProperty('--custom', input)
        expect(style.getPropertyValue('--custom')).toBe(trimmed)
        expect(style.cssText).toBe(`--custom: ${trimmed};`)
        style.cssText = `--custom:  ${input}`
        expect(style.getPropertyValue('--custom')).toBe(trimmed)
        expect(style.cssText).toBe(`--custom: ${trimmed};`)
        style.setProperty('--custom', '  /* comment */  ')
        expect(style.getPropertyValue('--custom')).toBe('')
        expect(style.cssText).toBe('--custom: ;')
        style.cssText = '--custom:  /* comment */  '
        expect(style.getPropertyValue('--custom')).toBe('')
        expect(style.cssText).toBe('--custom: ;')
        style.cssText = '--custom:'
        expect(style.getPropertyValue('--custom')).toBe('')
        expect(style.cssText).toBe('--custom: ;')

        // Guaranteed-invalid value (initial)
        style.setProperty('--custom', 'initial')
        expect(style.getPropertyValue('--custom')).toBe('initial')
        expect(style.cssText).toBe('--custom: initial;')
    })
})
describe('border-bottom-left-radius, border-bottom-right-radius, border-top-left-radius, border-top-right-radius', () => {
    it('parses and serializes a valid value', () => {
        const style = createStyleBlock()
        style.borderBottomLeftRadius = '1px 1px'
        expect(style.borderBottomLeftRadius).toBe('1px')
        style.borderBottomLeftRadius = '1px 2px'
        expect(style.borderBottomLeftRadius).toBe('1px 2px')
    })
})
describe('border-image-outset, mask-border-outset', () => {
    it('parses and serializes a valid value', () => {
        const style = createStyleBlock()
        style.borderImageOutset = '0 1 2 2'
        expect(style.borderImageOutset).toBe('0 1 2 2')
        style.borderImageOutset = '0 1 2 1'
        expect(style.borderImageOutset).toBe('0 1 2')
        style.borderImageOutset = '0 1 0'
        expect(style.borderImageOutset).toBe('0 1')
        style.borderImageOutset = '0 0'
        expect(style.borderImageOutset).toBe('0')
    })
})
describe('border-image-repeat, mask-border-repeat', () => {
    it('parses and serializes a valid value', () => {
        const style = createStyleBlock()
        style.borderImageRepeat = 'stretch stretch'
        expect(style.borderImageRepeat).toBe('stretch')
    })
})
describe('border-image-slice, mask-border-slice', () => {
    it('parses and serializes a valid value', () => {
        const style = createStyleBlock()
        style.borderImageSlice = '0 1 2 2 fill'
        expect(style.borderImageSlice).toBe('0 1 2 2 fill')
        style.borderImageSlice = '0 1 2 1'
        expect(style.borderImageSlice).toBe('0 1 2')
        style.borderImageSlice = '0 1 0 fill'
        expect(style.borderImageSlice).toBe('0 1 fill')
        style.borderImageSlice = '0 0'
        expect(style.borderImageSlice).toBe('0')
    })
})
describe('border-image-width, mask-border-width', () => {
    it('parses and serializes a valid value', () => {
        const style = createStyleBlock()
        style.borderImageWidth = '0 1 2 2'
        expect(style.borderImageWidth).toBe('0 1 2 2')
        style.borderImageWidth = '0 1 2 1'
        expect(style.borderImageWidth).toBe('0 1 2')
        style.borderImageWidth = '0 1 0'
        expect(style.borderImageWidth).toBe('0 1')
        style.borderImageWidth = '0 0'
        expect(style.borderImageWidth).toBe('0')
    })
})
describe('break-after, break-before, page-break-after, page-break-before', () => {
    it('fails to parse an invalid value', () => {

        const style = createStyleBlock()

        // Unmapped target value
        style.pageBreakAfter = 'recto'
        expect(style.breakAfter).toBe('')
        expect(style.pageBreakAfter).toBe('')
        expect(style.cssText).toBe('')
    })
    it('parses and serializes a valid value', () => {

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
    it('fails to parse an invalid value', () => {

        const style = createStyleBlock()

        // Unmapped target value
        style.pageBreakInside = 'avoid-page'
        expect(style.breakInside).toBe('')
        expect(style.pageBreakInside).toBe('')
        expect(style.cssText).toBe('')
    })
    it('parses and serializes a valid value', () => {

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
describe('container-name', () => {
    it('fails to parse an invalid value', () => {
        const style = createStyleBlock()
        const invalid = ['and', 'or', 'not', 'name none']
        invalid.forEach(input => {
            style.containerName = input
            expect(style.containerName).toBe('')
        })
    })
    it('parses and serializes a valid value', () => {
        const style = createStyleBlock()
        style.containerName = 'none'
        expect(style.containerName).toBe('none')
    })
})
describe('float', () => {
    it('mirrors cssFloat', () => {
        const style = createStyleBlock()
        style.cssFloat = 'left'
        expect(style.float).toBe('left')
        expect(style.cssText).toBe('float: left;')
        style.setProperty('float', 'right')
        expect(style.cssFloat).toBe('right')
    })
})
// TODO: fix `value` of `glyph-orientation-vertical`
describe.skip('glyph-orientation-vertical, text-orientation', () => {
    it('parses and serializes a valid value', () => {

        const style = createStyleBlock()

        // Legacy mapped value
        const mapping = [
            ['auto', 'mixed'],
            ['0deg', 'upright'],
            ['90deg', 'sideways'],
        ]
        mapping.forEach(([legacy, value]) => {
            style.textOrientation = value
            expect(style.textOrientation).toBe(value)
            expect(style.glyphOrientationVertical).toBe(legacy)
            expect(style.cssText).toBe(`text-orientation: ${value};`)
            style.cssText = ''
            style.glyphOrientationVertical = legacy
            expect(style.textOrientation).toBe(value)
            expect(style.glyphOrientationVertical).toBe(legacy)
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
describe('grid-template-areas', () => {
    it('fails to parse an invalid value', () => {
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
    it('parses and serializes a valid value', () => {
        const style = createStyleBlock()
        style.gridTemplateAreas = '"  a  .b.  c  " "a . . . c'
        expect(style.gridTemplateAreas).toBe('"a . b . c" "a . . . c"')
    })
})
describe('grid-template-columns, grid-template-rows', () => {
    it('parses and serializes a valid value', () => {

        const style = createStyleBlock()

        // Empty line names are omitted except for subgrid axis (browser conformance)
        style.gridTemplateRows = 'subgrid [] repeat(1, [] [a] [])'
        expect(style.gridTemplateRows).toBe('subgrid [] repeat(1, [] [a] [])')
        style.gridTemplateRows = '[] 1px [] repeat(1, [] 1px []) [] repeat(1, [] 1fr [])'
        expect(style.gridTemplateRows).toBe('1px repeat(1, 1px) repeat(1, 1fr)')
        style.gridTemplateRows = '[] repeat(auto-fill, [] 1px []) []'
        expect(style.gridTemplateRows).toBe('repeat(auto-fill, 1px)')
    })
})
describe('image-rendering', () => {
    it('parses and serializes a valid value', () => {
        const style = createStyleBlock()
        // Legacy mapped value
        style.imageRendering = 'optimizeSpeed'
        expect(style.imageRendering).toBe('optimizespeed')
        style.imageRendering = 'optimizeQuality'
        expect(style.imageRendering).toBe('optimizequality')
    })
})

describe('-webkit-line-clamp', () => {
    it.todo('parses longhand declarations from a shorthand value')
    it.todo('serializes a shorthand value from the declarations of its longhands')
})
describe('-webkit-text-stroke', () => {
    it.todo('parses longhand declarations from a shorthand value')
    it.todo('serializes a shorthand value from the declarations of its longhands')
})
describe('all', () => {

    const longhands = shorthands.get('all')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        longhands.forEach(longhand => style[longhand] = 'initial')
        expect(style).toHaveLength(longhands.length)
        expect(style[longhands[0]]).toBe('initial')
        expect(style.all).toBe('initial')
        expect(style.cssText).toBe('all: initial;')
        expect(style.direction).toBe('')
        expect(style.unicodeBidi).toBe('')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // All equal longhand values
        longhands.forEach(longhand => style[longhand] = 'initial')
        expect(style.all).toBe('initial')
        expect(style.cssText).toBe('all: initial;')

        // Not all equal longhand values
        const [head, ...tail] = longhands
        const exclude = ['all', 'border', 'text-decoration-skip']
        const initial = tail.reduce(
            (properties, property) => {
                for (const [shorthand, longhands] of shorthands) {
                    if (longhands.length === 1 || exclude.includes(shorthand)) {
                        continue
                    }
                    if (longhands.includes(property)) {
                        if (property === 'corner-shape') {
                            properties.add('border-end-end-radius')
                            properties.add('border-end-start-radius')
                            properties.add('border-start-end-radius')
                            properties.add('border-start-start-radius')
                            properties.add('corners')
                        } else {
                            properties.add(shorthand)
                        }
                        return properties
                    }
                }
                return properties.add(property)
            },
            new Set())
        style[head] = 'inherit'
        expect(style.all).toBe('')
        expect(style.cssText).toBe(`${head}: inherit; ${[...initial].map(name => `${name}: initial`).join('; ')};`)
    })
})
describe('animation', () => {

    const longhands = shorthands.get('animation')
    const animation = '0s ease 0s 1 normal none running none auto'

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.animation = animation
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.animation).toBe(animation)
        expect(style.cssText).toBe(`animation: ${animation};`)

        // Missing longhand values
        style.animation = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.animation).toBe(animation)
        expect(style.cssText).toBe(`animation: ${animation};`)

        // Repeated longhand values
        const repeated = `${animation}, ${animation}`
        style.animation = repeated
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.animation).toBe(repeated)
        expect(style.cssText).toBe(`animation: ${repeated};`)

        // More than one animation
        style.animation = 'animation-1, animation-2'
        longhands.forEach(longhand =>
            expect(style[longhand])
                .toBe(longhand === 'animation-name'
                    ? 'animation-1, animation-2'
                    : `${initial(longhand)}, ${initial(longhand)}`))
        expect(style.animation).toBe('0s ease 0s 1 normal none running animation-1 auto, 0s ease 0s 1 normal none running animation-2 auto')
        expect(style.cssText).toBe('animation: 0s ease 0s 1 normal none running animation-1 auto, 0s ease 0s 1 normal none running animation-2 auto;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.animation).toBe(animation)
        expect(style.cssText).toBe(`animation: ${animation};`)

        // Excess of animation-name values
        longhands.forEach(longhand =>
            style[longhand] = longhand === 'animation-name'
                ? 'animation-1, animation-2'
                : initial(longhand))
        expect(style.background).toBe('')
        expect(style.cssText).toBe('animation-duration: 0s; animation-timing-function: ease; animation-delay: 0s; animation-iteration-count: 1; animation-direction: normal; animation-fill-mode: none; animation-play-state: running; animation-name: animation-1, animation-2; animation-timeline: auto;')

        // Lack of animation-name values
        longhands.forEach(longhand =>
            style[longhand] = longhand === 'animation-name'
                ? 'animation-1'
                : `${initial(longhand)}, ${initial(longhand)}`)
        expect(style.background).toBe('')
        expect(style.cssText).toBe('animation-duration: 0s, 0s; animation-timing-function: ease, ease; animation-delay: 0s, 0s; animation-iteration-count: 1, 1; animation-direction: normal, normal; animation-fill-mode: none, none; animation-play-state: running, running; animation-name: animation-1; animation-timeline: auto, auto;')
    })
})
describe('animation-delay', () => {
    it.todo('parses longhand declarations from a shorthand value')
    it.todo('serializes a shorthand value from the declarations of its longhands')
})
describe('background', () => {

    const longhands = shorthands.get('background')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values (repeated)
        style.background = 'transparent none 0% 0% / auto repeat scroll padding-box border-box'
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
        style.cssText = 'background: url("img.jpg") !important'
        longhands.forEach(longhand => {
            expect(style[longhand])
                .toBe(longhand === 'background-image'
                    ? 'url("img.jpg")'
                    : initial(longhand))
            expect(style.getPropertyPriority(longhand)).toBe('important')
        })
        expect(style.background).toBe('url("img.jpg")')
        expect(style.cssText).toBe('background: url("img.jpg") !important;')
        expect(style.getPropertyPriority('background')).toBe('important')

        // CSS-wide keyword
        style.background = 'initial'
        longhands.forEach(longhand => expect(style[longhand]).toBe('initial'))
        expect(style.background).toBe('initial')
        expect(style.cssText).toBe('background: initial;')

        // Pending-substitution value
        style.background = 'var(--custom)'
        longhands.forEach(longhand => expect(style[longhand]).toBe(''))
        expect(style.background).toBe('var(--custom)')
        expect(style.cssText).toBe('background: var(--custom);')

        // Repeated longhand values
        style.background = 'none, transparent'
        longhands.forEach(longhand =>
            expect(style[longhand])
                .toBe(longhand === 'background-color'
                    ? initial(longhand)
                    : `${initial(longhand)}, ${initial(longhand)}`))
        expect(style.background).toBe('none, none')
        expect(style.cssText).toBe('background: none, none;')

        // Single <box>
        style.background = 'content-box'
        longhands.forEach(longhand =>
            expect(style[longhand])
                .toBe((longhand === 'background-origin' || longhand === 'background-clip')
                    ? 'content-box'
                    : initial(longhand)))
        expect(style.background).toBe('content-box')
        expect(style.cssText).toBe('background: content-box;')

        // Same <box>
        style.background = 'content-box content-box'
        longhands.forEach(longhand =>
            expect(style[longhand])
                .toBe((longhand === 'background-origin' || longhand === 'background-clip')
                    ? 'content-box'
                    : initial(longhand)))
        expect(style.background).toBe('content-box')
        expect(style.cssText).toBe('background: content-box;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.background).toBe('none')
        expect(style.cssText).toBe('background: none;')

        // Missing longhand declaration
        style.backgroundImage = ''
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; background-color: transparent;')
        style.backgroundImage = initial('background-image')

        // Important
        longhands.forEach(longhand => style.setProperty(longhand, initial(longhand), 'important'))
        expect(style.background).toBe('none')
        expect(style.cssText).toBe('background: none !important;')
        style.backgroundImage = ''
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-position: 0% 0% !important; background-size: auto !important; background-repeat: repeat !important; background-attachment: scroll !important; background-origin: padding-box !important; background-clip: border-box !important; background-color: transparent !important;')

        // CSS-wide keyword
        longhands.forEach(longhand => style[longhand] = 'initial')
        expect(style.background).toBe('initial')
        expect(style.cssText).toBe('background: initial;')
        style.backgroundImage = ''
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: initial;')

        // Substitution value
        longhands.forEach(longhand => style[longhand] = 'var(--custom)')
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-position: var(--custom); background-size: var(--custom); background-repeat: var(--custom); background-attachment: var(--custom); background-origin: var(--custom); background-clip: var(--custom); background-color: var(--custom); background-image: var(--custom);')
        style.background = 'var(--custom)'
        style.backgroundImage = 'var(--custom)'
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-position: ; background-size: ; background-repeat: ; background-attachment: ; background-origin: ; background-clip: ; background-color: ; background-image: var(--custom);')

        // Excess of background-image values
        longhands.forEach(longhand =>
            style[longhand] = longhand === 'background-image'
                ? 'url(bg-1.jpg), url(bg-2.jpg)'
                : initial(longhand))
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; background-color: transparent; background-image: url("bg-1.jpg"), url("bg-2.jpg");')

        // Lack of background-image values
        longhands.forEach(longhand =>
            style[longhand] = longhand === 'background-image'
                ? 'url(bg-1.jpg)'
                : `${initial(longhand)}, ${initial(longhand)}`)
        expect(style.background).toBe('')
        expect(style.cssText).toBe('background-position: 0% 0%, 0% 0%; background-size: auto, auto; background-repeat: repeat, repeat; background-attachment: scroll, scroll; background-origin: padding-box, padding-box; background-clip: border-box, border-box; background-color: transparent; background-image: url("bg-1.jpg");')
    })
})
describe('background-position', () => {
    it('parses and serializes a valid value', () => {

        const style = createStyleBlock()

        /**
         * https://github.com/w3c/csswg-drafts/issues/2274
         *
         * - serialize to 2 or 4 values
         * - serialize specified keywords (except `center`) in 3 values form
         * - serialize with `left`, `top`, or a percentage, when missing in 3
         * values form
         */
        const valid = [
            ['left', 'left center'],
            ['top', 'center top'],
            ['center', 'center center'],
            ['0px', '0px center'],
            ['center center'],
            ['left 0px top', 'left 0px top 0%'],
            ['left 0px center', 'left 0px top 50%'],
            ['left 0px bottom', 'left 0px bottom 0%'],
            ['left 0px bottom 100%', 'left 0px bottom 100%'],
            ['center top 0px', 'left 50% top 0px'],
            ['right top 0px', 'right 0% top 0px'],
            ['left 50% top 50%'],
        ]
        valid.forEach(([input, expected = input]) => {
            style.backgroundPosition = input
            expect(style.backgroundPosition).toBe(expected)
            expect(style.cssText).toBe(`background-position: ${expected};`)
        })
    })
})
describe('block-step', () => {

    const longhands = shorthands.get('block-step')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.blockStep = 'none margin auto up'
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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.blockStep).toBe('none')
        expect(style.cssText).toBe('block-step: none;')
    })
})
describe('border', () => {

    const longhands = shorthands.get('border')

    it('parses longhand declarations from a shorthand value', () => {

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
    it('serializes a shorthand value from the declarations of its longhands', () => {

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
    })
})
describe('border-block, border-inline', () => {

    const longhands = shorthands.get('border-block')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderBlock = 'medium none currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlock).toBe('medium')
        expect(style.cssText).toBe('border-block: medium;')

        // Missing longhand values
        style.borderBlock = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlock).toBe('medium')
        expect(style.cssText).toBe('border-block: medium;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

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

    const longhands = shorthands.get('border-block-color')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderBlockColor = 'currentColor currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlockColor).toBe('currentcolor')
        expect(style.cssText).toBe('border-block-color: currentcolor;')

        // Implicit values
        style.borderBlockColor = 'green'
        longhands.forEach(longhand => expect(style[longhand]).toBe('green'))
        expect(style.borderBlockColor).toBe('green')
        expect(style.cssText).toBe('border-block-color: green;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderBlockColor).toBe('currentcolor')
        expect(style.cssText).toBe('border-block-color: currentcolor;')
    })
})
describe('border-block-style, border-inline-style', () => {

    const longhands = shorthands.get('border-block-style')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderBlockStyle = 'none none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlockStyle).toBe('none')
        expect(style.cssText).toBe('border-block-style: none;')

        // Implicit values
        style.borderBlockStyle = 'solid'
        longhands.forEach(longhand => expect(style[longhand]).toBe('solid'))
        expect(style.borderBlockStyle).toBe('solid')
        expect(style.cssText).toBe('border-block-style: solid;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderBlockStyle).toBe('none')
        expect(style.cssText).toBe('border-block-style: none;')
    })
})
describe('border-block-width, border-inline-width', () => {

    const longhands = shorthands.get('border-block-width')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderBlockWidth = 'medium medium'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderBlockWidth).toBe('medium')
        expect(style.cssText).toBe('border-block-width: medium;')

        // Implicit values
        style.borderBlockWidth = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.borderBlockWidth).toBe('1px')
        expect(style.cssText).toBe('border-block-width: 1px;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderBlockWidth).toBe('medium')
        expect(style.cssText).toBe('border-block-width: medium;')
    })
})
describe('border-bottom, border-left, border-right, border-top', () => {

    const longhands = shorthands.get('border-top')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderTop = 'medium none currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderTop).toBe('medium')
        expect(style.cssText).toBe('border-top: medium;')

        // Missing longhand values
        style.borderTop = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderTop).toBe('medium')
        expect(style.cssText).toBe('border-top: medium;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderTop).toBe('medium')
        expect(style.cssText).toBe('border-top: medium;')
    })
})
describe('border-clip', () => {
    it.todo('parses longhand declarations from a shorthand value')
    it.todo('serializes a shorthand value from the declarations of its longhands')
})
describe('border-color', () => {

    const longhands = shorthands.get('border-color')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderColor = 'currentColor currentColor currentColor currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderColor).toBe('currentcolor')
        expect(style.cssText).toBe('border-color: currentcolor;')

        // Implicit values
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
    it('serializes a shorthand value from the declarations of its longhands', () => {

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

    const longhands = shorthands.get('border-image')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderImage = 'none 100% / 1 / 0 stretch'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderImage).toBe('none')
        expect(style.cssText).toBe('border-image: none;')

        // Missing longhand values
        style.borderImage = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderImage).toBe('none')
        expect(style.cssText).toBe('border-image: none;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderImage).toBe('none')
        expect(style.cssText).toBe('border-image: none;')
    })
})
describe('border-radius', () => {

    const longhands = shorthands.get('border-radius')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderRadius = '0 0 0 0 / 0 0 0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderRadius).toBe('0px')
        expect(style.cssText).toBe('border-radius: 0px;')

        // Implicit values
        style.borderRadius = '1px'
        longhands.forEach(longhand => expect(style[longhand]).toBe('1px'))
        expect(style.borderRadius).toBe('1px')
        expect(style.cssText).toBe('border-radius: 1px;')
        style.borderRadius = '1px / calc(1px)'
        expect(style.borderTopLeftRadius).toBe('1px calc(1px)')
        expect(style.borderTopRightRadius).toBe('1px calc(1px)')
        expect(style.borderBottomRightRadius).toBe('1px calc(1px)')
        expect(style.borderBottomLeftRadius).toBe('1px calc(1px)')
        expect(style.borderRadius).toBe('1px / calc(1px)')
        expect(style.cssText).toBe('border-radius: 1px / calc(1px);')
        style.borderRadius = '1px / 2px'
        expect(style.borderTopLeftRadius).toBe('1px 2px')
        expect(style.borderTopRightRadius).toBe('1px 2px')
        expect(style.borderBottomRightRadius).toBe('1px 2px')
        expect(style.borderBottomLeftRadius).toBe('1px 2px')
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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderRadius).toBe('0px')
        expect(style.cssText).toBe('border-radius: 0px;')
    })
})
describe('border-style', () => {

    const longhands = shorthands.get('border-style')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderStyle = 'none none none none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderStyle).toBe('none')
        expect(style.cssText).toBe('border-style: none;')

        // Implicit values
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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderStyle).toBe('none')
        expect(style.cssText).toBe('border-style: none;')
    })
})
describe('border-width', () => {

    const longhands = shorthands.get('border-width')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.borderWidth = 'medium medium medium medium'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.borderWidth).toBe('medium')
        expect(style.cssText).toBe('border-width: medium;')

        // Implicit values
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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.borderWidth).toBe('medium')
        expect(style.cssText).toBe('border-width: medium;')
    })
})
describe('caret', () => {

    const longhands = shorthands.get('caret')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.caret = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.caret).toBe('auto')
        expect(style.cssText).toBe('caret: auto;')

        // Missing longhand values
        style.caret = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.caret).toBe('auto')
        expect(style.cssText).toBe('caret: auto;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.caret).toBe('auto')
        expect(style.cssText).toBe('caret: auto;')
    })
})
describe('column-rule', () => {

    const longhands = shorthands.get('column-rule')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.columnRule = 'medium none currentColor'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.columnRule).toBe('medium')
        expect(style.cssText).toBe('column-rule: medium;')

        // Missing longhand values
        style.columnRule = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.columnRule).toBe('medium')
        expect(style.cssText).toBe('column-rule: medium;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.columnRule).toBe('medium')
        expect(style.cssText).toBe('column-rule: medium;')
    })
})
describe('columns', () => {

    const longhands = shorthands.get('columns')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.columns = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.columns).toBe('auto')
        expect(style.cssText).toBe('columns: auto;')

        // Missing longhand values
        style.columns = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.columns).toBe('auto')
        expect(style.cssText).toBe('columns: auto;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.columns).toBe('auto')
        expect(style.cssText).toBe('columns: auto;')
    })
})
describe('contain-intrinsic-size', () => {

    const longhands = shorthands.get('contain-intrinsic-size')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.containIntrinsicSize = 'none none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.containIntrinsicSize).toBe('none')
        expect(style.cssText).toBe('contain-intrinsic-size: none;')

        // Missing longhand values
        style.containIntrinsicSize = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.containIntrinsicSize).toBe('none')
        expect(style.cssText).toBe('contain-intrinsic-size: none;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.containIntrinsicSize).toBe('none')
        expect(style.cssText).toBe('contain-intrinsic-size: none;')
    })
})
describe('container', () => {

    const longhands = shorthands.get('container')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.container = 'none / normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.container).toBe('none')
        expect(style.cssText).toBe('container: none;')

        // Missing longhand values
        style.container = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.container).toBe('none')
        expect(style.cssText).toBe('container: none;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.container).toBe('none')
        expect(style.cssText).toBe('container: none;')
    })
})
describe('corners', () => {

    const longhands = shorthands.get('corners')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.corners = 'round 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.corners).toBe('round')
        expect(style.cssText).toBe('corners: round;')

        // Missing longhand values
        style.corners = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.corners).toBe('round')
        expect(style.cssText).toBe('corners: round;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.corners).toBe('round')
        expect(style.cssText).toBe('corners: round;')
    })
})
describe('cue, pause, rest', () => {

    const longhands = shorthands.get('cue')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.cue = 'none none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.cue).toBe('none')
        expect(style.cssText).toBe('cue: none;')

        // Missing longhand values
        style.cue = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.cue).toBe('none')
        expect(style.cssText).toBe('cue: none;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.cue).toBe('none')
        expect(style.cssText).toBe('cue: none;')
    })
})
describe('flex', () => {

    const longhands = shorthands.get('flex')

    it('parses longhand declarations from a shorthand value', () => {

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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.flex).toBe('0 auto')
        expect(style.cssText).toBe('flex: 0 auto;')
    })
})
describe('flex-flow', () => {

    const longhands = shorthands.get('flex-flow')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.flexFlow = 'row nowrap'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.flexFlow).toBe('row')
        expect(style.cssText).toBe('flex-flow: row;')

        // Missing longhand values
        style.flexFlow = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.flexFlow).toBe('row')
        expect(style.cssText).toBe('flex-flow: row;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.flexFlow).toBe('row')
        expect(style.cssText).toBe('flex-flow: row;')
    })
})
describe('font', () => {

    const longhands = shorthands.get('font')

    it('parses longhand declarations from a shorthand value', () => {

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

        // System font
        style.font = 'caption'
        longhands.forEach(longhand =>
            expect(style[longhand])
                .toBe(longhand === 'font-family'
                    ? ''
                    : initial(longhand)))
        expect(style.font).toBe('caption')
        expect(style.cssText).toBe('font: caption;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.font).toBe('medium monospace')
        expect(style.cssText).toBe('font: medium monospace;')

        // Non CSS2 font-variant property
        style.fontVariantCaps = 'all-petite-caps'
        expect(style.font).toBe('')
        expect(style.cssText).toBe('font-style: normal; font-variant: all-petite-caps; font-weight: normal; font-stretch: normal; font-size: medium; line-height: normal; font-family: monospace; font-feature-settings: normal; font-kerning: auto; font-language-override: normal; font-optical-sizing: auto; font-palette: normal; font-size-adjust: none; font-variation-settings: normal;')
        style.fontVariantCaps = initial('font-variant-caps')

        // Non CSS3 font-stretch property
        style.fontStretch = '110%'
        expect(style.font).toBe('')
        expect(style.cssText).toBe('font-style: normal; font-variant: normal; font-weight: normal; font-stretch: 110%; font-size: medium; line-height: normal; font-family: monospace; font-feature-settings: normal; font-kerning: auto; font-language-override: normal; font-optical-sizing: auto; font-palette: normal; font-size-adjust: none; font-variation-settings: normal;')
    })
})
describe('font-variant', () => {

    const longhands = shorthands.get('font-variant')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.fontVariant = 'normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.fontVariant).toBe('normal')
        expect(style.cssText).toBe('font-variant: normal;')

        // Missing longhand values
        style.fontVariant = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.fontVariant).toBe('normal')
        expect(style.cssText).toBe('font-variant: normal;')

        // none
        style.fontVariant = 'none'
        longhands.forEach(longhand =>
            expect(style[longhand])
                .toBe(longhand === 'font-variant-ligatures'
                    ? 'none'
                    : initial(longhand)))
        expect(style.fontVariant).toBe('none')
        expect(style.cssText).toBe('font-variant: none;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.fontVariant).toBe('normal')
        expect(style.cssText).toBe('font-variant: normal;')
    })
})
describe('font-synthesis', () => {

    const longhands = shorthands.get('font-synthesis')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.fontSynthesis = 'weight style small-caps'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.fontSynthesis).toBe('weight style small-caps')
        expect(style.cssText).toBe('font-synthesis: weight style small-caps;')

        // Missing longhand values
        const values = [
            ['none', ['none', 'none', 'none']],
            ['weight', ['auto', 'none', 'none']],
            ['style', ['none', 'auto', 'none']],
            ['small-caps', ['none', 'none', 'auto']],
            ['weight style', ['auto', 'auto', 'none']],
            ['weight small-caps', ['auto', 'none', 'auto']],
            ['style small-caps', ['none', 'auto', 'auto']],
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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.fontSynthesis).toBe('weight style small-caps')
        expect(style.cssText).toBe('font-synthesis: weight style small-caps;')
    })
})
describe('gap', () => {

    const longhands = shorthands.get('gap')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.gap = 'normal normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.gap).toBe('normal')
        expect(style.cssText).toBe('gap: normal;')

        // Missing longhand values
        style.gap = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.gap).toBe('normal')
        expect(style.cssText).toBe('gap: normal;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.gap).toBe('normal')
        expect(style.cssText).toBe('gap: normal;')
    })
})
describe('grid', () => {

    const longhands = shorthands.get('grid')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values (not all longhands can be explicitly declared)
        style.grid = 'none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand =>
            expect(style[longhand])
                .toBe(longhand.startsWith('grid-auto')
                    ? initial(longhand)
                    : 'none'))
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
    it('serializes a shorthand value from the declarations of its longhands', () => {

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
        expect(style.cssText).toBe('grid-template: 1px / none; grid-auto-flow: row dense; grid-auto-rows: auto; grid-auto-columns: auto;')
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

    const longhands = shorthands.get('grid-area')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.gridArea = 'auto / auto / auto / auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.gridArea).toBe('auto')
        expect(style.cssText).toBe('grid-area: auto;')

        // Implicit values
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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.gridArea).toBe('auto')
        expect(style.cssText).toBe('grid-area: auto;')
    })
})
describe('grid-column, grid-row', () => {

    const longhands = shorthands.get('grid-column')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.gridColumn = 'auto / auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.gridColumn).toBe('auto')
        expect(style.cssText).toBe('grid-column: auto;')

        // Implicit values
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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.gridColumn).toBe('auto')
        expect(style.cssText).toBe('grid-column: auto;')
    })
})
describe('grid-template', () => {

    const longhands = shorthands.get('grid-template')

    it('parses longhand declarations from a shorthand value', () => {

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
    it('serializes a shorthand value from the declarations of its longhands', () => {

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

    const longhands = shorthands.get('inset')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.inset = 'auto auto auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.inset).toBe('auto')
        expect(style.cssText).toBe('inset: auto;')

        // Implicit values
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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.inset).toBe('auto')
        expect(style.cssText).toBe('inset: auto;')
    })
})
describe('inset-block, inset-inline', () => {

    const longhands = shorthands.get('inset-block')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.insetBlock = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.insetBlock).toBe('auto')
        expect(style.cssText).toBe('inset-block: auto;')

        // Missing longhand values
        style.insetBlock = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.insetBlock).toBe('auto')
        expect(style.cssText).toBe('inset-block: auto;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.insetBlock).toBe('auto')
        expect(style.cssText).toBe('inset-block: auto;')
    })
})
describe('line-clamp', () => {

    const longhands = shorthands.get('line-clamp')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values (not all longhands can be explicitly declared)
        style.lineClamp = 'none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.lineClamp).toBe('none')
        expect(style.cssText).toBe('line-clamp: none;')

        // Missing longhand values
        style.lineClamp = '1 none'
        expect(style.maxLines).toBe('1')
        expect(style.blockEllipsis).toBe('none')
        expect(style.continue).toBe('discard')
        expect(style.lineClamp).toBe('1')
        expect(style.cssText).toBe('line-clamp: 1;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.lineClamp).toBe('none')
        expect(style.cssText).toBe('line-clamp: none;')

        // `continue` cannot be represented when it is `auto` and max-lines is not `none`
        style.maxLines = '1'
        expect(style.lineClamp).toBe('')
        expect(style.cssText).toBe('max-lines: 1; block-ellipsis: none; continue: auto;')
        style.maxLines = initial('max-lines')

        // `block-ellipsis cannot be represented when it is not `none` and `max-lines` is `none`
        style.blockEllipsis = 'auto'
        expect(style.lineClamp).toBe('')
        expect(style.cssText).toBe('max-lines: none; block-ellipsis: auto; continue: auto;')
    })
})
describe('list-style', () => {

    const longhands = shorthands.get('list-style')

    it('parses longhand declarations from a shorthand value', () => {

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

        // none
        style.listStyle = 'none'
        expect(style.listStyleImage).toBe('none')
        expect(style.listStyleType).toBe('none')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.listStyle).toBe('outside')
        expect(style.cssText).toBe('list-style: outside;')
    })
})
describe('margin', () => {

    const longhands = shorthands.get('margin')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.margin = '0 0 0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.margin).toBe('0px')
        expect(style.cssText).toBe('margin: 0px;')

        // Implicit values
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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.margin).toBe('0px')
        expect(style.cssText).toBe('margin: 0px;')
    })
})
describe('margin-block, margin-inline', () => {

    const longhands = shorthands.get('margin-block')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.marginBlock = '0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.marginBlock).toBe('0px')
        expect(style.cssText).toBe('margin-block: 0px;')

        // Missing longhand values
        style.marginBlock = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.marginBlock).toBe('0px')
        expect(style.cssText).toBe('margin-block: 0px;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.marginBlock).toBe('0px')
        expect(style.cssText).toBe('margin-block: 0px;')
    })
})
describe('marker', () => {

    const longhands = shorthands.get('marker')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values (not all longhands can be explicitly declared)
        style.marker = 'none'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.marker).toBe('none')
        expect(style.cssText).toBe('marker: none;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.marker).toBe('none')
        expect(style.cssText).toBe('marker: none;')
    })
})
describe('mask', () => {

    const longhands = shorthands.get('mask')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.mask = 'none 0% 0% / auto repeat border-box border-box add match-source'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.mask).toBe('none')
        expect(style.cssText).toBe('mask: none;')

        // Missing longhand values
        style.mask = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.mask).toBe('none')
        expect(style.cssText).toBe('mask: none;')

        // Repeated longhand values
        style.mask = 'none, 0% 0%'
        longhands.forEach(longhand =>
            expect(style[longhand]).toBe(shorthands.resetOnly.mask.includes(longhand)
                ? initial(longhand)
                : `${initial(longhand)}, ${initial(longhand)}`))
        expect(style.mask).toBe('none, none')
        expect(style.cssText).toBe('mask: none, none;')

        // no-clip
        style.mask = 'border-box no-clip'
        longhands.forEach(longhand =>
            expect(style[longhand])
                .toBe(longhand === 'mask-clip'
                    ? 'no-clip'
                    : initial(longhand)))
        expect(style.mask).toBe('no-clip')
        expect(style.cssText).toBe('mask: no-clip;')

        // Single <geometry-box>
        style.mask = 'fill-box'
        longhands.forEach(longhand =>
            expect(style[longhand])
                .toBe((longhand === 'mask-origin' || longhand === 'mask-clip')
                    ? 'fill-box'
                    : initial(longhand)))
        expect(style.mask).toBe('fill-box')
        expect(style.cssText).toBe('mask: fill-box;')

        // Same <geometry-box>
        style.mask = 'fill-box fill-box'
        longhands.forEach(longhand =>
            expect(style[longhand])
                .toBe((longhand === 'mask-origin' || longhand === 'mask-clip')
                    ? 'fill-box'
                    : initial(longhand)))
        expect(style.mask).toBe('fill-box')
        expect(style.cssText).toBe('mask: fill-box;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.mask).toBe('none')
        expect(style.cssText).toBe('mask: none;')

        // Excess of mask-image values
        longhands.forEach(longhand =>
            style[longhand] = longhand === 'mask-image'
                ? 'url(bg-1.jpg), url(bg-2.jpg)'
                : initial(longhand))
        expect(style.mask).toBe('')
        expect(style.cssText).toBe('mask-image: url("bg-1.jpg"), url("bg-2.jpg"); mask-position: 0% 0%; mask-size: auto; mask-repeat: repeat; mask-origin: border-box; mask-clip: border-box; mask-composite: add; mask-mode: match-source; mask-border: none;')

        // Lack of mask-image values
        longhands.forEach(longhand =>
            style[longhand] = longhand === 'mask-image'
                ? 'url(bg-1.jpg)'
                : `${initial(longhand)}, ${initial(longhand)}`)
        expect(style.mask).toBe('')
        expect(style.cssText).toBe('mask-image: url("bg-1.jpg"); mask-position: 0% 0%, 0% 0%; mask-size: auto, auto; mask-repeat: repeat, repeat; mask-origin: border-box, border-box; mask-clip: border-box, border-box; mask-composite: add, add; mask-mode: match-source, match-source; mask-border: none;')
    })
})
describe('mask-border', () => {

    const longhands = shorthands.get('mask-border')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.maskBorder = 'none 0 / auto / 0 stretch alpha'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.maskBorder).toBe('none')
        expect(style.cssText).toBe('mask-border: none;')

        // Missing longhand values
        style.maskBorder = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.maskBorder).toBe('none')
        expect(style.cssText).toBe('mask-border: none;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.maskBorder).toBe('none')
        expect(style.cssText).toBe('mask-border: none;')
    })
})
describe('offset', () => {

    const longhands = shorthands.get('offset')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.offset = 'auto none 0 auto / auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.offset).toBe('auto')
        expect(style.cssText).toBe('offset: auto;')

        // Missing longhand values
        style.offset = 'auto'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.offset).toBe('auto')
        expect(style.cssText).toBe('offset: auto;')
        style.offset = 'auto / left'
        longhands.forEach(longhand =>
            style[longhand] = longhand === 'offset-anchor'
                ? 'left center'
                : initial(longhand))
        expect(style.offset).toBe('auto / left center')
        expect(style.cssText).toBe('offset: auto / left center;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.offset).toBe('auto')
        expect(style.cssText).toBe('offset: auto;')
    })
})
describe('order', () => {

    const longhands = shorthands.get('order')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.order = '0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.order).toBe('0')
        expect(style.cssText).toBe('order: 0;')

        // Missing longhand values
        style.order = '0'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.order).toBe('0')
        expect(style.cssText).toBe('order: 0;')
        style.order = '0'

        // Order prefix
        style.order = 'layout 1'
        expect(style.layoutOrder).toBe('1')
        expect(style.readingOrder).toBe('0')
        expect(style.order).toBe('1')
        expect(style.cssText).toBe('order: 1;')
        style.order = 'reading 1'
        expect(style.layoutOrder).toBe('0')
        expect(style.readingOrder).toBe('1')
        expect(style.order).toBe('0 1')
        expect(style.cssText).toBe('order: 0 1;')
        style.order = 'reading-and-layout 1'
        expect(style.layoutOrder).toBe('1')
        expect(style.readingOrder).toBe('1')
        expect(style.order).toBe('1 1')
        expect(style.cssText).toBe('order: 1 1;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.order).toBe('0')
        expect(style.cssText).toBe('order: 0;')
    })
})
describe('outline', () => {

    const longhands = shorthands.get('outline')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.outline = 'medium none invert'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.outline).toBe('medium')
        expect(style.cssText).toBe('outline: medium;')

        // Missing longhand values
        style.outline = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.outline).toBe('medium')
        expect(style.cssText).toBe('outline: medium;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.outline).toBe('medium')
        expect(style.cssText).toBe('outline: medium;')
    })
})
describe('overflow', () => {

    const longhands = shorthands.get('overflow')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.overflow = 'visible visible'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overflow).toBe('visible')
        expect(style.cssText).toBe('overflow: visible;')

        // Missing longhand values
        style.overflow = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overflow).toBe('visible')
        expect(style.cssText).toBe('overflow: visible;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.overflow).toBe('visible')
        expect(style.cssText).toBe('overflow: visible;')
    })
})
describe('overflow-clip-margin', () => {

    const longhands = shorthands.get('overflow-clip-margin')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.overflowClipMargin = '0px'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overflowClipMargin).toBe('0px')
        expect(style.cssText).toBe('overflow-clip-margin: 0px;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.overflowClipMargin).toBe('0px')
        expect(style.cssText).toBe('overflow-clip-margin: 0px;')
    })
})
describe('overflow-clip-margin-block, overflow-clip-margin-inline', () => {

    const longhands = shorthands.get('overflow-clip-margin-block')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.overflowClipMarginBlock = '0px'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overflowClipMarginBlock).toBe('0px')
        expect(style.cssText).toBe('overflow-clip-margin-block: 0px;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.overflowClipMarginBlock).toBe('0px')
        expect(style.cssText).toBe('overflow-clip-margin-block: 0px;')
    })
})
describe('overscroll-behavior', () => {

    const longhands = shorthands.get('overscroll-behavior')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.overscrollBehavior = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overscrollBehavior).toBe('auto')
        expect(style.cssText).toBe('overscroll-behavior: auto;')

        // Missing longhand values
        style.overscrollBehavior = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.overscrollBehavior).toBe('auto')
        expect(style.cssText).toBe('overscroll-behavior: auto;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.overscrollBehavior).toBe('auto')
        expect(style.cssText).toBe('overscroll-behavior: auto;')
    })
})
describe('padding', () => {

    const longhands = shorthands.get('padding')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.padding = '0 0 0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.padding).toBe('0px')
        expect(style.cssText).toBe('padding: 0px;')

        // Implicit values
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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.padding).toBe('0px')
        expect(style.cssText).toBe('padding: 0px;')
    })
})
describe('padding-block, padding-inline', () => {

    const longhands = shorthands.get('padding-block')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.paddingBlock = '0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.paddingBlock).toBe('0px')
        expect(style.cssText).toBe('padding-block: 0px;')

        // Missing longhand values
        style.paddingBlock = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.paddingBlock).toBe('0px')
        expect(style.cssText).toBe('padding-block: 0px;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.paddingBlock).toBe('0px')
        expect(style.cssText).toBe('padding-block: 0px;')
    })
})
describe('place-content', () => {

    const longhands = shorthands.get('place-content')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.placeContent = 'normal normal'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.placeContent).toBe('normal')
        expect(style.cssText).toBe('place-content: normal;')

        // Missing longhand values
        style.placeContent = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.placeContent).toBe('normal')
        expect(style.cssText).toBe('place-content: normal;')

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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.placeContent).toBe('normal')
        expect(style.cssText).toBe('place-content: normal;')
    })
})
describe('place-items', () => {

    const longhands = shorthands.get('place-items')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.placeItems = 'normal legacy'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.placeItems).toBe('normal legacy')
        expect(style.cssText).toBe('place-items: normal legacy;')

        // Missing longhand values
        const value = initial(longhands[0])
        style.placeItems = value
        longhands.forEach(longhand => expect(style[longhand]).toBe(value))
        expect(style.placeItems).toBe('normal')
        expect(style.cssText).toBe('place-items: normal;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.placeItems).toBe('normal legacy')
        expect(style.cssText).toBe('place-items: normal legacy;')
    })
})
describe('place-self', () => {

    const longhands = shorthands.get('place-self')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.placeSelf = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.placeSelf).toBe('auto')
        expect(style.cssText).toBe('place-self: auto;')

        // Missing longhand values
        const value = initial(longhands[0])
        style.placeSelf = value
        longhands.forEach(longhand => expect(style[longhand]).toBe(value))
        expect(style.placeSelf).toBe('auto')
        expect(style.cssText).toBe('place-self: auto;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.placeSelf).toBe('auto')
        expect(style.cssText).toBe('place-self: auto;')
    })
})
describe('scroll-margin', () => {

    const longhands = shorthands.get('scroll-margin')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.scrollMargin = '0 0 0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollMargin).toBe('0px')
        expect(style.cssText).toBe('scroll-margin: 0px;')

        // Implicit values
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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.scrollMargin).toBe('0px')
        expect(style.cssText).toBe('scroll-margin: 0px;')
    })
})
describe('scroll-margin-block, scroll-margin-inline', () => {

    const longhands = shorthands.get('scroll-margin-block')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.scrollMarginBlock = '0 0'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollMarginBlock).toBe('0px')
        expect(style.cssText).toBe('scroll-margin-block: 0px;')

        // Missing longhand values
        style.scrollMarginBlock = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollMarginBlock).toBe('0px')
        expect(style.cssText).toBe('scroll-margin-block: 0px;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.scrollMarginBlock).toBe('0px')
        expect(style.cssText).toBe('scroll-margin-block: 0px;')
    })
})
describe('scroll-padding', () => {

    const longhands = shorthands.get('scroll-padding')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.scrollPadding = 'auto auto auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollPadding).toBe('auto')
        expect(style.cssText).toBe('scroll-padding: auto;')

        // Implicit values
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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.scrollPadding).toBe('auto')
        expect(style.cssText).toBe('scroll-padding: auto;')
    })
})
describe('scroll-padding-block, scroll-padding-inline', () => {

    const longhands = shorthands.get('scroll-padding-block')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.scrollPaddingBlock = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollPaddingBlock).toBe('auto')
        expect(style.cssText).toBe('scroll-padding-block: auto;')

        // Missing longhand values
        style.scrollPaddingBlock = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollPaddingBlock).toBe('auto')
        expect(style.cssText).toBe('scroll-padding-block: auto;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.scrollPaddingBlock).toBe('auto')
        expect(style.cssText).toBe('scroll-padding-block: auto;')
    })
})
describe('scroll-start', () => {

    const longhands = shorthands.get('scroll-start')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Initial longhand values
        style.scrollStart = 'auto auto'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollStart).toBe('auto')
        expect(style.cssText).toBe('scroll-start: auto;')

        // Missing longhand values
        style.scrollStart = initial(longhands[0])
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollStart).toBe('auto')
        expect(style.cssText).toBe('scroll-start: auto;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.scrollStart).toBe('auto')
        expect(style.cssText).toBe('scroll-start: auto;')
    })
})
describe('scroll-start-target', () => {
    it.todo('parses longhand declarations from a shorthand value')
    it.todo('serializes a shorthand value from the declarations of its longhands')
})
describe('scroll-timeline', () => {

    const longhands = shorthands.get('scroll-timeline')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Invalid `none` in repeated longhand values
        style.scrollTimeline = 'none, 1s'
        expect(style.scrollTimeline).toBe('')
        style.scrollTimeline = 'none, none'
        expect(style.scrollTimeline).toBe('')

        // Initial longhand values
        style.scrollTimeline = 'none block'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollTimeline).toBe('none')
        expect(style.cssText).toBe('scroll-timeline: none;')

        // Missing longhand values
        style.scrollTimeline = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.scrollTimeline).toBe('none')
        expect(style.cssText).toBe('scroll-timeline: none;')

        // Repeated longhand values
        style.scrollTimeline = 'timeline-1, timeline-2 block'
        longhands.forEach(longhand =>
            expect(style[longhand])
                .toBe(longhand === 'scroll-timeline-name'
                    ? 'timeline-1, timeline-2'
                    : `${initial(longhand)}, ${initial(longhand)}`))
        expect(style.scrollTimeline).toBe('timeline-1, timeline-2')
        expect(style.cssText).toBe('scroll-timeline: timeline-1, timeline-2;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.scrollTimeline).toBe('none')
        expect(style.cssText).toBe('scroll-timeline: none;')

        // Excess of scroll timeline names
        longhands.forEach(longhand =>
            style[longhand] = longhand === 'scroll-timeline-name'
                ? 'timeline-1, timeline-2'
                : initial(longhand))
        expect(style.background).toBe('')
        expect(style.cssText).toBe('scroll-timeline-name: timeline-1, timeline-2; scroll-timeline-axis: block;')

        // Lack of scroll timeline names
        longhands.forEach(longhand =>
            style[longhand] = longhand === 'scroll-timeline-name'
                ? 'timeline-1'
                : `${initial(longhand)}, ${initial(longhand)}`)
        expect(style.background).toBe('')
        expect(style.cssText).toBe('scroll-timeline-name: timeline-1; scroll-timeline-axis: block, block;')
    })
})
describe('text-align', () => {

    const longhands = shorthands.get('text-align')

    it('parses longhand declarations from a shorthand value', () => {

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
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.textAlign).toBe('start')
        expect(style.cssText).toBe('text-align: start;')
    })
})
describe('text-emphasis', () => {

    const longhands = shorthands.get('text-emphasis')

    it('parses longhand declarations from a shorthand value', () => {

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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.textEmphasis).toBe('none')
        expect(style.cssText).toBe('text-emphasis: none;')
    })
})
describe('text-decoration', () => {

    const longhands = shorthands.get('text-decoration')

    it('parses longhand declarations from a shorthand value', () => {

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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.textDecoration).toBe('none')
        expect(style.cssText).toBe('text-decoration: none;')
    })
})
describe('text-decoration-skip', () => {
    it.todo('parses longhand declarations from a shorthand value')
    it.todo('serializes a shorthand value from the declarations of its longhands')
})
describe('transition', () => {

    const longhands = shorthands.get('transition')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Invalid `none` in repeated longhand values
        style.transition = 'none, 1s'
        expect(style.transition).toBe('')

        // Initial longhand values
        style.transition = '0s ease 0s all'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.transition).toBe('0s')
        expect(style.cssText).toBe('transition: 0s;')

        // Missing longhand values
        style.transition = '0s'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.transition).toBe('0s')
        expect(style.cssText).toBe('transition: 0s;')

        // Repeated longhand values
        style.transition = '0s, ease'
        longhands.forEach(longhand => expect(style[longhand]).toBe(`${initial(longhand)}, ${initial(longhand)}`))
        expect(style.transition).toBe('0s, 0s')
        expect(style.cssText).toBe('transition: 0s, 0s;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.transition).toBe('0s')
        expect(style.cssText).toBe('transition: 0s;')

        // Excess of transition-property values
        longhands.forEach(longhand =>
            style[longhand] = longhand === 'transition-property'
                ? 'all, color'
                : initial(longhand))
        expect(style.transition).toBe('')
        expect(style.cssText).toBe('transition-duration: 0s; transition-timing-function: ease; transition-delay: 0s; transition-property: all, color;')

        // Lack of transition-property values
        longhands.forEach(longhand =>
            style[longhand] = longhand === 'transition-property'
                ? initial(longhand)
                : `${initial(longhand)}, ${initial(longhand)}`)
        expect(style.transition).toBe('')
        expect(style.cssText).toBe('transition-duration: 0s, 0s; transition-timing-function: ease, ease; transition-delay: 0s, 0s; transition-property: all;')
    })
})
describe('vertical-align', () => {

    const longhands = shorthands.get('vertical-align')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

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
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.verticalAlign).toBe('baseline')
        expect(style.cssText).toBe('vertical-align: baseline;')
    })
})
describe('view-timeline', () => {

    const longhands = shorthands.get('view-timeline')

    it('parses longhand declarations from a shorthand value', () => {

        const style = createStyleBlock()

        // Invalid `none` in repeated longhand values
        style.viewTimeline = 'none, 1s'
        expect(style.viewTimeline).toBe('')
        style.viewTimeline = 'none, none'
        expect(style.viewTimeline).toBe('')

        // Initial longhand values
        style.viewTimeline = 'none block'
        expect(style).toHaveLength(longhands.length)
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.viewTimeline).toBe('none')
        expect(style.cssText).toBe('view-timeline: none;')

        // Missing longhand values
        style.viewTimeline = 'none'
        longhands.forEach(longhand => expect(style[longhand]).toBe(initial(longhand)))
        expect(style.viewTimeline).toBe('none')
        expect(style.cssText).toBe('view-timeline: none;')

        // Repeated longhand values
        style.viewTimeline = 'timeline-1, timeline-2 block'
        longhands.forEach(longhand =>
            expect(style[longhand])
                .toBe(longhand === 'view-timeline-name'
                    ? 'timeline-1, timeline-2'
                    : `${initial(longhand)}, ${initial(longhand)}`))
        expect(style.viewTimeline).toBe('timeline-1, timeline-2')
        expect(style.cssText).toBe('view-timeline: timeline-1, timeline-2;')
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {

        const style = createStyleBlock()

        // Initial longhand values
        longhands.forEach(longhand => style[longhand] = initial(longhand))
        expect(style.viewTimeline).toBe('none')
        expect(style.cssText).toBe('view-timeline: none;')

        // Excess of view timeline names
        longhands.forEach(longhand =>
            style[longhand] = longhand === 'view-timeline-name'
                ? 'timeline-1, timeline-2'
                : initial(longhand))
        expect(style.background).toBe('')
        expect(style.cssText).toBe('view-timeline-name: timeline-1, timeline-2; view-timeline-axis: block;')

        // Lack of view timeline names
        longhands.forEach(longhand =>
            style[longhand] = longhand === 'view-timeline-name'
                ? 'timeline-1'
                : `${initial(longhand)}, ${initial(longhand)}`)
        expect(style.background).toBe('')
        expect(style.cssText).toBe('view-timeline-name: timeline-1; view-timeline-axis: block, block;')
    })
})
describe('white-space', () => {

    const longhands = shorthands.get('white-space')

    it('parses longhand declarations from a shorthand value', () => {
        const style = createStyleBlock()
        whiteSpace.forEach((expected, input) => {
            style.whiteSpace = input
            longhands.forEach((longhand, index) => expect(style[longhand]).toBe(expected[index].value))
            expect(style.whiteSpace).toBe(input)
            expect(style.cssText).toBe(`white-space: ${input};`)
        })
    })
    it('serializes a shorthand value from the declarations of its longhands', () => {
        const style = createStyleBlock()
        whiteSpace.forEach((input, expected) => {
            longhands.forEach((longhand, index) => style[longhand] = input[index].value)
            expect(style.whiteSpace).toBe(expected)
            expect(style.cssText).toBe(`white-space: ${expected};`)
        })
    })
})
