
import { basename, dirname, join } from 'node:path'
import { readFile, readdir } from 'node:fs/promises'

const webrefPath = dirname(import.meta.resolve(join('webref', 'package.json'))).replace('file://', '')
const inputPath = join(webrefPath, 'ed', 'css')

export async function listAll() {
    const all = []
    for (const filename of await readdir(inputPath)) {
        const file = await readFile(join(inputPath, filename), 'utf-8')
        all.push([basename(filename, '.json'), JSON.parse(file)])
    }
    return Object.fromEntries(all)
}
