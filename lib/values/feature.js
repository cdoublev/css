/* eslint-disable @stylistic/js/quote-props */

import descriptors from '../descriptors/definitions.js'

const { '@container': container, '@media': media } = descriptors

/**
 * @see {@link https://drafts.csswg.org/css-conditional-5/#dfn-support-named-feature}
 */
export const named = [
    'anchor-position-follows-transforms',
    'single-axis-scroll-container',
]

export const definitions = {
    '@container': {
        /**
         * @see {@link https://drafts.csswg.org/css-anchor-position-2/#typedef-anchored-feature}
         */
        '<anchored-feature>': {
            'fallback': container['fallback'],
        },
        /**
         * @see {@link https://drafts.csswg.org/css-conditional-5/#typedef-scroll-state-feature}
         */
        '<scroll-state-feature>': {
            'scrollable': container['scrollable'],
            'scrolled': container['scrolled'],
            'snapped': container['snapped'],
            'stuck': container['stuck'],
        },
        /**
         * @see {@link https://drafts.csswg.org/css-conditional-5/#typedef-size-feature}
         */
        '<size-feature>': {
            'aspect-ratio': container['aspect-ratio'],
            'block-size': container['block-size'],
            'height': container['height'],
            'inline-size': container['inline-size'],
            'orientation': container['width'],
            'width': container['width'],
        },
    },
    '@media': media,
}
