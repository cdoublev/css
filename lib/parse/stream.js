
/**
 * @param {string|*[]} source
 * @returns {object}
 */
function create(source) {
    const empty = Array.isArray(source) ? [] : ''
    let index = -1
    const stream = {
        /* eslint-disable sort-keys */
        get current() {
            return source[index]
        },
        get index() {
            return index
        },
        get source() {
            return source
        },
        * [Symbol.iterator]() {
            while ((index + 1) < source.length) {
                yield source[++index]
            }
        },
        atEnd(ignore) {
            let next = index + 1
            if (typeof ignore === 'function') {
                for (; ignore(source[next]); ++next);
            } else if (typeof ignore === 'string') {
                for (; source[next] === ignore; ++next);
            }
            return source.length <= next
        },
        consume(item = 1, ...args) {
            if (typeof item === 'function') {
                const next = stream.next()
                const consumed = next && item(next, ...args)
                if (consumed) {
                    ++index
                    return consumed === true ? next : consumed
                }
                return consumed
            }
            const [fallback = null] = args
            if (typeof item === 'number') {
                if (1 < item) {
                    let consumed = empty
                    while (item-- && !stream.atEnd()) {
                        consumed = consumed.concat(source[++index])
                    }
                    return consumed
                }
                if (!stream.atEnd()) {
                    return source[++index]
                }
            } else if (item === stream.next()) {
                return source[++index]
            }
            if (fallback === Error) {
                throw Error(`"${typeof item === 'string' ? item : '(object)'}" was expected`)
            }
            if (fallback instanceof Error) {
                throw fallback
            }
            return fallback
        },
        consumeRunOf(...items) {
            let consumed = empty
            let last
            while (items.some(item => last = stream.consume(item))) {
                consumed = consumed.concat(last)
                continue
            }
            return consumed
        },
        consumeUntil(item) {
            const startIndex = index
            let consumed = empty
            while (index < source.length) {
                const next = source[index + 1]
                if (next === item) {
                    return consumed
                }
                consumed = consumed.concat(source[++index])
            }
            if (item) {
                stream.moveTo(startIndex)
                throw Error(`"${typeof item === 'string' ? item : '(object)'}" was expected`)
            }
            return consumed
        },
        moveTo(n) {
            index = n
        },
        next(size = 1, offset = 0) {
            if (size < 0) {
                return stream.prev(Math.abs(size), offset)
            }
            switch (size) {
                case 0:
                    return empty
                case 1:
                    return source[index + offset + size]
                default:
                    return source.slice(Math.max(index + offset + 1, 0), Math.max(index + offset + 1 + size, 0))
            }
        },
        prev(size = 1, offset = 0) {
            if (size < 0) {
                return stream.next(Math.abs(size), offset)
            }
            switch (size) {
                case 0:
                    return empty
                case 1:
                    return source[index - offset - size]
                default:
                    return source.slice(Math.max(index - offset - size, 0), Math.max(index - offset, 0))
            }
        },
        reconsume(n = 1) {
            index -= n
        },
        reset() {
            index = -1
        },
        /* eslint-enable sort-keys */
    }
    return stream
}

module.exports = create
