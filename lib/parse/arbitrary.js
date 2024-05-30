
module.exports = {
    '<any-value>': (input, parser) => parser.consumeAnyValue(input),
    '<declaration-value>': (input, parser) => parser.consumeDeclarationValue(input),
    '<declaration>': (input, parser) => parser.consumeDeclaration(input),
}
