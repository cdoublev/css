
class Stream {

    index = -1
    markers = []

    /**
     * @param {string|object[]} data
     * @param {string} [source]
     */
    constructor(data, source) {
        this.data = data
        if (source) {
            this.source = source
        }
    }

    /**
     * @returns {object|string|undefined}
     */
    get current() {
        return this.data[this.index]
    }

    /**
     * @returns {string|object[]}
     */
    get empty() {
        return Array.isArray(this.data) ? [] : ''
    }

    /**
     * @yields {object|string}
     */
    * [Symbol.iterator]() {
        while ((this.index + 1) < this.data.length) {
            yield this.data[++this.index]
        }
    }

    /**
     * @param {number} [offset]
     * @returns {boolean}
     */
    atEnd(offset = 0) {
        return this.data.length <= (this.index + 1 + offset)
    }

    /**
     * @param {number|object|string} [item]
     * @param  {...*} args
     * @returns {*}
     */
    consume(item = 1, ...args) {
        if (typeof item === 'function') {
            const next = this.next()
            const consumed = next && item(next, ...args)
            if (consumed) {
                ++this.index
                return consumed === true ? next : consumed
            }
            return null
        }
        const { data } = this
        const fallback = args[0] ?? null
        if (typeof item === 'number') {
            if (1 < item) {
                let consumed = this.empty
                while (item-- && !this.atEnd()) {
                    consumed = consumed.concat(data[++this.index])
                }
                return consumed
            }
            if (!this.atEnd()) {
                return data[++this.index]
            }
        } else if (item === this.next()) {
            return data[++this.index]
        }
        if (fallback === Error) {
            throw Error(`"${typeof item === 'string' ? item : '(object)'}" was expected`)
        }
        if (fallback instanceof Error) {
            throw fallback
        }
        return fallback
    }

    /**
     * @param  {...object|...string} items
     * @returns {string|object[]}
     */
    consumeRunOf(...items) {
        let consumed = this.empty
        let last
        while (items.some(item => last = this.consume(item))) {
            consumed = consumed.concat(last)
        }
        return consumed
    }

    /**
     * @param {object|string} item
     * @returns {string|object[]}
     */
    consumeUntil(item) {
        const { data, empty, index: start } = this
        let consumed = empty
        while (this.index < data.length) {
            const next = data[this.index + 1]
            if (next === item) {
                return consumed
            }
            consumed = consumed.concat(data[++this.index])
        }
        this.moveTo(start)
        throw Error(`"${typeof item === 'string' ? item : '(object)'}" was expected`)
    }

    /**
     * @param {number} n
     */
    moveTo(n) {
        this.index = n
    }

    moveToEnd() {
        this.index = this.data.length - 1
    }

    /**
     * @param {number} [size]
     * @param {number} [offset]
     * @returns {object|string|undefined}
     */
    next(size = 1, offset = 0) {
        if (size < 0) {
            return this.prev(Math.abs(size), offset)
        }
        switch (size) {
            case 0:
                return this.empty
            case 1:
                return this.data[this.index + offset + size]
            default:
                return this.data.slice(
                    Math.max(this.index + offset + 1, 0),
                    Math.max(this.index + offset + 1 + size, 0))
        }
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
                return this.data.slice(
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

    reset() {
        this.index = -1
    }
}

module.exports = Stream
