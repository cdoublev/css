
import { HTMLDivElement, HTMLDocument } from './dom.js'
import { CSSPseudoElement } from '../lib/cssom/index.js'
import assert from 'node:assert/strict'
import { install } from '@cdoublev/css'
import { test } from 'node:test'

install()

test('CSSPseudoElement', () => {

    const document = new HTMLDocument
    const element = new HTMLDivElement({ ownerDocument: document })
    const properties = {
        element,
        parent: element,
        selectorText: '::before',
        type: '::before',
    }
    const before = CSSPseudoElement.create(globalThis, properties)

    assert.equal(CSSPseudoElement.is(before), true)
    assert.equal(before.element, element)
    assert.equal(before.parent, element)
    assert.equal(before.selectorText, '::before')
    assert.equal(before.type, '::before')

    assert.equal(before.pseudo('::after'), null)

    const marker = before.pseudo('::marker')

    assert.equal(CSSPseudoElement.is(marker), true)
    assert.equal(marker.element, element)
    assert.equal(marker.parent, before)
    assert.equal(marker.selectorText, '::marker')
    assert.equal(marker.type, '::marker')
})
