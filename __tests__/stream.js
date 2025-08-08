
import Stream from '../lib/parse/stream.js'

const string = 'hello'
const stream = new Stream(string)
const error = Error('oups')

beforeEach(() => {
    stream.reset()
})

describe('moveTo(index)', () => {
    it('moves the stream to the item at the given index', () => {
        stream.moveTo(1)
        expect(stream.current).toBe('e')
        expect(stream.index).toBe(1)
    })
})

describe('moveToEnd()', () => {
    it('moves the stream to the last item', () => {
        stream.moveToEnd()
        expect(stream.current).toBe('o')
        expect(stream.index).toBe(string.length - 1)
    })
})

describe('consume(item, fallback)', () => {
    it('throws an error when the given item is not at the front of the stream', () => {
        expect(() => stream.consume('_', Error)).toThrow('"_" was expected')
        expect(() => stream.consume('_', error)).toThrow('oups')
        expect(stream.index).toBe(-1)
    })
    it('consumes the item at the front of the stream', () => {
        expect(stream.consume()).toBe('h')
        expect(stream.current).toBe('h')
        expect(stream.index).toBe(0)
    })
    it('consumes the given n items at the front of the stream', () => {
        expect(stream.consume(2)).toBe('he')
        expect(stream.consume(string.length)).toBe('llo')
        expect(stream.consume(string.length)).toBe('')
        expect(stream.index).toBe(string.length - 1)
    })
    it('consumes an item matching the given item at the front of the stream', () => {
        expect(stream.consume('h')).toBe('h')
        expect(stream.consume('_')).toBeNull()
        expect(stream.consume('_', 'e')).toBe('e')
        expect(stream.current).toBe('h')
        expect(stream.index).toBe(0)
    })
    it('consumes an item matching the given predicate at the front of the stream', () => {
        expect(stream.consume(char => char === 'h')).toBe('h')
        expect(stream.consume(char => char === 'e' ? 'success' : null)).toBe('success')
        expect(stream.consume(char => char === 'e' ? 'success' : false)).toBeNull()
        expect(stream.consume(char => char === 'e' ? 'success' : error)).toBe(error)
        expect(stream.consume(char => char === stream.current)).toBe('l')
        expect(stream.consume((char, arg1, arg2) => char === 'l' ? `${arg1}${arg2}` : null, 'l', 'o')).toBe('lo')
        expect(stream.index).toBe(3)
    })
})

describe('reconsume(size)', () => {
    it('pushes the given n items back to the front of the stream', () => {
        stream.moveTo(string.length - 1)
        stream.reconsume()
        expect(stream.current).toBe('l')
        stream.reconsume(2)
        expect(stream.current).toBe('e')
        stream.reconsume(2)
        expect(stream.current).toBeUndefined()
    })
})

describe('consumeRunOf(...items)', () => {
    it('consumes all consecutive occurrences of the given item at the front of the stream', () => {
        stream.moveTo(1)
        expect(stream.consumeRunOf('l')).toBe('ll')
        expect(stream.current).toBe('l')
        expect(stream.index).toBe(3)
    })
    it('consumes all consecutive occurrences of the given items at the front of the stream', () => {
        const stream = new Stream('csscsscss.')
        expect(stream.consumeRunOf('c', 's')).toBe('csscsscss')
        expect(stream.current).toBe('s')
        expect(stream.index).toBe(8)
    })
    it('consumes all consecutive items matching the given predicate at the front of the stream', () => {
        const stream = new Stream('csscsscss.')
        expect(stream.consumeRunOf(char => char === 'c' || char === 's')).toBe('csscsscss')
        expect(stream.current).toBe('s')
        expect(stream.index).toBe(8)
    })
})

describe('consumeUntil(item)', () => {
    it('throws an error when the given item is not found in the stream', () => {
        stream.moveTo(2)
        expect(() => stream.consumeUntil('_')).toThrow('"_" was expected')
        expect(stream.index).toBe(2)
    })
    it('consumes consecutive occurrences of the given item at the front of the stream', () => {
        expect(stream.consumeUntil('o')).toBe('hell')
        expect(stream.current).toBe('l')
        expect(stream.index).toBe(3)
    })
})

