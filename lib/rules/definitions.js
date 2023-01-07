
const root = {
    // "Interpret all of the resulting top-level qualified rules as style rules".
    qualified: 'style',
    rules: {
        'color-profile': require('./color-profile.js'),
        'container': require('./container.js'),
        'counter-style': require('./counter-style.js'),
        'font-face': require('./font-face.js'),
        'font-feature-values': require('./font-feature-values.js'),
        'font-palette-values': require('./font-palette-values.js'),
        'import': require('./import.js'),
        'keyframes': require('./keyframes.js'),
        'layer': require('./layer.js'),
        'media': require('./media.js'),
        'namespace': require('./namespace.js'),
        'page': require('./page.js'),
        'property': require('./property.js'),
        'style': require('./style.js'),
        'supports': require('./supports.js'),
    },
    value: '<rule-list>',
}

module.exports = root
