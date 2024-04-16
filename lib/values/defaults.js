
const { delimiter, ident, keyword, length, list, number, omitted } = require('./value.js')

module.exports = {
    auto: keyword('auto'),
    column: keyword('column'),
    comma: delimiter(','),
    discard: keyword('discard'),
    justify: keyword('justify'),
    noAutospace: keyword('no-autospace'),
    none: keyword('none'),
    notAll: list([ident('not'), ident('all', ['<media-type>']), omitted], ' ', ['<media-query>']),
    one: number(1),
    row: keyword('row'),
    spaceAll: keyword('space-all', ['<spacing-trim>']),
    spacingTrim: list([omitted, keyword('space-first')], ' ', ['<spacing-trim>']),
    start: keyword('start'),
    transparent: keyword('transparent'),
    webkitDiscard: keyword('-webkit-discard'),
    zero: number(0),
    zeroPx: length(0, 'px'),
}
