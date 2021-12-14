
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
        consume(item = stream.next(), fallback) {
            if (item && item === stream.next()) {
                return source[++index]
            }
            if (fallback === false) {
                let message
                if (index < 0) {
                    message = `"${item}" is expected at the start of "${source}"`
                } else if (index < length - 1) {
                    message = `"${item}" is expected between "${source.slice(0, index)}" and "${source.slice(index)}"`
                } else {
                    message = `"${item}" is expected at the end of "${source}"`
                }
                throw Error(message)
            }
            return fallback
        },
        consumeAny(...items) {
            while (items.some(item => stream.consume(item))) {
                continue
            }
        },
        consumeRunOf(item) {
            while (stream.consume(item)) {
                continue
            }
        },
        consumeUntil(item) {
            const startIndex = index
            let consumed = ''
            while (index < length) {
                const next = source[index + 1]
                if (next === item) {
                    return consumed
                }
                consumed = consumed.concat(source[++index])
            }
            if (item) {
                stream.moveTo(startIndex)
                throw Error(`"${item}" is not in "${source.slice(startIndex + 1)}"`)
            }
            return consumed
        },
        insert(items) {
            source = source.slice(0, index + 1).concat(items, source.slice(index + 1))
            length += items.length
        },
        moveTo(n) {
            index = Math.max(-1, Math.min(source.length, n))
        },
        next(n = 1) {
            return source[index + n]
        },
        prev(n = 1) {
            return source[index - n]
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
