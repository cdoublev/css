
const { basename, dirname, join } = require('node:path')
const { promises: { readFile, readdir } } = require('node:fs')

const inputPath = join(dirname(require.resolve(join('webref/package.json'))), 'ed', 'css')

async function listAll() {
    const all = []
    for (const filename of await readdir(inputPath)) {
        const file = await readFile(join(inputPath, filename), 'utf8')
        all.push([basename(filename, '.json'), JSON.parse(file)])
    }
    return Object.fromEntries(all)
}

module.exports = { listAll }
