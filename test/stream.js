
import { beforeEach, describe, it } from 'node:test'
import Stream from '../lib/parse/stream.js'
import assert from 'node:assert'

const string = 'hello'
const stream = new Stream(string)
const error = Error('oups')

beforeEach(() => {
    stream.index = -1
})

describe('consume(item, fallback)', () => {
    it('throws an error when the given item is not at the front of the stream', () => {
        assert.throws(() => stream.consume('_', Error), { message: '"_" was expected' })
        assert.throws(() => stream.consume('_', error), error)
        assert.equal(stream.index, -1)
    })
    it('consumes the item at the front of the stream', () => {
        assert.equal(stream.consume(), 'h')
        assert.equal(stream.current, 'h')
        assert.equal(stream.index, 0)
    })
    it('consumes the given n items at the front of the stream', () => {
        assert.equal(stream.consume(2), 'he')
        assert.equal(stream.consume(string.length), 'llo')
        assert.equal(stream.consume(string.length), '')
        assert.equal(stream.index, string.length - 1)
    })
    it('consumes an item matching the given item at the front of the stream', () => {
        assert.equal(stream.consume('h'), 'h')
        assert.equal(stream.consume('_'), null)
        assert.equal(stream.consume('_', 'e'), 'e')
        assert.equal(stream.current, 'h')
        assert.equal(stream.index, 0)
    })
    it('consumes an item matching the given predicate at the front of the stream', () => {
        assert.equal(stream.consume(char => char === 'h'), 'h')
        assert.equal(stream.consume(char => char === 'e' ? 'success' : null), 'success')
        assert.equal(stream.consume(char => char === 'e' ? 'success' : false), null)
        assert.equal(stream.consume(char => char === 'e' ? 'success' : error), error)
        assert.equal(stream.consume(char => char === stream.current), 'l')
        assert.equal(stream.consume((char, arg1, arg2) => char === 'l' ? `${arg1}${arg2}` : null, 'l', 'o'), 'lo')
        assert.equal(stream.index, 3)
    })
})

describe('backtrack(index)', () => {
    it('throws an error when trying to move at an index greater than the current stream index', () => {
        assert.throws(() => stream.backtrack(0), { message: 'Unexpected backtrack index greater than current stream index' })
    })
    it('moves the stream back to the item at the given index', () => {
        stream.consume()
        stream.backtrack(-1)
        assert.equal(stream.current, undefined)
        assert.equal(stream.index, -1)
    })
})

describe('reconsume(size)', () => {
    it('pushes the given n items back to the front of the stream', () => {
        stream.index = string.length - 1
        stream.reconsume()
        assert.equal(stream.current, 'l')
        stream.reconsume(2)
        assert.equal(stream.current, 'e')
        stream.reconsume(2)
        assert.equal(stream.current, undefined)
    })
})

describe('consumeRunOf(...items)', () => {
    it('consumes all consecutive occurrences of the given item at the front of the stream', () => {
        stream.index = 1
        assert.equal(stream.consumeRunOf('l'), 'll')
        assert.equal(stream.current, 'l')
        assert.equal(stream.index, 3)
    })
    it('consumes all consecutive occurrences of the given items at the front of the stream', () => {
        const stream = new Stream('csscsscss.')
        assert.equal(stream.consumeRunOf('c', 's'), 'csscsscss')
        assert.equal(stream.current, 's')
        assert.equal(stream.index, 8)
    })
    it('consumes all consecutive items matching the given predicate at the front of the stream', () => {
        const stream = new Stream('csscsscss.')
        assert.equal(stream.consumeRunOf(char => char === 'c' || char === 's'), 'csscsscss')
        assert.equal(stream.current, 's')
        assert.equal(stream.index, 8)
    })
})

describe('consumeUntil(item)', () => {
    it('throws an error when the given item is not found in the stream', () => {
        stream.index = 2
        assert.throws(() => stream.consumeUntil('_'), { message: '"_" was expected' })
        assert.equal(stream.index, 2)
    })
    it('consumes consecutive occurrences of the given item at the front of the stream', () => {
        assert.equal(stream.consumeUntil('o'), 'hell')
        assert.equal(stream.current, 'l')
        assert.equal(stream.index, 3)
    })
})

describe('next(size, offset = 0)', () => {
    it('returns the given size of next items located at the given offset from index', () => {
        assert.equal(stream.next(), 'h')
        assert.equal(stream.next(1, 0), 'h')
        assert.equal(stream.next(1, 1), 'e')
        assert.equal(stream.next(1, 2), 'l')
        assert.equal(stream.next(2), 'he')
        assert.equal(stream.next(2, 1), 'el')
        assert.equal(stream.next(2, 2), 'll')
        assert.equal(stream.next(3, 2), 'llo')
        assert.equal(stream.next(Infinity), 'hello')
        assert.equal(stream.next(Infinity, 1), 'ello')
    })
})

describe('prev(size, offset = 0)', () => {
    it('returns the given size of previous items located at the given offset from index', () => {
        stream.index = string.length
        assert.equal(stream.prev(), 'o')
        assert.equal(stream.prev(1, 0), 'o')
        assert.equal(stream.prev(1, 1), 'l')
        assert.equal(stream.prev(1, 2), 'l')
        assert.equal(stream.prev(2), 'lo')
        assert.equal(stream.prev(2, 1), 'll')
        assert.equal(stream.prev(2, 2), 'el')
        assert.equal(stream.prev(3, 2), 'hel')
        assert.equal(stream.index, string.length)
        assert.equal(stream.prev(Infinity), 'hello')
        assert.equal(stream.prev(Infinity, 1), 'hell')
    })
})

