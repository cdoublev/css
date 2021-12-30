
const webidlCSSStyleDeclarationWrapper = require('./lib/cssom/CSSStyleDeclaration.js')

const sharedGlobalObject = {
    // Used by webidl2js (lib/utils.js)
    Array,
    Object,
    // Used by webidl-conversions
    Number,
    String,
    TypeError,
}
webidlCSSStyleDeclarationWrapper.install(sharedGlobalObject, ['Window'])

const origCSSStyleDeclaration = sharedGlobalObject.CSSStyleDeclaration

/**
 * @param {object} privateData
 * @returns {CSSStyleDeclaration}
 * @see {@link https://drafts.csswg.org/cssom/#css-declaration-blocks}
 * @see {@link https://drafts.csswg.org/cssom/#the-elementcssinlinestyle-mixin}
 * @see {@link https://drafts.csswg.org/cssom/#dom-window-getcomputedstyle}
 * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylerule-style}
 * @see {@link https://drafts.csswg.org/cssom/#dom-cssgroupingrule-style}
 * @see {@link https://drafts.csswg.org/cssom/#dom-cssmarginrule-style}
 *
 * `privateData` should define the underlying state ie.:
 * - for `StyleRule.style`, `PageRule.style`, `MarginRule.style`:
 *   - computed: false
 *   - parentRule: context object
 *   - ownerNode: null
 * - for `Element.style`:
 *   - computed: false
 *   - parentRule: null
 *   - ownerNode: context object
 * - for `getComputedStyle(element)`:
 *   - computed: true
 *   - parentRule: null
 *   - ownerNode: element
 */
function CSSStyleDeclaration(privateData) {
    if (new.target === undefined) {
        throw new TypeError("Class constructor CSSStyleDeclaration cannot be invoked without 'new'")
    }
    return webidlCSSStyleDeclarationWrapper.create(sharedGlobalObject, undefined, privateData)
}

sharedGlobalObject.CSSStyleDeclaration = CSSStyleDeclaration
// TODO: figure out how is it different than `Object.setPrototypeOf(CSSStyleDeclaration, ...)
Object.defineProperty(CSSStyleDeclaration, 'prototype', {
    value: origCSSStyleDeclaration.prototype,
    writable: false,
})
CSSStyleDeclaration.prototype.constructor = CSSStyleDeclaration
Object.setPrototypeOf(CSSStyleDeclaration, Object.getPrototypeOf(origCSSStyleDeclaration))

module.exports = CSSStyleDeclaration
