
const { aliases, mappings } = require('./compatibility.js')
const properties = require('./definitions.js')

const names = [
    ...aliases.keys(),
    ...mappings.keys(),
    ...Object.keys(properties),
]

module.exports = names
