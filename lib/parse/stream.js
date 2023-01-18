
class Stream {

    index = -1

    /**
     * @param {object[]|string} source
     */
    constructor(source) {
        this.source = source
    }

    /**
     * @returns {object|string|undefined}
     */
    get current() {
        return this.source[this.index]
    }

    /**
     * @returns {*[]|string}
     */
    get empty() {
        return Array.isArray(this.source) ? [] : ''
    }

    /**
     * @yields {object|string}
     */
    * [Symbol.iterator]() {
        while ((this.index + 1) < this.source.length) {
            yield this.source[++this.index]
        }
    }

    /**
     * @param {function|string} [ignore]
     * @returns {boolean}
     */
    atEnd(ignore) {
        const { index, source } = this
        let next = index + 1
        if (typeof ignore === 'function') {
            for (; ignore(source[next]); ++next);
        } else if (typeof ignore === 'string') {
            for (; source[next] === ignore; ++next);
        }
        return source.length <= next
    }

    /**
     * @param {number|object|string} [item]
     * @param  {...any} args
     * @returns {object|string|null}
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
        const { source } = this
        const [fallback = null] = args
        if (typeof item === 'number') {
            if (1 < item) {
                let { empty: consumed } = this
                while (item-- && !this.atEnd()) {
                    consumed = consumed.concat(source[++this.index])
                }
                return consumed
            }
            if (!this.atEnd()) {
                return source[++this.index]
            }
        } else if (item === this.next()) {
            return source[++this.index]
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
     * @param  {...number|object|string} items
     * @returns {object[]|string}
     */
    consumeRunOf(...items) {
        let { empty: consumed } = this
        let last
        while (items.some(item => last = this.consume(item))) {
            consumed = consumed.concat(last)
        }
        return consumed
    }

    /**
     * @param {object|string} item
     * @returns {object[]|string}
     */
    consumeUntil(item) {
        const { index: start, source } = this
        let { empty: consumed } = this
        while (this.index < source.length) {
            const next = source[this.index + 1]
            if (next === item) {
                return consumed
            }
            consumed = consumed.concat(source[++this.index])
        }
        if (item) {
            this.moveTo(start)
            throw Error(`"${typeof item === 'string' ? item : '(object)'}" was expected`)
        }
        return consumed
    }

    /**
     * @param {number} n
     */
    moveTo(n) {
        this.index = n
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
                return this.source[this.index + offset + size]
            default:
                return this.source.slice(
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
                return this.source[this.index - offset - size]
            default:
                return this.source.slice(
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
