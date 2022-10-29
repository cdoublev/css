
/**
 * @see {@link https://drafts.csswg.org/css-page-3/#syntax-page-selector}
 */
const pageMargin = {
    cascading: true,
    names: [
        'top-left-corner',
        'top-left',
        'top-center',
        'top-right',
        'top-right-corner',
        'bottom-left-corner',
        'bottom-left',
        'bottom-center',
        'bottom-right',
        'bottom-right-corner',
        'left-top',
        'left-middle',
        'left-bottom',
        'right-top',
        'right-middle',
        'right-bottom',
    ],
    properties: require('../properties/page-margin.js'),
    type: 'margin',
    value: '<declaration-list>',
}

module.exports = pageMargin
