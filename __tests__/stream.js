
const create = require('../lib/parse/stream.js')

const string = 'hello'
const stream = create(string)

beforeEach(() => {
    stream.reset()
})

describe('reset()', () => {
    it('pushes all items back onto the front of the stream', () => {
        stream.reset()
        expect(stream.current).toBeUndefined()
        expect(stream.next()).toBe('h')
        expect(stream.index).toBe(-1)
    })
})

describe('moveTo()', () => {
    it('sets the item at the given index as the current item', () => {
        stream.moveTo(1)
        expect(stream.current).toBe('e')
        expect(stream.index).toBe(1)
    })
})

describe('consume()', () => {
    it('throws an error when the specified item is not found at the front of the stream', () => {
        expect(() => stream.consume('_', false)).toThrow('"_" is expected at the start of "hello"')
        expect(stream.index).toBe(-1)
        stream.moveTo(1)
        expect(() => stream.consume('_', false)).toThrow('"_" is expected between "h" and "ello"')
        expect(stream.index).toBe(1)
        stream.moveTo(string.length - 1)
        expect(() => stream.consume('_', false)).toThrow('"_" is expected at the end of "hello"')
        expect(stream.index).toBe(string.length - 1)
    })
    it('consumes item at the front of the stream', () => {
        expect(stream.consume('h')).toBe('h')
        expect(stream.current).toBe('h')
        expect(stream.index).toBe(0)
    })
    it('returns the specified fallback item when the specified item is not found at the front of the stream', () => {
        expect(stream.consume('_', 'H')).toBe('H')
        expect(stream.current).toBeUndefined()
        expect(stream.index).toBe(-1)
    })
})

describe('reconsume()', () => {
    it('pushes the current item back onto the front of the stream', () => {
        stream.moveTo(string.length - 1)
        expect(stream.current).toBe('o')
        stream.reconsume()
        expect(stream.current).toBe('l')
        stream.reconsume(2)
        expect(stream.current).toBe('e')
        stream.reconsume(2)
        expect(stream.current).toBeUndefined()
    })
})

describe('consumeRunOf()', () => {
    it('consumes all consecutive occurrences of the specified item in the remaining stream items', () => {
        stream.moveTo(1)
        stream.consumeRunOf('l')
        expect(stream.current).toBe('l')
        expect(stream.index).toBe(3)
    })
})

describe('consumeAny()', () => {
    it('consumes all consecutive occurrences of the specified items in the remaining stream items', () => {
        const stream = create('csscsscss.')
        stream.consumeAny('c', 's')
        expect(stream.current).toBe('s')
        expect(stream.index).toBe(8)
    })
})

describe('consumeUntil()', () => {
    it('throws an error when the specified item is not found in the remaining stream items', () => {
        expect(() => stream.consumeUntil('_')).toThrow('"_" is not in "hello"')
        expect(stream.index).toBe(-1)
        stream.moveTo(2)
        expect(() => stream.consumeUntil('_')).toThrow('"_" is not in "lo"')
        expect(stream.index).toBe(2)
    })
    it('consumes items until the given item is found in the remaining stream items', () => {
        expect(stream.consumeUntil('o')).toBe('hell')
        expect(stream.current).toBe('l')
        expect(stream.index).toBe(3)
    })
    it('consumes all remaining stream items when no argument is given', () => {
        expect(stream.consumeUntil()).toBe('hello')
        expect(stream.current).toBe('o')
        expect(stream.index).toBe(4)
    })
})

describe('next()', () => {
    it('returns the next item at current item index + given integer', () => {
        expect(stream.next()).toBe('h')
        expect(stream.next(2)).toBe('e')
        expect(stream.index).toBe(-1)
    })
})

describe('atEnd()', () => {
    it('returns false when some items have not been consumed', () => {
        expect(stream.atEnd()).toBeFalsy()
    })
    it('returns true when all items have been consumed', () => {
        stream.consumeUntil()
        expect(stream.atEnd()).toBeTruthy()
    })
})

describe('insert()', () => {
    it('inserts the given items after the current item', () => {
        stream.insert('hey, ')
        expect(stream.source).toBe('hey, hello')
        stream.moveTo(stream.source.length - 1)
        stream.insert(' world!')
        expect(stream.source).toBe('hey, hello world!')
    })
})

describe('loops', () => {
    it('iterates over the stream items', () => {
        const string = 'hello world!'
        const stream = create(string)
        let i = 0
        expect(stream.current).toBeUndefined()
        for (const char of stream) {
            expect(char).toBeDefined()
            expect(char).toBe(string[i])
            expect(stream.current).toBe(char)
            expect(stream.index).toBe(i)
            expect(stream.next()).toBe(string[i + 1])
            if (++i === string.length) {
                expect(stream.atEnd()).toBeTruthy()
            } else {
                expect(stream.atEnd()).toBeFalsy()
            }
        }
        expect(i).toBe(string.length)
        expect(stream.atEnd()).toBeTruthy()
    })
    it('iterates over a slice of the stream items while iterating over the stream items', () => {
        const string = 'a nested word'
        const stream = create(string)
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
    it('consumes a stream item while stream is not at end', () => {
        const string = 'a nested word'
        const stream = create(string)
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
    it('reconsumes stream items while iterating over the stream items', () => {
        const stream = create(string)
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
    const stream = create(array)

    expect(stream).toHaveLength(array.length)

    expect(stream.next()).toBe('hello')
    expect(stream.current).toBeUndefined()
    expect(stream.consume()).toBe('hello')
    expect(stream.current).toBe('hello')
    expect(stream.next(2)).toBe('world')

    stream.reset()

    expect(stream.current).toBeUndefined()
    expect(stream.consumeUntil('!')).toBe('hello world')
    expect(stream.consume()).toBe('!')
    expect(stream.consume('!')).toBeUndefined()

    stream.moveTo(1)
    stream.insert(['beautiful', ' '])
    stream.reset()
    expect(stream.consumeUntil('!')).toBe('hello beautiful world')
    expect(stream).toHaveLength(6)

    stream.reset()
    let i = 0
    for (const char of stream) {
        expect(char).toBe(['hello', ' ', 'beautiful', ' ', 'world', '!'][i++])
    }
})
