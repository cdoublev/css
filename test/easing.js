
import applyEasing from '../lib/values/easing.js'
import assert from 'node:assert/strict'
import { parseGrammar } from '../lib/parse/parser.js'
import { test } from 'node:test'

function cubic(args) {
    return parseGrammar(`cubic-bezier(${args})`, '<cubic-bezier()>')
}
function linear(args) {
    return parseGrammar(`linear(${args})`, '<linear()>')
}
function steps(args) {
    return parseGrammar(`steps(${args})`, '<steps()>')
}

test('cubic-bezier()', () => {

    const fn = cubic('0.25, 0.1, 0.25, 1')

    assert.equal(applyEasing(-1, fn), -0.4)
    assert.equal(applyEasing(0, fn), 0)
    assert.equal(+applyEasing(0.25, fn).toFixed(6), 0.408511)
    assert.equal(+applyEasing(0.5, fn).toFixed(6), 0.802403)
    assert.equal(applyEasing(1, fn), 1)
    assert.equal(applyEasing(2, fn), 1)
})
test('linear()', () => {

    const fn = linear('0 0%, 0.5 50%, 1 100%')

    assert.equal(applyEasing(-1, fn), -1)
    assert.equal(applyEasing(0, fn), 0)
    assert.equal(applyEasing(0.25, fn), 0.25)
    assert.equal(applyEasing(0.5, fn), 0.5)
    assert.equal(applyEasing(1, fn), 1)
    assert.equal(applyEasing(2, fn), 2)
})
test('steps()', () => {
    assert.equal(applyEasing(-1, steps('4, start')), 0)
    assert.equal(applyEasing(0, steps('4, start')), 0.25)
    assert.equal(applyEasing(0.1, steps('4, start')), 0.25)
    assert.equal(applyEasing(0.3, steps('4, start')), 0.5)
    assert.equal(applyEasing(0.8, steps('4, start')), 1)
    assert.equal(applyEasing(1, steps('4, start')), 1)
    assert.equal(applyEasing(2, steps('4, start')), 1)

    assert.equal(applyEasing(-1, steps('4, end')), 0)
    assert.equal(applyEasing(0, steps('4, end')), 0)
    assert.equal(applyEasing(0.1, steps('4, end')), 0)
    assert.equal(applyEasing(0.3, steps('4, end')), 0.25)
    assert.equal(applyEasing(0.8, steps('4, end')), 0.75)
    assert.equal(applyEasing(1, steps('4, end')), 1)
    assert.equal(applyEasing(2, steps('4, end')), 1)

    assert.equal(applyEasing(-1, steps('4, jump-none')), 0)
    assert.equal(applyEasing(0, steps('4, jump-none')), 0)
    assert.equal(applyEasing(0.1, steps('4, jump-none')), 0)
    assert.equal(applyEasing(0.3, steps('4, jump-none')), 1 / 3)
    assert.equal(applyEasing(0.8, steps('4, jump-none')), 1)
    assert.equal(applyEasing(1, steps('4, jump-none')), 1)
    assert.equal(applyEasing(2, steps('4, jump-none')), 1)

    assert.equal(applyEasing(-1, steps('4, jump-both')), 0)
    assert.equal(applyEasing(0, steps('4, jump-both')), 0.2)
    assert.equal(applyEasing(0.1, steps('4, jump-both')), 0.2)
    assert.equal(applyEasing(0.3, steps('4, jump-both')), 0.4)
    assert.equal(applyEasing(0.8, steps('4, jump-both')), 0.8)
    assert.equal(applyEasing(1, steps('4, jump-both')), 1)
    assert.equal(applyEasing(2, steps('4, jump-both')), 1)
})
