/**
 * This script extracts code point ranges of strong bidirectional types AL and R
 * (right to left), and L (left to right), from the Unicode Character Database
 * into /lib/values/rtl.js and /lib/values/ltr.js.
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const source = 'https://www.unicode.org/Public/17.0.0/ucd/extracted/DerivedBidiClass.txt'
const head = `
/**
 * @see {@link ${source}}
 */
export default [
`
const ltr = []
const rtl = []

/**
 * @param {string} source
 * @returns {Promise}
 */
async function extractCharacterBidiClassDefinition(source) {
    const response = await fetch(source)
    const text = await response.text()
    for (const line of text.split('\n')) {
        const match = /^([A-F0-9]{4})(\.\.[A-F0-9]{4})?\s+; (AL|L|R) /.exec(line)
        if (match) {
            const [, from, to, type] = match
            const ranges = type === 'L' ? ltr : rtl
            ranges.push(to ? [`[0x${from}, 0x${to.slice(2)}]`] : `[0x${from}]`)
        }
    }
    return Promise.all([
        fs.writeFile(
            path.join(import.meta.dirname, '..', 'lib', 'values', 'ltr.js'),
            `${head}    ${ltr.join(',\n    ')},\n]\n`),
        fs.writeFile(
            path.join(import.meta.dirname, '..', 'lib', 'values', 'rtl.js'),
            `${head}    ${rtl.join(',\n    ')},\n]\n`),
        ])
}

try {
    await extractCharacterBidiClassDefinition(source)
} catch (error) {
    console.log('Please report this issue: https://github.com/cdoublev/css/issues/new')
    throw error
}
