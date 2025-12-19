
import { DELETE_UNEXISTENT_MEDIUM_ERROR } from '../lib/error.js'
import { MediaList } from '../lib/cssom/index.js'
import assert from 'node:assert'
import { install } from '@cdoublev/css'
import test from 'node:test'

install()

function createMediaList(text) {
    const media = MediaList.create(globalThis)
    if (text) {
        media.mediaText = text
    }
    return media
}

test('MediaList.length', () => {
    const media = createMediaList('all, screen')
    assert.equal(media.length, 2)
})
test('MediaList.mediaText', () => {
    const media = createMediaList()
    media.mediaText = 'all, ;'
    assert.equal(media.mediaText, 'all, not all')
})
test('MediaList.item()', () => {
    const media = createMediaList('all')
    assert.equal(media.item(0), 'all')
    assert.equal(media.item(1), null)
})
test('MediaList.appendMedium()', () => {
    const media = createMediaList()
    media.appendMedium('all, ;')
    assert.equal(media.mediaText, '')
    media.appendMedium('all')
    assert.equal(media.mediaText, 'all')
    media.appendMedium(';')
    assert.equal(media.mediaText, 'all, not all')
    media.appendMedium(';')
    assert.equal(media.mediaText, 'all, not all')
    media.appendMedium('all and (condition)')
    assert.equal(media.mediaText, 'all, not all, (condition)')
    media.appendMedium('all and (condition)')
    assert.equal(media.mediaText, 'all, not all, (condition)')
})
test('MediaList.deleteMedium()', () => {
    const media = createMediaList('all, all, not all, all and (condition)')
    media.deleteMedium('all, not all')
    assert.equal(media.mediaText, 'all, all, not all, (condition)')
    media.deleteMedium('all')
    assert.equal(media.mediaText, 'not all, (condition)')
    media.deleteMedium('all and (condition)')
    assert.equal(media.mediaText, 'not all')
    assert.throws(() => media.deleteMedium('all'), DELETE_UNEXISTENT_MEDIUM_ERROR)
})
