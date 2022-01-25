
const wrapper = require('../CSSStyleDeclaration.js')

const sharedGlobalObject = {
    // Used by webidl2js (lib/cssom/utils.js)
    Array,
    Object,
    // Used by webidl-conversions
    Number,
    String,
    TypeError,
}
wrapper.install(sharedGlobalObject, ['Window'])

const { CSSStyleDeclaration: Implementation } = sharedGlobalObject

function CSSStyleDeclaration() {
    if (new.target === undefined) {
        throw new TypeError("Class constructor CSSStyleDeclaration cannot be invoked without 'new'")
    }
    return wrapper.create(sharedGlobalObject, undefined)
}

sharedGlobalObject.CSSStyleDeclaration = CSSStyleDeclaration
Object.defineProperty(CSSStyleDeclaration, 'prototype', {
    value: Implementation.prototype,
    writable: false,
})
CSSStyleDeclaration.prototype.constructor = CSSStyleDeclaration
Object.setPrototypeOf(CSSStyleDeclaration, Object.getPrototypeOf(Implementation))

module.exports = CSSStyleDeclaration
