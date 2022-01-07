
const install = require('./index.js')

const globalObject = {
    // Used by webidl2js (lib/cssom/utils.js)
    Array,
    Object,
    // Used by webidl-conversions
    Number,
    String,
    TypeError,
}

function globalSetup() {
    install(globalObject)
}

module.exports = globalSetup
