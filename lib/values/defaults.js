
const { createList } = require('./value.js')

const auto = { type: new Set(['ident', 'keyword']), value: 'auto' }
const center = { type: new Set(['ident', 'keyword']), value: 'center' }
const atCenter = createList([
    { type: new Set(['ident', 'keyword']), value: 'at' },
    createList([center, center], ' ', ['position']),
])
const column = { type: new Set(['ident', 'keyword']), value: 'column' }
const comma = { type: new Set(['delimiter']), value: ',' }
const discard = { type: new Set(['ident', 'keyword']), value: 'discard' }
const justify = { type: new Set(['ident', 'keyword']), value: 'justify' }
const none = { type: new Set(['ident', 'keyword']), value: 'none' }
const notAll = createList(
    [
        { type: new Set(['ident', 'keyword']), value: 'not' },
        { type: new Set(['ident', 'media-type']), value: 'all' },
        { omitted: true },
    ],
    ' ',
    ['media-query'])
const one = { type: new Set(['number']), value: 1 }
const row = { type: new Set(['ident', 'keyword']), value: 'row' }
const start = { type: new Set(['ident', 'keyword']), value: 'start' }
const webkitDiscard = { type: new Set(['ident', 'keyword']), value: '-webkit-discard' }
const zero = { type: new Set(['number']), value: 0 }
const zeroPx = { type: new Set(['dimension', 'length']), unit: 'px', value: 0 }

module.exports = {
    atCenter,
    auto,
    column,
    comma,
    discard,
    justify,
    none,
    notAll,
    one,
    row,
    start,
    webkitDiscard,
    zero,
    zeroPx,
}
