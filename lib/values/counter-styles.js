
/**
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#simple-numeric}
 */
const numeric = [
    'arabic-indic',
    'armenian',
    'bengali',
    'cambodian',
    'cjk-decimal',
    'decimal-leading-zero',
    'decimal',
    'devanagari',
    'georgian',
    'gujarati',
    'gurmukhi',
    'hebrew',
    'kannada',
    'khmer',
    'lao',
    'lower-armenian',
    'lower-roman',
    'malayalam',
    'mongolian',
    'myanmar',
    'oriya',
    'persian',
    'tamil',
    'telugu',
    'thai',
    'tibetan',
    'upper-armenian',
    'upper-roman',
]

/**
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#simple-alphabetic}
 */
const alphabetic = [
    'hiragana-iroha',
    'hiragana',
    'katakana-iroha',
    'katakana',
    'lower-alpha',
    'lower-greek',
    'lower-latin',
    'upper-alpha',
    'upper-latin',
]

/**
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#simple-symbolic}
 */
const symbolic = [
    'disc',
    'circle',
    'square',
    'disclosure-open',
    'disclosure-closed',
]

/**
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#simple-fixed}
 */
const fixed = [
    'cjk-earthly-branch',
    'cjk-heavenly-stem',
]

/**
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#limited-japanese}
 */
const japanese = [
    'japanese-formal',
    'japanese-informal',
]

/**
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#limited-korean}
 */
const korean = [
    'korean-hangul-formal',
    'korean-hanja-formal',
    'korean-hanja-informal',
]

/**
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#limited-chinese}
 */
const chinese = [
    'cjk-ideographic',
    'simp-chinese-formal',
    'simp-chinese-informal',
    'trad-chinese-formal',
    'trad-chinese-informal',
]

/**
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#ethiopic-numeric-counter-style}
 */
const ethiopic = 'ethiopic-numeric'

const counterStyles = [
    ...alphabetic,
    ...chinese,
    ...ethiopic,
    ...fixed,
    ...japanese,
    ...korean,
    ...numeric,
    ...symbolic,
]

module.exports = counterStyles
