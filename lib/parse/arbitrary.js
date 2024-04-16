
module.exports = {
    '<any-value>': (input, parser) => parser.consumeAnyValue(input),
    '<declaration-value>': (input, parser) => parser.consumeDeclarationValue(input),
    '<declaration>': (input, parser) => {
        const match = parser.consumeDeclaration(input)
        // Allow falling back to <general-enclosed> in <supports-condition>
        if (match instanceof SyntaxError) {
            return null
        }
        return match
    },
}