describe('peek(predicate)', () => {
    it('returns whether the next item satisfies the given predicate', () => {
        assert.equal(stream.peek(char => char === '.'), false)
        assert.equal(stream.peek(char => char === 'h'), true)
        stream.index = string.length - 1
        assert.equal(stream.peek(_ => true), false)
    })
})

describe('atEnd(offset = 0)', () => {
    it('returns false when some items have not been consumed', () => {
        assert.equal(stream.atEnd(), false)
        assert.equal(stream.atEnd(string.length - 1), false)
    })
    it('returns true when all items have been consumed', () => {
        assert.equal(stream.atEnd(string.length), true)
        stream.index = string.length - 1
        assert.equal(stream.atEnd(), true)
    })
})

describe('loops', () => {
    it('iterates over the items', () => {
        const string = 'hello world!'
        const stream = new Stream(string)
        let index = 0
        assert.equal(stream.current, undefined)
        for (const char of stream) {
            assert.notEqual(char, undefined)
            assert.equal(char, string[index])
            assert.equal(stream.current, char)
            assert.equal(stream.index, index)
            assert.equal(stream.next(), string[index + 1])
            if (++index === string.length) {
                assert.equal(stream.atEnd(), true)
            } else {
                assert.equal(stream.atEnd(), false)
            }
        }
        assert.equal(string.length, index)
        assert.equal(stream.atEnd(), true)
    })
    it('iterates over a slice of the items while iterating over all items', () => {
        const string = 'a nested word'
        const stream = new Stream(string)
        let nested = ''
        parentLoop: for (const _ of stream) {
            if (stream.consume(' ')) {
                for (const char of stream) {
                    if (char === ' ') {
                        break parentLoop
                    }
                    nested += char
                }
            }
        }
        assert.equal(nested, 'nested')
    })
    it('consumes an item while the stream is not at end', () => {
        const string = 'a nested word'
        const stream = new Stream(string)
        let nested = ''
        while (!stream.atEnd()) {
            const current = stream.consume()
            if (current === ' ') {
                for (const char of stream) {
                    if (char === ' ') {
                        break
                    }
                    nested += char
                }
            }
        }
        assert.equal(nested, 'nested')
    })
    it('reconsumes an item while iterating over the items', () => {
        const stream = new Stream(string)
        let output = ''
        let i = 0
        for (const char of stream) {
            if (char === 'e' && ++i < 3) {
                stream.reconsume()
            }
            output += char
        }
        assert.equal(output, 'heeello')
    })
})

it('works with an array', () => {

    const array = ['hello', ' ', 'world', '!']
    const stream = new Stream(array)

    assert.equal(stream.current, undefined)
    assert.equal(stream.next(), 'hello')
    assert.deepEqual(stream.next(2), ['hello', ' '])
    assert.equal(stream.next(1, 1), ' ')
    assert.deepEqual(stream.next(2, 1), [' ', 'world'])
    assert.equal(stream.consume(), 'hello')
    assert.equal(stream.current, 'hello')
    assert.deepEqual(stream.consume(2), [' ', 'world'])
    assert.equal(stream.current, 'world')
    assert.equal(stream.prev(), ' ')
    assert.equal(stream.prev(1, 1), 'hello')
    assert.deepEqual(stream.prev(2, 1), ['hello'])

    stream.index = -1

    assert.equal(stream.current, undefined)
    assert.deepEqual(stream.consumeUntil('!'), ['hello', ' ', 'world'])
    assert.equal(stream.consume(), '!')
    assert.equal(stream.consume('!'), null)

    stream.index = 2
    stream.data.splice(stream.index, 0, 'beautiful', ' ')
    stream.index = -1
    assert.deepEqual(stream.consumeUntil('!'), ['hello', ' ', 'beautiful', ' ', 'world'])

    stream.index = -1
    let index = 0
    for (const char of stream) {
        assert.equal(char, ['hello', ' ', 'beautiful', ' ', 'world', '!'][index++])
    }
})
it('works with an iterator', () => {

    const iterator = string[Symbol.iterator]()
    const stream = new Stream(iterator)

    assert.equal(stream.current, undefined)
    assert.equal(stream.next(), 'h')
    assert.deepEqual(stream.next(2), ['h', 'e'])
    assert.equal(stream.next(1, 1), 'e')
    assert.deepEqual(stream.next(2, 1), ['e', 'l'])
    assert.equal(stream.consume(), 'h')
    assert.equal(stream.current, 'h')
    assert.deepEqual(stream.consume(2), ['e', 'l'])
    assert.equal(stream.current, 'l')
    assert.equal(stream.prev(), 'e')
    assert.equal(stream.prev(1, 1), 'h')

    stream.index = -1

    assert.equal(stream.current, undefined)
    assert.deepEqual(stream.consumeUntil('o'), ['h', 'e', 'l', 'l'])
    assert.equal(stream.consume(), 'o')
    assert.equal(stream.consume('o'), null)

    stream.index = -1

    let index = 0
    for (const char of stream) {
        assert.equal(char, string[index++])
    }
})
