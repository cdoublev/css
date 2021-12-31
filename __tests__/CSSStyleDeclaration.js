
const CSSStyleDeclaration = require('../lib/cssom/standalone/CSSStyleDeclaration.js')
const { cssPropertyToIDLAttribute } = require('../lib/utils/script.js')
const properties = Object.keys(require('../lib/properties/definitions.js'))
const wrapper = require('../lib/cssom/CSSStyleDeclaration.js')

const globalObject = {
    // Used by webidl2js (lib/cssom/utils.js)
    Array,
    Object,
    // Used by webidl-conversions
    Number,
    String,
    TypeError,
}

describe('CSSStyleDeclaration', () => {
    it('has all CSS (dashed) properties', () => {
        const style = new CSSStyleDeclaration()
        const prototype = Object.getPrototypeOf(style)
        properties.forEach(property => {
            expect(Object.getOwnPropertyDescriptor(prototype, property).get).toBeDefined()
            expect(Object.getOwnPropertyDescriptor(prototype, property).set).toBeDefined()
        })
    })
    it('has all CSS properties as camel cased IDL attributes', () => {
        const style = new CSSStyleDeclaration()
        const prototype = Object.getPrototypeOf(style)
        properties.forEach(property => {
            const dashPrefix = property.startsWith('-webkit-')
            const attribute = cssPropertyToIDLAttribute(property, dashPrefix)
            expect(Object.getOwnPropertyDescriptor(prototype, attribute).get).toBeDefined()
            expect(Object.getOwnPropertyDescriptor(prototype, attribute).set).toBeDefined()
        })
    })
    it('has all webkit prefixed CSS properties as pascal cased IDL attributes', () => {
        const style = new CSSStyleDeclaration()
        const prototype = Object.getPrototypeOf(style)
        properties.forEach(property => {
            if (property.startsWith('-webkit')) {
                const attribute = cssPropertyToIDLAttribute(property)
                expect(Object.getOwnPropertyDescriptor(prototype, attribute).get).toBeDefined()
                expect(Object.getOwnPropertyDescriptor(prototype, attribute).set).toBeDefined()
            }
        })
    })
    it('has all properties', () => {
        const style = new CSSStyleDeclaration()
        const prototype = Object.getPrototypeOf(style)
        expect(Object.getOwnPropertyDescriptor(prototype, 'cssText').get).toBeDefined()
        expect(Object.getOwnPropertyDescriptor(prototype, 'cssText').set).toBeDefined()
        expect(Object.getOwnPropertyDescriptor(prototype, 'length').get).toBeDefined()
        expect(Object.getOwnPropertyDescriptor(prototype, 'parentRule').get).toBeDefined()
    })
    it('has all methods', () => {

        const style = new CSSStyleDeclaration()

        expect(style[0]).toBeUndefined()
        expect(style.item(0)).toBe('')
        expect(style.length).toBe(0)

        style['font-size'] = '20px'

        expect(style[0]).toBe('font-size')
        expect(style.item(0)).toBe('font-size')
        expect(style.length).toBe(1)
        expect(style.fontSize).toBe('20px')
        expect(style.cssText).toBe('font-size: 20px;')

        style.fontSize = '10px'

        expect(style['font-size']).toBe('10px')
        expect(style.cssText).toBe('font-size: 10px;')

        style.fontSize = ''

        expect(style.fontSize).toBe('')

        style.cssText = 'font-size: 20px'

        expect(style.cssText).toBe('font-size: 20px;')
        expect(style.fontSize).toBe('20px')

        style.cssText = ''

        expect(style.cssText).toBe('')
        expect(style.fontSize).toBe('')

        style.setProperty('font-size', '10px', 'important')

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
    it('throws an error when setting a declaration with a value that can not be converted to string', () => {
        const style = new CSSStyleDeclaration()
        expect(() => (style.opacity = Symbol('0')))
            .toThrow("Failed to set the 'opacity' property on 'CSSStyleDeclaration': The provided value is a symbol, which cannot be converted to a string.")
        expect(() => (style.opacity = { toString: () => [0] }))
            .toThrow('Cannot convert object to primitive value')
    })
    it('sets a declaration with a non-string value that can be converted to string', () => {
        const style = new CSSStyleDeclaration()

        // Property with custom setter
        style.borderStyle = { toString: () => 'solid' }
        expect(style.borderStyle).toBe('solid')

        // Property with default setter
        style.opacity = 1
        expect(style.opacity).toBe('1')
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
    it('mirrors legacy vendor prefixed properties', () => {
        const style = new CSSStyleDeclaration()
        style.order = '1'
        expect(style.webkitOrder).toBe('1')
        expect(style.getPropertyValue('-webkit-order')).toBe('1')
        style.webkitOrder = '2'
        expect(style.order).toBe('2')
    })
    it('does not set a camelcased property with `.setProperty()`', () => {
        const style = new CSSStyleDeclaration()
        style.setProperty('fontSize', '12px')
        expect(style.cssText).toBe('')
    })
    it('normalizes a property to lowercase with `.setProperty()`', () => {
        const style = new CSSStyleDeclaration()
        style.setProperty('FoNt-SiZe', '12px')
        expect(style.fontSize).toBe('12px')
        expect(style.getPropertyValue('font-size')).toBe('12px')
    })
    it('handles a shorthand property value with embedded spaces', () => {
        const style = new CSSStyleDeclaration()
        style.background = '  rgb(0, 0, 0)   url(/something/somewhere.jpg)  '
        expect(style.backgroundColor).toBe('rgb(0, 0, 0)')
        expect(style.backgroundImage).toBe('url("/something/somewhere.jpg")')
        expect(style.cssText).toBe('background: url("/something/somewhere.jpg") 0% 0% rgb(0, 0, 0);')
    })
    it('does not throw when failing to parse the input value assigned to `csstext`', () => {
        const style = new CSSStyleDeclaration()
        style.cssText = 'color: '
        expect(style.cssText).toBe('')
        style.color = 'black'
        style.cssText = 'float: '
        expect(style.cssText).toBe('')
    })
    it('constructs a new instance with the declarations resulting from parsing the `style` attribute of `Element`', () => {
        const element = {
            getAttribute() {
                return 'font-size: 10px;'
            }
        }
        wrapper.install(globalObject, ['Window'])
        const style = wrapper.create(globalObject, undefined, { ownerNode: element })
        expect(style.fontSize).toBe('10px')
    })
    it('constructs a new instance with the declarations from `getComputedStyle()` and prevents modifying them', () => {

        const declarations = new Map([['font-size', { name: 'font-size', value: '10px' }]])
        wrapper.install(globalObject, ['Window'])
        const style = wrapper.create(globalObject, undefined, { computed: true, declarations, ownerNode: {} })

        expect(style.fontSize).toBe('10px')
        expect(style.cssText).toBe('')
        expect(() => style.cssText = 'font-size: 20px;').toThrow('Can not set "cssText" on read-only computed style declaration"')
        expect(() => style.setProperty('font-size', '20px')).toThrow('Can not set "font-size" on read-only computed style declaration"')
        expect(() => style.removeProperty('font-size', '20px')).toThrow('Can not remove "font-size" on read-only computed style declaration"')

    })
})

describe('--custom-property', () => {
    it('inserts and returns the declaration value of a custom property', () => {

        const style = new CSSStyleDeclaration()

        style.setProperty('--custom', 'red')
        expect(style.getPropertyValue('--custom')).toBe('red')
        style.cssText = '--custom: green'
        expect(style.getPropertyValue('--custom')).toBe('green')
        style.removeProperty('--custom')
        expect(style.getPropertyValue('--custom')).toBe('')

        // Custom properties are not interface attribute
        style['--custom'] = 'blue'
        expect(style.getPropertyValue('--custom')).toBe('')

        // Custom properties are case-sensitive
        style.setProperty('--Custom', 'purple')
        expect(style.getPropertyValue('--Custom')).toBe('purple')
        expect(style.getPropertyValue('--custom')).toBe('')
    })
})
describe('background', () => {
    it('invalid', () => {
        const style = new CSSStyleDeclaration()
        const invalid = [
            'black / cover', // <any> / <size>
            'left / repeat', // <position> / <any>
            'left / cover cover',
            'left / 100% 100% 100%',
            'left / 100% 100% cover',
            'black black',
            'repeat-x repeat-y',
        ]
        invalid.forEach(value => {
            style.background = value
            expect(style.background).toBe('')
        })
    })
    it('valid', () => {
        const style = new CSSStyleDeclaration()
        const canonical = 'url("bg.jpg") left 10% / 100px 100% no-repeat fixed content-box padding-box red'
        style.background = canonical
        /* Firefox expect(style.background).toBe('red url("bg.jpg") no-repeat fixed left 10% / 100px 100% content-box padding-box') */
        expect(style.background).toBe(canonical)
        // Non canonical orders
        style.background = 'url("bg.jpg") red fixed no-repeat content-box left 10% / 100px 100% padding-box'
        expect(style.background).toBe(canonical)
        style.background = 'content-box padding-box left 10% / 100px 100% fixed no-repeat red url("bg.jpg")'
        expect(style.background).toBe(canonical)
        style.background = 'left 10% / 100px 100% url("bg.jpg") content-box padding-box red no-repeat fixed'
        expect(style.background).toBe(canonical)
        // Single component
        style.background = 'center'
        /* Chrome */ expect(style.background).toBe('center center')
        /* Firefox expect(style.background).toBe('rgba(0, 0, 0, 0) none repeat scroll center center');*/
    })
    it('shorthand propagates to longhands', () => {
        const style = new CSSStyleDeclaration()
        style.background = 'blue url(img.jpg)'
        expect(style).toHaveLength(8)
        expect(style.background).toBe('url("img.jpg") 0% 0% blue')
        expect(style.getPropertyValue('background')).toBe('url("img.jpg") 0% 0% blue')
        expect(style.cssText).toBe('background: url("img.jpg") 0% 0% blue;')
        expect(style.backgroundColor).toBe('blue')
        expect(style.backgroundImage).toBe('url("img.jpg")')
        expect(style.backgroundRepeat).toBe('repeat')
        expect(style.backgroundAttachment).toBe('scroll')
        expect(style.backgroundPosition).toBe('0% 0%')
        expect(style.backgroundSize).toBe('auto')
        expect(style.backgroundOrigin).toBe('padding-box')
        expect(style.backgroundClip).toBe('border-box')
        // empty string
        style.background = ''
        expect(style).toHaveLength(0)
        expect(style.background).toBe('')
        expect(style.getPropertyValue('background')).toBe('')
        expect(style.cssText).toBe('')
        expect(style.backgroundColor).toBe('')
        expect(style.backgroundImage).toBe('')
        expect(style.backgroundRepeat).toBe('')
        expect(style.backgroundAttachment).toBe('')
        expect(style.backgroundPosition).toBe('')
        expect(style.backgroundSize).toBe('')
        expect(style.backgroundOrigin).toBe('')
        expect(style.backgroundClip).toBe('')
        // CSS wide keyword
        style.background = 'inherit'
        expect(style.background).toBe('inherit')
        expect(style.getPropertyValue('background')).toBe('inherit')
        expect(style.cssText).toBe('background: inherit;')
        expect(style.backgroundColor).toBe('inherit')
        expect(style.backgroundImage).toBe('inherit')
        expect(style.backgroundRepeat).toBe('inherit')
        expect(style.backgroundAttachment).toBe('inherit')
        expect(style.backgroundPosition).toBe('inherit')
        expect(style.backgroundSize).toBe('inherit')
        expect(style.backgroundOrigin).toBe('inherit')
        expect(style.backgroundClip).toBe('inherit')
    })
    it('longhand propagates to shorthand', () => {
        const style = new CSSStyleDeclaration()
        style.background = 'blue url(img.jpg)'
        style.backgroundColor = 'black'
        style.backgroundImage = 'url(img.jpg)'
        style.backgroundRepeat = 'repeat-x'
        style.backgroundAttachment = 'fixed'
        style.backgroundPosition = 'center'
        style.backgroundSize = 'cover'
        style.backgroundOrigin = 'content-box'
        style.backgroundClip = 'padding-box'
        expect(style.background).toBe('url("img.jpg") center center / cover repeat-x fixed content-box padding-box black')
        style.backgroundColor = 'initial'
        style.backgroundImage = 'initial'
        style.backgroundRepeat = 'initial'
        style.backgroundAttachment = 'initial'
        style.backgroundPosition = 'initial'
        style.backgroundSize = 'initial'
        style.backgroundOrigin = 'initial'
        style.backgroundClip = 'initial'
        expect(style.background).toBe('initial')
    })
})
describe('background-color', () => {
    it.todo('invalid')
    it.todo('valid')
})
describe('background-image', () => {
    it.todo('invalid')
    it.todo('valid')
})
describe('background-position', () => {
    it.todo('invalid')
    it.todo('valid (1, 2, 3, 4 values syntax)')
})
describe('background-size', () => {
    it('invalid', () => {
        const style = new CSSStyleDeclaration()
        const invalid = ['full', '100viewport', '100px cover', 'cover auto', 'cover contain']
        invalid.forEach(value => {
            style.backgroundSize = value
            expect(style.backgroundSize).toBe('')
        })
    })
    it('valid', () => {
        const style = new CSSStyleDeclaration()
        const valid = ['100px', '100px 100%', 'auto', 'cover', 'contain']
        valid.forEach(value => {
            style.backgroundSize = value
            expect(style.backgroundSize).toBe(value)
        })
    })
})
describe('background-repeat', () => {
    it.todo('invalid')
    it.todo('valid')
})
describe('background-attachment', () => {
    it.todo('invalid')
    it.todo('valid')
})
describe('background-origin and background-clip', () => {
    it('invalid', () => {
        const style = new CSSStyleDeclaration()
        const invalid = ['0', '0px', 'left left', 'margin-box', 'border-box border-box']
        invalid.forEach(value => {
            style.backgroundOrigin = value
            expect(style.backgroundOrigin).toBe('')
        })
    })
    it('valid', () => {
        const style = new CSSStyleDeclaration()
        const valid = ['border-box', 'content-box', 'padding-box']
        valid.forEach(value => {
            style.backgroundOrigin = value
            expect(style.backgroundOrigin).toBe(value)
        })
    })
})
describe('border', () => {
    it('shorthand propagates to longhands', () => {
        const style = new CSSStyleDeclaration()
        style.border = '1px solid black'
        expect(style).toHaveLength(12)
        expect(style.border).toBe('1px solid black')
        expect(style.getPropertyValue('border')).toBe('1px solid black')
        expect(style.cssText).toBe('border: 1px solid black;')
        expect(style.borderWidth).toBe('1px')
        expect(style.borderStyle).toBe('solid')
        expect(style.borderColor).toBe('black')
        expect(style.borderRight).toBe('1px solid black')
        expect(style.borderTopWidth).toBe('1px')
        expect(style.borderLeftStyle).toBe('solid')
        expect(style.borderBottomColor).toBe('black')
        // empty string
        style.border = ''
        expect(style).toHaveLength(0)
        expect(style.border).toBe('')
        expect(style.getPropertyValue('border')).toBe('')
        expect(style.cssText).toBe('')
        expect(style.borderWidth).toBe('')
        expect(style.borderStyle).toBe('')
        expect(style.borderColor).toBe('')
        expect(style.borderRight).toBe('')
        expect(style.borderTopWidth).toBe('')
        expect(style.borderLeftStyle).toBe('')
        expect(style.borderBottomColor).toBe('')
        // CSS wide keyword
        style.border = 'inherit'
        expect(style).toHaveLength(12)
        expect(style.border).toBe('inherit')
        expect(style.getPropertyValue('border')).toBe('inherit')
        expect(style.cssText).toBe('border: inherit;')
        expect(style.borderWidth).toBe('inherit')
        expect(style.borderStyle).toBe('inherit')
        expect(style.borderColor).toBe('inherit')
        expect(style.borderRight).toBe('inherit')
        expect(style.borderTopWidth).toBe('inherit')
        expect(style.borderLeftStyle).toBe('inherit')
        expect(style.borderBottomColor).toBe('inherit')
        // none
        style.border = 'none'
        expect(style).toHaveLength(12)
        expect(style.border).toBe('medium')
        expect(style.cssText).toBe('border: medium;')
        expect(style.getPropertyValue('border')).toBe('medium')
        expect(style.borderWidth).toBe('medium')
        expect(style.borderStyle).toBe('none')
        expect(style.borderColor).toBe('currentcolor')
        expect(style.borderRight).toBe('medium')
        expect(style.borderTopWidth).toBe('medium')
        expect(style.borderLeftStyle).toBe('none')
        expect(style.borderBottomColor).toBe('currentcolor')
    })
    it('longhand propagates to shorthand', () => {
        const style = new CSSStyleDeclaration()
        style.border = '1px solid black'
        // border-width
        style.borderWidth = '2px'
        expect(style.border).toBe('2px solid black')
        expect(style.getPropertyValue('border')).toBe('2px solid black')
        expect(style.cssText).toBe('border: 2px solid black;')
        // border-style
        style.borderStyle = 'inherit'
        expect(style.border).toBe('')
        expect(style.getPropertyValue('border')).toBe('')
        expect(style.cssText).toBe('border-width: 2px; border-style: inherit; border-color: black;') // + border-image: initial;
        style.border = '1px solid black'
        style.borderStyle = 'none'
        expect(style.border).toBe('1px black')
        expect(style.getPropertyValue('border')).toBe('1px black')
        expect(style.cssText).toBe('border: 1px black;')
        // border-color
        style.border = '1px solid black'
        style.borderColor = 'red'
        expect(style.border).toBe('1px solid red')
        expect(style.getPropertyValue('border')).toBe('1px solid red')
        expect(style.cssText).toBe('border: 1px solid red;')
        // border-bottom, border-left, border-right, border-top
        style.borderTop = '2px'
        expect(style.border).toBe('')
        expect(style.getPropertyValue('border')).toBe('')
        // Note: Firefox do not use the canonical order to sort border longhands
        expect(style.cssText).toBe('border-width: 2px 1px 1px; border-style: none solid solid; border-color: currentcolor red red;') // + border-image: none 100% / 1 / 0 stretch;
    })
})
describe('border-bottom, border-left, border-right, border-top', () => {
    it('shorthand propagates to longhands', () => {
        const style = new CSSStyleDeclaration()
        style.borderTop = '1px solid black'
        expect(style.borderTop).toBe('1px solid black')
        expect(style.getPropertyValue('border-top')).toBe('1px solid black')
        expect(style.cssText).toBe('border-top: 1px solid black;')
        expect(style.borderTopWidth).toBe('1px')
        expect(style.borderTopStyle).toBe('solid')
        expect(style.borderTopColor).toBe('black')
        // empty string
        style.borderTop = ''
        expect(style.borderTop).toBe('')
        expect(style.getPropertyValue('border-top')).toBe('')
        expect(style.cssText).toBe('')
        expect(style.borderTopWidth).toBe('')
        expect(style.borderTopStyle).toBe('')
        expect(style.borderTopColor).toBe('')
        // CSS wide keyword
        style.borderTop = 'inherit'
        expect(style.borderTop).toBe('inherit')
        expect(style.getPropertyValue('border-top')).toBe('inherit')
        expect(style.cssText).toBe('border-top: inherit;')
        expect(style.borderTopWidth).toBe('inherit')
        expect(style.borderTopStyle).toBe('inherit')
        expect(style.borderTopColor).toBe('inherit')
        // none
        style.borderTop = 'none'
        expect(style.borderTop).toBe('medium')
        expect(style.cssText).toBe('border-top: medium;')
        expect(style.getPropertyValue('border-top')).toBe('medium')
        expect(style.borderTopWidth).toBe('medium')
        expect(style.borderTopStyle).toBe('none')
        expect(style.borderTopColor).toBe('currentcolor')
    })
    it('longhand propagates to shorthand', () => {
        const style = new CSSStyleDeclaration()
        style.borderTop = '1px solid black'
        // border-<side>-width
        style.borderTopWidth = '2px'
        expect(style.borderTop).toBe('2px solid black')
        expect(style.getPropertyValue('border-top')).toBe('2px solid black')
        expect(style.cssText).toBe('border-top: 2px solid black;')
        // border-<side>-style
        style.borderTopStyle = 'inherit'
        expect(style.borderTop).toBe('')
        expect(style.getPropertyValue('border-top')).toBe('')
        expect(style.cssText).toBe('border-top-width: 2px; border-top-style: inherit; border-top-color: black;')
        style.borderTop = '1px solid black'
        style.borderTopStyle = 'none'
        expect(style.borderTop).toBe('1px black')
        expect(style.getPropertyValue('border-top')).toBe('1px black')
        expect(style.cssText).toBe('border-top: 1px black;')
        // border-<side>-color
        style.borderTop = '1px solid black'
        style.borderTopColor = 'red'
        expect(style.borderTop).toBe('1px solid red')
        expect(style.getPropertyValue('border-top')).toBe('1px solid red')
        expect(style.cssText).toBe('border-top: 1px solid red;')
    })
})
describe('border-color', () => {
    it('shorthand propagates to longhands', () => {
        const style = new CSSStyleDeclaration()
        style.borderColor = 'black'
        expect(style.borderTopColor).toBe('black')
    })
    it('longhand propagates to shorthand', () => {
        const style = new CSSStyleDeclaration()
        style.borderColor = 'black'
        style.borderTopColor = 'red'
        expect(style.borderColor).toBe('red black black')
    })
})
describe('border-radius', () => {
    it('returns empty string for invalid values', () => {
        const style = new CSSStyleDeclaration()
        const invalid = ['string', '1', '%', '#1%', '1%%', 'calc(1 + 1)']
        invalid.forEach(value => {
            style.borderRadius = value
            expect(style.borderRadius).toBe('')
        })
    })
    it('parses valid values', () => {
        const style = new CSSStyleDeclaration()
        const valid = [
            // [input, expected = input]
            ['1px'],
            ['1px 1%'],
            ['1px 1px', '1px'],
            ['1px 1px 1px', '1px'],
            ['1px 1px 1px 1px', '1px'],
            ['1px 1px 1px 1px / 1px 1px 1px 1px', '1px'],
            ['1px 2px'],
            ['1px 2px 2px'],
            ['1px 2px 1px', '1px 2px'],
            ['1px 1px 2px'],
            ['1px 2px 2px 2px', '1px 2px 2px'],
            ['1px 2px 2px 1px'],
            ['1px 2px 1px 2px', '1px 2px'],
            ['1px 2px 1px 1px'],
            ['1px 1px 2px 2px'],
            ['1px 1px 2px 1px', '1px 1px 2px'],
            ['1px 1px 1px 2px'],
            ['1px / 1px', '1px'],
            ['1px 1px / 1px', '1px'],
            ['1px / 1%'],
            ['1px / 2px'],
            ['1px/2px', '1px / 2px'],
            ['1px 1px / 2px 1px', '1px / 2px 1px'],
        ]
        valid.forEach(([value, expected = value]) => {
            style.borderRadius = value
            expect(style.borderRadius).toBe(expected)
        })
    })
    it('shorthand propagates to longhands', () => {
        const style = new CSSStyleDeclaration()
        style.borderRadius = '1px'
        expect(style.borderRadius).toBe('1px')
        expect(style.borderTopLeftRadius).toBe('1px')
        expect(style.borderTopRightRadius).toBe('1px')
        expect(style.borderBottomRightRadius).toBe('1px')
        expect(style.borderBottomLeftRadius).toBe('1px')
        style.borderRadius = '1px / 2px'
        expect(style.borderRadius).toBe('1px / 2px')
        expect(style.borderTopLeftRadius).toBe('1px 2px')
        expect(style.borderTopRightRadius).toBe('1px 2px')
        expect(style.borderBottomRightRadius).toBe('1px 2px')
        expect(style.borderBottomLeftRadius).toBe('1px 2px')
        style.borderRadius = '1px 2px 3px 4px / 1px 2px'
        expect(style.borderRadius).toBe('1px 2px 3px 4px / 1px 2px')
        expect(style.borderTopLeftRadius).toBe('1px')
        expect(style.borderTopRightRadius).toBe('2px')
        expect(style.borderBottomRightRadius).toBe('3px 1px')
        expect(style.borderBottomLeftRadius).toBe('4px 2px')
    })
    it('longhand propagates to shorthand', () => {
        const style = new CSSStyleDeclaration()
        style.borderRadius = '1px 2px 3px 4px / 1px 2px'
        style.borderBottomLeftRadius = '2px 1px'
        expect(style.borderRadius).toBe('1px 2px 3px / 1px 2px 1px 1px')
    })
    it('works with calc', () => {
        const style = new CSSStyleDeclaration()
        style.borderRadius = 'calc(1px + 1px) 2px'
        expect(style.borderRadius).toBe('calc(2px) 2px')
    })
    it('works with custom variable', () => {
        const style = new CSSStyleDeclaration()
        style.borderRadius = 'var(--border-radius)'
        expect(style.borderRadius).toBe('var(--border-radius)')
        style.borderRadius = '1px var(--border-horizontal-radius)'
        expect(style.borderRadius).toBe('1px var(--border-horizontal-radius)')
    })
})
describe('border-style', () => {
    it('shorthand propagates to longhands', () => {
        const style = new CSSStyleDeclaration()
        style.borderStyle = 'dashed'
        expect(style.borderTopStyle).toBe('dashed')
    })
    it('longhand propagates to shorthand', () => {
        const style = new CSSStyleDeclaration()
        style.borderStyle = 'solid'
        style.borderTopStyle = 'dashed'
        expect(style.borderStyle).toBe('dashed solid solid')
    })
})
describe('border-width', () => {
    it('shorthand propagates to longhands', () => {
        const style = new CSSStyleDeclaration()
        style.borderWidth = 0
        expect(style.borderTopWidth).toBe('0px')
    })
    it('longhand propagates to shorthand', () => {
        const style = new CSSStyleDeclaration()
        style.borderWidth = '1px'
        style.borderTopWidth = '2px'
        expect(style.borderWidth).toBe('2px 1px 1px')
    })
})
describe('bottom, left, right, top', () => {
    it('valid', () => {
        const style = new CSSStyleDeclaration()
        style.top = 0
        style.left = '0%'
        style.right = '5em'
        style.bottom = '12pt'
        expect(style.top).toBe('0px')
        expect(style.left).toBe('0%')
        expect(style.right).toBe('5em')
        expect(style.bottom).toBe('12pt')
        expect(style).toHaveLength(4)
        expect(style.cssText).toBe('inset: 0px 0% 5em 12pt;')
    })
})
describe('clear', () => {
    it('valid and invalid', () => {
        const style = new CSSStyleDeclaration()
        style.clear = 'none'
        expect(style.clear).toBe('none')
        style.clear = 'lfet'
        expect(style.clear).toBe('none')
        style.clear = 'left'
        expect(style.clear).toBe('left')
        style.clear = 'right'
        expect(style.clear).toBe('right')
        style.clear = 'both'
        expect(style.clear).toBe('both')
        expect(style).toHaveLength(1)
        expect(style.cssText).toBe('clear: both;')
    })
})
describe('clip', () => {
    it('valid and invalid', () => {
        const style = new CSSStyleDeclaration()
        style.clip = 'elipse(5px, 10px)'
        expect(style.clip).toBe('')
        expect(style).toHaveLength(0)
        style.clip = 'rect(0, 3Em, 2pt, 50px)'
        expect(style.clip).toBe('rect(0px, 3em, 2pt, 50px)')
        expect(style.cssText).toBe('clip: rect(0px, 3em, 2pt, 50px);')
        expect(style).toHaveLength(1)
    })
    it('calc()', () => {
        const style = new CSSStyleDeclaration()
        style.clip = 'rect(calc(5px + 5px), calc(20px - 10px), calc(5px * 2), calc(20px / 2))'
        expect(style.clip).toBe('rect(calc(10px), calc(10px), calc(10px), calc(10px))')
    })
})
describe('clip-path', () => {
    it('basic shape and geometry box in any order', () => {
        const style = new CSSStyleDeclaration()
        const valid = [
            ['fill-box circle()', 'circle(at center center) fill-box'],
            ['circle() fill-box', 'circle(at center center) fill-box'],
        ]
        valid.forEach(([input, expected = input]) => {
            style.clipPath = input
            expect(style.clipPath).toBe(expected)
        })
    })
})
describe('color', () => {
    it('stores and serialize alpha value in a color function as an 8 bit integer', () => {
        const style = new CSSStyleDeclaration()
        style.color = 'rgb(0, 0, 0, 0.499)'
        expect(style.color).toBe('rgba(0, 0, 0, 0.499)')
        style.color = 'rgb(0, 0, 0, 49.9%)'
        expect(style.color).toBe('rgba(0, 0, 0, 0.498)')
        style.color = 'rgb(0, 0, 0, 0.501)'
        expect(style.color).toBe('rgba(0, 0, 0, 0.501)')
        style.color = 'rgb(0, 0, 0, 50.1%)'
        expect(style.color).toBe('rgba(0, 0, 0, 0.5)')
    })
})
describe.skip('flex', () => {
    it.todo('invalid (with flex-grow or flex-shrink at invalid positions)')
    it('shorthand propagates to longhands', () => {
        const style = new CSSStyleDeclaration()
        style.setProperty('flex', 'none')
        expect(style.getPropertyValue('flex-grow')).toBe('0')
        expect(style.getPropertyValue('flex-shrink')).toBe('0')
        expect(style.getPropertyValue('flex-basis')).toBe('auto')
        style.removeProperty('flex')
        style.removeProperty('flex-basis')
        style.setProperty('flex', 'auto')
        expect(style.getPropertyValue('flex-grow')).toBe('1')
        expect(style.getPropertyValue('flex-shrink')).toBe('1')
        expect(style.getPropertyValue('flex-basis')).toBe('auto')
        style.removeProperty('flex')
        style.setProperty('flex', '0 1 250px')
        expect(style.getPropertyValue('flex')).toBe('0 1 250px')
        expect(style.getPropertyValue('flex-grow')).toBe('0')
        expect(style.getPropertyValue('flex-shrink')).toBe('1')
        expect(style.getPropertyValue('flex-basis')).toBe('250px')
        style.removeProperty('flex')
        style.setProperty('flex', '2')
        expect(style.getPropertyValue('flex-grow')).toBe('2')
        expect(style.getPropertyValue('flex-shrink')).toBe('1')
        expect(style.getPropertyValue('flex-basis')).toBe('0%')
        style.removeProperty('flex')
        style.setProperty('flex', '20%')
        expect(style.getPropertyValue('flex-grow')).toBe('1')
        expect(style.getPropertyValue('flex-shrink')).toBe('1')
        expect(style.getPropertyValue('flex-basis')).toBe('20%')
        style.removeProperty('flex')
        style.setProperty('flex', '2 2')
        expect(style.getPropertyValue('flex-grow')).toBe('2')
        expect(style.getPropertyValue('flex-shrink')).toBe('2')
        expect(style.getPropertyValue('flex-basis')).toBe('0%')
    })
})
describe('flex-basis', () => {
    it('valid', () => {
        const style = new CSSStyleDeclaration()
        style.setProperty('flex-basis', 0)
        expect(style.getPropertyValue('flex-basis')).toBe('0px')
        style.setProperty('flex-basis', '250px')
        expect(style.getPropertyValue('flex-basis')).toBe('250px')
        style.setProperty('flex-basis', '10em')
        expect(style.getPropertyValue('flex-basis')).toBe('10em')
        style.setProperty('flex-basis', '30%')
        expect(style.getPropertyValue('flex-basis')).toBe('30%')
        expect(style.cssText).toBe('flex-basis: 30%;')
    })
})
describe('flex-direction', () => {
    it('valid', () => {
        const style = new CSSStyleDeclaration()
        style.flexDirection = 'column'
        expect(style.cssText).toBe('flex-direction: column;')
        style.flexDirection = 'row'
        expect(style.cssText).toBe('flex-direction: row;')
    })
})
describe('flex-grow', () => {
    it('valid', () => {
        const style = new CSSStyleDeclaration()
        style.setProperty('flex-grow', 2)
        expect(style.getPropertyValue('flex-grow')).toBe('2')
        expect(style.cssText).toBe('flex-grow: 2;')
    })
})
describe('flex-shrink', () => {
    it('valid', () => {
        const style = new CSSStyleDeclaration()
        style.setProperty('flex-shrink', 0)
        expect(style.getPropertyValue('flex-shrink')).toBe('0')
        style.setProperty('flex-shrink', 1)
        expect(style.getPropertyValue('flex-shrink')).toBe('1')
        expect(style.cssText).toBe('flex-shrink: 1;')
    })
})
describe('float', () => {
    it('mirrors cssfloat', () => {
        const style = new CSSStyleDeclaration()
        style.float = 'left'
        expect(style.cssFloat).toBe('left')
    })
    it('with setproperty()', () => {
        const style = new CSSStyleDeclaration()
        style.setProperty('float', 'left')
        expect(style.float).toBe('left')
        expect(style.getPropertyValue('float')).toBe('left')
    })
})
describe('font', () => {
    it('shorthand propagates to longhands', () => {
        const style = new CSSStyleDeclaration()
        style.font = '12em monospace'
        expect(style.fontSize).toBe('12em')
        expect(style.fontFamily).toBe('monospace')
    })
})
describe('font-size', () => {
    it('valid and invalid', () => {
        const style = new CSSStyleDeclaration()
        const invalidValue = '1r5px'
        style.cssText = 'font-size: 15px'
        expect(1).toBe(style.length)
        style.cssText = `font-size: ${invalidValue}`
        expect(0).toBe(style.length)
        expect(undefined).toBe(style[0])
    })
})
describe('height, width', () => {
    it('valid', () => {
        const style = new CSSStyleDeclaration()
        style.height = 6
        expect(style.height).toBe('')
        style.width = 0
        expect(style.width).toBe('0px')
        style.height = '34%'
        expect(style.height).toBe('34%')
        style.height = '100vh'
        expect(style.height).toBe('100vh')
        style.height = '100vw'
        expect(style.height).toBe('100vw')
        style.height = ''
        expect(1).toBe(style.length)
        expect(style.cssText).toBe('width: 0px;')
        style.width = null
        expect(0).toBe(style.length)
        expect(style.cssText).toBe('')
        style.width = 'auto'
        expect(style.cssText).toBe('width: auto;')
        expect(style.width).toBe('auto')
        style.height = 'auto'
        expect(style.height).toBe('auto')
        expect(style.cssText).toBe('width: auto; height: auto;')
    })
})
describe('margin', () => {
    it('shorthand propagates to longhands', () => {
        const style = new CSSStyleDeclaration()
        const sides = ['top', 'right', 'bottom', 'left']
        function expectSides(...values) {
            for (const [i, side] of sides.entries()) {
                expect(style[`margin-${side}`]).toBe(values[i])
            }
        }
        style.margin = '1px'
        expectSides('1px', '1px', '1px', '1px')
        style.margin = '1px 2px'
        expectSides('1px', '2px', '1px', '2px')
        style.margin = '1px 2px 3px'
        expectSides('1px', '2px', '3px', '2px')
        style.margin = '1px 2px 3px 4px'
        expectSides('1px', '2px', '3px', '4px')
        style.margin = ''
        expectSides('', '', '', '')
    })
    it('longhand propagates to shorthand', () => {
        const style = new CSSStyleDeclaration()
        style.margin = '1px 2px 3px 4px'
        expect(style.margin).toBe('1px 2px 3px 4px')
        style.marginLeft = '5px'
        expect(style.margin).toBe('1px 2px 3px 5px')
        style.marginBottom = '5px'
        expect(style.margin).toBe('1px 2px 5px 5px')
        style.marginRight = '5px'
        expect(style.margin).toBe('1px 5px 5px')
        style.marginTop = '5px'
        expect(style.margin).toBe('5px')
        style.marginBottom = '1px'
        expect(style.margin).toBe('5px 5px 1px')
        style.marginTop = ''
        expect(style.margin).toBe('')
    })
})
describe('padding', () => {
    it('shorthand propagates to longhands', () => {
        const style = new CSSStyleDeclaration()
        const sides = ['top', 'right', 'bottom', 'left']
        function expectSides(...values) {
            for (const [i, side] of sides.entries()) {
                expect(style[`padding-${side}`]).toBe(values[i])
            }
        }
        style.padding = '1px'
        expectSides('1px', '1px', '1px', '1px')
        style.padding = '1px 2px'
        expectSides('1px', '2px', '1px', '2px')
        style.padding = '1px 2px 3px'
        expectSides('1px', '2px', '3px', '2px')
        style.padding = '1px 2px 3px 4px'
        expectSides('1px', '2px', '3px', '4px')
        style.padding = ''
        expectSides('', '', '', '')
    })
    it('longhand propagates to shorthand', () => {
        const style = new CSSStyleDeclaration()
        style.padding = '1px 2px 3px 4px'
        expect(style.padding).toBe('1px 2px 3px 4px')
        style.paddingLeft = '5px'
        expect(style.padding).toBe('1px 2px 3px 5px')
        style.paddingBottom = '5px'
        expect(style.padding).toBe('1px 2px 5px 5px')
        style.paddingRight = '5px'
        expect(style.padding).toBe('1px 5px 5px')
        style.paddingTop = '5px'
        expect(style.padding).toBe('5px')
        style.paddingBottom = '1px'
        expect(style.padding).toBe('5px 5px 1px')
        style.paddingTop = ''
        expect(style.padding).toBe('')
    })
})
