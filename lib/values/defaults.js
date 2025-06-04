
const { ident, keyword, length, list, number, omitted } = require('./value.js')

module.exports = {
    auto: keyword('auto'),
    collapse: keyword('collapse'),
    column: keyword('column'),
    justify: keyword('justify'),
    noAutospace: keyword('no-autospace'),
    noRepeat: keyword('no-repeat', ['<repeat-style>']),
    none: keyword('none'),
    notAll: list([ident('not'), ident('all', ['<media-type>']), omitted], ' ', ['<media-query>']),
    one: number(1),
    repeat: keyword('repeat', ['<repetition>']),
    row: keyword('row'),
    spaceAll: keyword('space-all', ['<spacing-trim>']),
    spacingTrim: list([omitted, keyword('space-first')], ' ', ['<spacing-trim>']),
    start: keyword('start'),
    transparent: keyword('transparent'),
    webkitLegacy: keyword('-webkit-legacy'),
    zero: number(0),
    zeroPx: length(0, 'px'),
}