describe('reset()', () => {
    it('pushes all items back to the front of the stream', () => {
        stream.moveToEnd()
        stream.reset()
        expect(stream.current).toBeUndefined()
        expect(stream.next()).toBe('h')
        expect(stream.index).toBe(-1)
    })
})

describe('next(size, offset = 0)', () => {
    it('returns the given size of next items located at the given offset from index', () => {
        expect(stream.next()).toBe('h')
        expect(stream.next(1, 0)).toBe('h')
        expect(stream.next(1, 1)).toBe('e')
        expect(stream.next(1, 2)).toBe('l')
        expect(stream.next(2)).toBe('he')
        expect(stream.next(2, 1)).toBe('el')
        expect(stream.next(2, 2)).toBe('ll')
        expect(stream.next(3, 2)).toBe('llo')
        expect(stream.next(Infinity)).toBe('hello')
        expect(stream.next(Infinity, 1)).toBe('ello')
    })
})

describe('prev(size, offset = 0)', () => {
    it('returns the given size of previous items located at the given offset from index', () => {
        stream.moveTo(string.length)
        expect(stream.prev()).toBe('o')
        expect(stream.prev(1, 0)).toBe('o')
        expect(stream.prev(1, 1)).toBe('l')
        expect(stream.prev(1, 2)).toBe('l')
        expect(stream.prev(2)).toBe('lo')
        expect(stream.prev(2, 1)).toBe('ll')
        expect(stream.prev(2, 2)).toBe('el')
        expect(stream.prev(3, 2)).toBe('hel')
        expect(stream.index).toBe(string.length)
        expect(stream.prev(Infinity)).toBe('hello')
        expect(stream.prev(Infinity, 1)).toBe('hell')
    })
})

describe('atEnd(offset = 0)', () => {
    it('returns false when some items have not been consumed', () => {
        expect(stream.atEnd()).toBeFalsy()
        expect(stream.atEnd(string.length - 1)).toBeFalsy()
    })
    it('returns true when all items have been consumed', () => {
        expect(stream.atEnd(string.length)).toBeTruthy()
        stream.moveToEnd()
        expect(stream.atEnd()).toBeTruthy()
    })
})

describe('loops', () => {
    it('iterates over the items', () => {
        const string = 'hello world!'
        const stream = new Stream(string)
        let index = 0
        expect(stream.current).toBeUndefined()
        for (const char of stream) {
            expect(char).toBeDefined()
            expect(char).toBe(string[index])
            expect(stream.current).toBe(char)
            expect(stream.index).toBe(index)
            expect(stream.next()).toBe(string[index + 1])
            if (++index === string.length) {
                expect(stream.atEnd()).toBeTruthy()
            } else {
                expect(stream.atEnd()).toBeFalsy()
            }
        }
        expect(string).toHaveLength(index)
        expect(stream.atEnd()).toBeTruthy()
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
        expect(nested).toBe('nested')
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
        expect(nested).toBe('nested')
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
        expect(output).toBe('heeello')
    })
})

it('works with array', () => {

    const array = ['hello', ' ', 'world', '!']
    const stream = new Stream(array)

    expect(stream.current).toBeUndefined()
    expect(stream.next()).toBe('hello')
    expect(stream.next(2)).toEqual(['hello', ' '])
    expect(stream.next(1, 1)).toBe(' ')
    expect(stream.next(2, 1)).toEqual([' ', 'world'])
    expect(stream.consume()).toBe('hello')
    expect(stream.current).toBe('hello')
    expect(stream.consume(2)).toEqual([' ', 'world'])
    expect(stream.current).toBe('world')
    expect(stream.prev()).toBe(' ')
    expect(stream.prev(1, 1)).toBe('hello')
    expect(stream.prev(2, 1)).toEqual(['hello'])

    stream.reset()

    expect(stream.current).toBeUndefined()
    expect(stream.consumeUntil('!')).toEqual(['hello', ' ', 'world'])
    expect(stream.consume()).toBe('!')
    expect(stream.consume('!')).toBeNull()

    stream.moveTo(2)
    stream.data.splice(stream.index, 0, 'beautiful', ' ')
    stream.reset()
    expect(stream.consumeUntil('!')).toEqual(['hello', ' ', 'beautiful', ' ', 'world'])

    stream.reset()
    let index = 0
    for (const char of stream) {
        expect(char).toBe(['hello', ' ', 'beautiful', ' ', 'world', '!'][index++])
    }
})
