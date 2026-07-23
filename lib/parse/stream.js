
/**
 * @param {Stream} stream
 * @param {object|string} value
 * @returns {string|object[]}
 */
function concat({ data, empty }, value) {
    data = data.concat(value)
    if (typeof empty === 'string') {
        return data.join('')
    }
    return data
}

/**
 * @param {Stream} stream
 * @param {number} from
 * @param {number} to
 * @returns {string|object[]}
 */
function slice({ data, empty }, from, to) {
    data = data.slice(from, to)
    if (typeof empty === 'string') {
        return data.join('')
    }
    return data
}

export default class Stream {

    data = []
    index = -1

    /**
     * @param {Iterator|string|object[]} data
     * @param {string} [source]
     */
    constructor(data, source) {
        if (Array.isArray(data)) {
            this.iterator = data[Symbol.iterator]()
            this.empty = []
        } else if (typeof data === 'string') {
            this.iterator = data[Symbol.iterator]()
            this.empty = ''
        } else {
            const { empty, iterator } = data
            this.iterator = iterator
            this.empty = empty
        }
        if (source) {
            this.source = source
        }
    }

    /**
     * @yields {object|string}
     */
    * [Symbol.iterator]() {
        while (!this.atEnd()) {
            yield this.consume()
        }
    }

    /**
     * @returns {object|string|undefined}
     */
    get current() {
        return this.data[this.index]
    }

    /**
     * @param {number} [offset]
     * @returns {boolean}
     */
    atEnd(offset = 0) {
        this.fill(1 + offset)
        return this.data.length <= (this.index + 1 + offset)
    }

    /**
     * @param {number} n
     */
    backtrack(n) {
        if (this.index < n) {
            throw RangeError('Unexpected backtrack index greater than current stream index')
        }
        this.index = n
    }

    /**
     * @param {*} [n]
     * @param  {...*} args
     * @returns {*}
     */
    consume(n = 1, ...args) {
        let { data, empty, index } = this
        if (typeof n === 'function') {
            const item = this.consume()
            const consumed = item && n(item, ...args)
            if (consumed instanceof Error) {
                this.index = index
                return consumed
            }
            if (consumed) {
                return consumed === true ? item : consumed
            }
            this.index = index
            return null
        }
        const fallback = args[0] ?? null
        if (typeof n === 'number') {
            if (n < 0) {
                throw RangeError('Unexpected negative number of values to consume')
            }
            if (n === 0) {
                return
            }
            if (1 < n) {
                this.fill(n)
                while (n-- && !this.atEnd()) {
                    empty = empty.concat(data[++this.index])
                }
                return empty
            }
            if (!this.atEnd()) {
                return data[++this.index]
            }
        } else if (n === this.next()) {
            return data[++this.index]
        }
        if (fallback === Error) {
            throw Error(`"${typeof n === 'string' ? n : '(object)'}" was expected`)
        }
        if (fallback instanceof Error) {
            throw fallback
        }
        return fallback
    }

    /**
     * @param  {...*} items
     * @returns {string|object[]}
     */
    consumeRunOf(...items) {
        let { empty } = this
        let last
        while (items.some(item => last = this.consume(item))) {
            empty = empty.concat(last)
        }
        return empty
    }

    /**
     * @param {object|string} item
     * @returns {string|object[]}
     */
    consumeUntil(item) {
        let { data, empty, index: start } = this
        while (!this.atEnd()) {
            if (this.next() === item) {
                return empty
            }
            empty = empty.concat(data[++this.index])
        }
        this.backtrack(start)
        throw Error(`"${typeof item === 'string' ? item : '(object)'}" was expected`)
    }

    /**
     * @param {number} size
     */
    fill(size) {
        const { data, index, iterator } = this
        while (data.length <= (index + size)) {
            const { done, value } = iterator.next()
            if (done) {
                break
            }
            data.push(value)
        }
    }

    /**
     * @param {number} [size]
     * @param {number} [offset]
     * @returns {object|string|undefined}
     */
    next(size = 1, offset = 0) {
        this.fill(size + offset)
        if (size < 0) {
            return this.prev(Math.abs(size), offset)
        }
        switch (size) {
            case 0:
                return this.empty
            case 1:
                return this.data[this.index + offset + size]
            default:
                return slice(
                    this,
                    Math.max(this.index + offset + 1, 0),
                    Math.max(this.index + offset + 1 + size, 0))
        }
    }

    /**
     * @param {function} callback
     * @returns {boolean}
     */
    peek(callback) {
        if (this.atEnd()) {
            return false
        }
        return callback(this.next())
    }

    /**
     * @param {number} [size]
     * @param {number} [offset]
     * @returns {object|string|undefined}
     */
    prev(size = 1, offset = 0) {
        if (size < 0) {
            return this.next(Math.abs(size), offset)
        }
        switch (size) {
            case 0:
                return this.empty
            case 1:
                return this.data[this.index - offset - size]
            default:
                return slice(
                    this,
                    Math.max(this.index - offset - size, 0),
                    Math.max(this.index - offset, 0))
        }
    }

    /**
     * @param {number} [n]
     */
    reconsume(n = 1) {
        this.index -= n
    }
}
