
/**
 * @see {@link https://drafts.csswg.org/css-display-4/#propdef-display}
 */
const aliases = new Map([
    ['block flex', 'flex'],
    ['block flow', 'block'],
    ['block flow list-item', 'list-item'],
    ['block flow-root', 'flow-root'],
    ['block grid', 'grid'],
    ['block table', 'table'],
    ['inline flex', 'inline-flex'],
    ['inline flow', 'inline'],
    ['inline flow list-item', 'inline list-item'],
    ['inline flow-root', 'inline-block'],
    ['inline grid', 'inline-grid'],
    ['inline ruby', 'ruby'],
    ['inline table', 'inline-table'],
    ['run-in flow', 'run-in'],
])

module.exports = { aliases }
