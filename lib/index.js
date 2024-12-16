
// Import parser before cssom (circular dependency)
const parser = require('./parse/parser.js')
const cssom = require('./cssom/index.js')

/**
 * @param {DocumentOrShadowRoot} globalObject
 */
function install(globalObject = globalThis) {
    Object.values(cssom).forEach(wrapper => wrapper.install(globalObject, ['Window']))
    globalObject.CSS = cssom.CSS.create(globalObject)
}

module.exports = { cssom, install, parser }
