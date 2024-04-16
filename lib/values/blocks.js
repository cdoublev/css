
const associatedTokens = {
    '(': ')',
    '[': ']',
    '{': '}',
}

/**
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-block-contents}
 */
const contents = [
    '<at-rule-list>',
    '<block-contents>',
    '<declaration-at-rule-list>',
    '<declaration-list>',
    '<declaration-rule-list>',
    '<qualified-rule-list>',
    '<rule-list>',
]

module.exports = { associatedTokens, contents }
