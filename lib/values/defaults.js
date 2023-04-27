
const { createList } = require('./value.js')

const omitted = { omitted: true, type: new Set() }

const auto = { type: new Set(['ident', 'keyword']), value: 'auto' }
const column = { type: new Set(['ident', 'keyword']), value: 'column' }
const comma = { type: new Set(['delimiter']), value: ',' }
const discard = { type: new Set(['ident', 'keyword']), value: 'discard' }
const justify = { type: new Set(['ident', 'keyword']), value: 'justify' }
const noAutospace = { type: new Set(['ident', 'keyword']), value: 'no-autospace' }
const none = { type: new Set(['ident', 'keyword']), value: 'none' }
const notAll = createList(
    [
        { type: new Set(['ident', 'keyword']), value: 'not' },
        { type: new Set(['ident', 'media-type']), value: 'all' },
        omitted,
    ],
    ' ',
    ['media-query'])
const one = { type: new Set(['number']), value: 1 }
const revertLayer = { type: new Set(['ident', 'keyword']), value: 'revert-layer' }
const row = { type: new Set(['ident', 'keyword']), value: 'row' }
const spaceAll = { type: new Set(['ident', 'keyword', 'spacing-trim']), value: 'space-all' }
const spacingTrim = createList(
    [omitted, { type: new Set(['ident', 'keyword']), value: 'space-first' }],
    ' ',
    ['spacing-trim'])
const start = { type: new Set(['ident', 'keyword']), value: 'start' }
const webkitDiscard = { type: new Set(['ident', 'keyword']), value: '-webkit-discard' }
const zero = { type: new Set(['number']), value: 0 }
const zeroPx = { type: new Set(['dimension', 'length']), unit: 'px', value: 0 }

module.exports = {
    auto,
    column,
    comma,
    discard,
    justify,
    noAutospace,
    none,
    notAll,
    one,
    revertLayer,
    row,
    spaceAll,
    spacingTrim,
    start,
    webkitDiscard,
    zero,
    zeroPx,
}
