
module.exports = [
    require('@cdoublev/eslint-config'),
    require('@cdoublev/eslint-config/jest'),
    require('@cdoublev/eslint-config/node'),
    { languageOptions: { sourceType: 'commonjs' } },
    { ignores: ['lib/cssom/*.js', '!lib/cssom/*-impl.js'] },
]
