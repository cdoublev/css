
/**
 * @param {string|*[]} source
 * @returns {object}
 */
function create(source) {
    // TODO: implement an appropriate data structure for component values
    if (typeof source !== 'string' && !Array.isArray(source)) {
        source = [source]
    }
    let { length } = source
    let index = -1
    const stream = {
        /* eslint-disable sort-keys */
        get current() {
            return source[index]
        },
        get index() {
            return index
        },
        get length() {
            return length
        },
        get source() {
            return source
        },
        * [Symbol.iterator]() {
            while (++index < length) {
                yield source[index]
            }
        },
        atEnd() {
            return stream.next() === undefined
        },
        consume(item = 1, fallback) {
            if (typeof item === 'number') {
                if (1 < item) {
                    let consumed = stream.empty()
                    while (0 < item-- && !stream.atEnd()) {
                        consumed = consumed.concat(source[++index])
                    }
                    return consumed
                }
                if (!stream.atEnd()) {
                    return source[++index]
                }
            }
            if (item === stream.next()) {
                return source[++index]
            }
            if (fallback === false) {
                throw Error(`"${typeof item === 'string' ? item : '(object)'}" was expected`)
            }
            return fallback
        },
        consumeRunOf(...items) {
            while (items.some(item => stream.consume(item))) {
                continue
            }
        },
        consumeUntil(item) {
            const startIndex = index
            let consumed = stream.empty()
            while (index < length) {
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
        empty() {
            return Array.isArray(source) ? [] : ''
        },
        insert(items) {
            source = source.slice(0, index + 1).concat(items, source.slice(index + 1))
            length += items.length
        },
        moveTo(n) {
            index = Math.max(-1, Math.min(source.length, n))
        },
        next(end = 1, size = end) {
            if (size === 1) {
                return source[index + 1]
            }
            end += index + 1
            return source.slice(Math.max(end - size, 0), end)
        },
        prev(start = 1, size = start) {
            if (size === 1) {
                return source[index - start]
            }
            start = index - start
            return source.slice(start, start + size)
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
