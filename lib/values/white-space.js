
import { keyword } from './value.js'
import { none } from './defaults.js'

const collapse = keyword('collapse')
const nowrap = keyword('nowrap', ['text-wrap-mode'])
const preserve = keyword('preserve')
const preserveBreaks = keyword('preserve-breaks')
const wrap = keyword('wrap', ['text-wrap-mode'])

/**
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-white-space}
 */
export const mapping = new Map([
    ['normal', [collapse, wrap, none]],
    ['pre', [preserve, nowrap, none]],
    ['pre-wrap', [preserve, wrap, none]],
    ['pre-line', [preserveBreaks, wrap, none]],
])
