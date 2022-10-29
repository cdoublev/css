
const { none } = require('./defaults.js')

const collapse = { type: new Set(['keyword']), value: 'collapse' }
const nowrap = { type: new Set(['keyword']), value: 'nowrap' }
const preserve = { type: new Set(['keyword']), value: 'preserve' }
const preserveBreaks = { type: new Set(['keyword']), value: 'preserve-breaks' }
const wrap = { type: new Set(['keyword']), value: 'wrap' }

module.exports = new Map([
    ['normal', [collapse, wrap, none]],
    ['nowrap', [collapse, nowrap, none]],
    ['pre', [preserve, nowrap, none]],
    ['pre-wrap', [preserve, wrap, none]],
    ['pre-line', [preserveBreaks, wrap, none]],
    // https://drafts.csswg.org/css-text-4/#issue-b152bd86
    // ['break-spaces', [preserve, wrap, none]],
])
