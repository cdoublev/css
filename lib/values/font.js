
const family = {
    /**
     * @see {@link https://drafts.csswg.org/css-fonts-4/#generic-font-families}
     */
    generic: [
        'cursive',
        'fangsong',
        'fantasy',
        'math',
        'monospace',
        'sans-serif',
        'serif',
        'system-ui',
        'ui-monospace',
        'ui-rounded',
        'ui-sans-serif',
        'ui-serif',
    ],
}

/**
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-weight}
 */
const weight = new Map([
    ['100', 'thin'],
    ['200', 'extra-light'],
    ['300', 'light'],
    ['400', 'normal'],
    ['500', 'medium'],
    ['600', 'semi-bold'],
    ['700', 'bold'],
    ['800', 'extra-bold'],
    ['900', 'black'],
])

/**
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-width}
 */
const width = new Map([
    ['50%', 'ultra-condensed'],
    ['62.5%', 'extra-condensed'],
    ['75%', 'condensed'],
    ['87.5%', 'semi-condensed'],
    ['100%', 'normal'],
    ['112.5%', 'semi-expanded'],
    ['125%', 'expanded'],
    ['150%', 'extra-expanded'],
    ['200%', 'ultra-expanded'],
])

module.exports = {
    family,
    weight,
    width,
}
