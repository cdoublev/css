
/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#match-a-complex-selector-against-an-element}
 */
function matchComplexSelectorAgainstElement(element) {}

/**
 * @param {Element} element
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#match-a-selector-against-an-element}
 * @see {@link https://dom.spec.whatwg.org/#dom-element-closest}
 * @see {@link https://dom.spec.whatwg.org/#dom-element-matches}
 */
function matchSelectorAgainstElement(element) {}

/**
 * @param {CSSPseudoElement} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#match-a-selector-against-a-pseudo-element}
 */
function matchSelectorAgainstPseudoElement(pseudo) {}

/**
 * @param {Element[]} tree
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#match-a-selector-against-a-tree}
 * @see {@link https://dom.spec.whatwg.org/#scope-match-a-selectors-string}
 */
function matchSelectorAgainstTree(tree) {}

export {
    matchSelectorAgainstElement,
    matchSelectorAgainstTree,
}
