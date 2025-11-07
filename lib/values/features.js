/* eslint-disable @stylistic/js/quote-props */

import descriptors from '../descriptors/definitions.js'

const { '@container': container, '@media': media } = descriptors

export default {
    '@container': {
        '<scroll-state-feature>': {
            'scrollable': container['scrollable'],
            'scrolled': container['scrolled'],
            'snapped': container['snapped'],
            'stuck': container['stuck'],
        },
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
