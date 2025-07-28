
const associatedTokens = {
    '(': ')',
    '[': ']',
    '{': '}',
}

module.exports = {
    associatedTokens,
    closingTokens: Object.values(associatedTokens),
    openingTokens: Object.keys(associatedTokens),
}
