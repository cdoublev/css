
const interfaces = Object.values(require('./lib/cssom/index.js'))

/**
 * @param {DocumentOrShadowRoot} globalObject
 */
function install(globalObject = globalThis) {
    interfaces.forEach(wrapper => wrapper.install(globalObject, ['Window']))
}

module.exports = install
