
import { fetch } from 'undici'
import { isFunction } from '../utils/value.js'
import { toLowerCase } from './string.js'

// Code points of `@charset "`
const charsetStart = [0x40, 0x63, 0x68, 0x61, 0x72, 0x73, 0x65, 0x74, 0x20, 0x22]

const encodings = new Map([
    ['Big5', [
        'big5-hkscs',
        'big5',
        'cn-big5',
        'csbig5',
        'x-x-big5',
    ]],
    ['EUC-JP', [
        'cseucpkdfmtjapanese',
        'euc-jp',
        'x-euc-jp',
    ]],
    ['EUC-KR', [
        'cseuckr',
        'csksc56011987',
        'euc-kr',
        'iso-ir-149',
        'korean',
        'ks_c_5601-1987',
        'ks_c_5601-1989',
        'ksc_5601',
        'ksc5601',
        'windows-949',
    ]],
    ['GBK', [
        'chinese',
        'csgb2312',
        'csiso58gb231280',
        'gb_2312-80',
        'gb_2312',
        'gb2312',
        'gbk',
        'iso-ir-58',
        'x-gbk',
    ]],
    ['gb18030', [
        'gb18030',
    ]],
    ['IBM866', [
        '866',
        'cp866',
        'csibm866',
        'ibm866',
    ]],
    ['ISO-2022-JP', [
        'csiso2022jp',
        'iso-2022-jp',
    ]],
    ['ISO-8859-2', [
        'csisolatin2',
        'iso_8859-2:1987',
        'iso_8859-2',
        'iso-8859-2',
        'iso-ir-101',
        'iso8859-2',
        'iso88592',
        'l2',
        'latin2',
    ]],
    ['ISO-8859-3', [
        'csisolatin3',
        'iso_8859-3:1988',
        'iso_8859-3',
        'iso-8859-3',
        'iso-ir-109',
        'iso8859-3',
        'iso88593',
        'l3',
        'latin3',
    ]],
    ['ISO-8859-4', [
        'csisolatin4',
        'iso_8859-4:1988',
        'iso_8859-4',
        'iso-8859-4',
        'iso-ir-110',
        'iso8859-4',
        'iso88594',
        'l4',
        'latin4',
    ]],
    ['ISO-8859-5', [
        'csisolatincyrillic',
        'cyrillic',
        'iso_8859-5:1988',
        'iso_8859-5',
        'iso-8859-5',
        'iso-ir-144',
        'iso8859-5',
        'iso88595',
    ]],
    ['ISO-8859-6', [
        'arabic',
        'asmo-708',
        'csiso88596e',
        'csiso88596i',
        'csisolatinarabic',
        'ecma-114',
        'iso_8859-6:1987',
        'iso_8859-6',
        'iso-8859-6-e',
        'iso-8859-6-i',
        'iso-8859-6',
        'iso-ir-127',
        'iso8859-6',
        'iso88596',
    ]],
    ['ISO-8859-7', [
        'csisolatingreek',
        'ecma-118',
        'elot_928',
        'greek',
        'greek8',
        'iso_8859-7:1987',
        'iso_8859-7',
        'iso-8859-7',
        'iso-ir-126',
        'iso8859-7',
        'iso88597',
        'sun_eu_greek',
    ]],
    ['ISO-8859-10', [
        'csisolatin6',
        'iso-8859-10',
        'iso-ir-157',
        'iso8859-10',
        'iso885910',
        'l6',
        'latin6',
    ]],
    ['ISO-8859-13', [
        'iso-8859-13',
        'iso8859-13',
        'iso885913',
    ]],
    ['ISO-8859-14', [
        'iso-8859-14',
        'iso8859-14',
        'iso885914',
    ]],
    ['ISO-8859-15', [
        'csisolatin9',
        'iso_8859-15',
        'iso-8859-15',
        'iso8859-15',
        'iso885915',
        'l9',
    ]],
    ['ISO-8859-16', [
        'iso-8859-16',
    ]],
    ['ISO-8859-8', [
        'csiso88598e',
        'csisolatinhebrew',
        'hebrew',
        'iso_8859-8:1988',
        'iso_8859-8',
        'iso-8859-8-e',
        'iso-8859-8',
        'iso-ir-138',
        'iso8859-8',
        'iso88598',
        'visual',
    ]],
    ['ISO-8859-8-I', [
        'csiso88598i',
        'iso-8859-8-i',
        'logical',
    ]],
    ['KOI8-R', [
        'cskoi8r',
        'koi',
        'koi8_r',
        'koi8-r',
        'koi8',
    ]],
    ['KOI8-U', [
        'koi8-ru',
        'koi8-u',
    ]],
    ['macintosh', [
        'csmacintosh',
        'mac',
        'macintosh',
        'x-mac-roman',
    ]],
    ['Shift_JIS', [
        'csshiftjis',
        'ms_kanji',
        'ms932',
        'shift_jis',
        'shift-jis',
        'sjis',
        'windows-31j',
        'x-sjis',
    ]],
    ['replacement', [
        'csiso2022kr',
        'hz-gb-2312',
        'iso-2022-cn-ext',
        'iso-2022-cn',
        'iso-2022-kr',
        'replacement',
    ]],
    ['UTF-8', [
        'unicode-1-1-utf-8',
        'unicode11utf8',
        'unicode20utf8',
        'utf-8',
        'utf8',
        'x-unicode20utf8',
    ]],
    ['UTF-16BE', [
        'unicodefffe',
        'utf-16be',
    ]],
    ['UTF-16LE', [
        'csunicode',
        'iso-10646-ucs-2',
        'ucs-2',
        'unicode',
        'unicodefeff',
        'utf-16',
        'utf-16le',
    ]],
    ['windows-874', [
        'dos-874',
        'iso-8859-11',
        'iso8859-11',
        'iso885911',
        'tis-620',
        'windows-874',
    ]],
    ['windows-1250', [
        'cp1250',
        'windows-1250',
        'x-cp1250',
    ]],
    ['windows-1251', [
        'cp1251',
        'windows-1251',
        'x-cp1251',
    ]],
    ['windows-1252', [
        'ansi_x3.4-1968',
        'ascii',
        'cp1252',
        'cp819',
        'csisolatin1',
        'ibm819',
        'iso_8859-1:1987',
        'iso_8859-1',
        'iso-8859-1',
        'iso-ir-100',
        'iso8859-1',
        'iso88591',
        'l1',
        'latin1',
        'us-ascii',
        'windows-1252',
        'x-cp1252',
    ]],
    ['windows-1253', [
        'cp1253',
        'windows-1253',
        'x-cp1253',
    ]],
    ['windows-1254', [
        'cp1254',
        'csisolatin5',
        'iso_8859-9:1989',
        'iso_8859-9',
        'iso-8859-9',
        'iso-ir-148',
        'iso8859-9',
        'iso88599',
        'l5',
        'latin5',
        'windows-1254',
        'x-cp1254',
    ]],
    ['windows-1255', [
        'cp1255',
        'windows-1255',
        'x-cp1255',
    ]],
    ['windows-1256', [
        'cp1256',
        'windows-1256',
        'x-cp1256',
    ]],
    ['windows-1257', [
        'cp1257',
        'windows-1257',
        'x-cp1257',
    ]],
    ['windows-1258', [
        'cp1258',
        'windows-1258',
        'x-cp1258',
    ]],
    ['x-mac-cyrillic', [
        'x-mac-cyrillic',
        'x-mac-ukrainian',
    ]],
    ['x-user-defined', [
        'x-user-defined',
    ]],
])

/**
 * @param {string} encoding
 * @returns {string|null}
 * @see {@link https://encoding.spec.whatwg.org/#concept-encoding-get}
 */
function getEncoding(encoding) {
    encoding = toLowerCase(encoding)
    for (const [name, labels] of encodings) {
        if (labels.includes(encoding)) {
            return name
        }
    }
    return null
}

/**
 * @param {string} contentType
 * @returns {string|null}
 */
export function getHTTPEncoding(contentType) {
    const encoding = contentType
        .split(';')
        .slice(1)
        .map(parameter => parameter.trim().split('='))
        .find(parameter => parameter[0] === 'charset')?.[1]
    return encoding ? getEncoding(encoding) : null
}

/**
 * @param {Buffer} bytes
 * @returns {string|null}
 */
function getCSSEncoding(bytes) {

    bytes = bytes.subarray(0, 1024)

    // Check bytes start with a sequence representing @charset "
    let i = 0
    let byte
    while (i < charsetStart.length) {
        byte = bytes[i]
        if (byte !== charsetStart[i++]) {
            return null
        }
    }

    // Find encoding from ASCII characters preceding ";
    const value = []
    while (i < 1024 && (byte = bytes[i++]) !== undefined) {
        if (byte === 0x22) {
            if (bytes[i] === 0x3B) {
                const encoding = getEncoding(Buffer.from(value).toString('ascii'))
                if (encoding === 'UTF-16BE' || encoding === 'UTF-16LE') {
                    return 'UTF-8'
                }
                if (encoding) {
                    return encoding
                }
            }
            return null
        }
        // Byte representing non ASCII character
        if (0x7F < byte) {
            return null
        }
        value.push(byte)
    }
    return null
}

/**
 * @param {Buffer} bytes
 * @returns {string|null}
 */
function getBOMEncoding(bytes) {
    const [first, second, third] = bytes.subarray(0, 3)
    if (first === 0xEF && second === 0xBB && third === 0xBF) {
        return 'UTF-8'
    }
    if (first === 0xFE && second === 0xFF) {
        return 'UTF-16BE'
    }
    if (first === 0xFF && second === 0xFE) {
        return 'UTF-16LE'
    }
    return null
}

/**
 * @param {ReadableStream} stream
 * @param {string|null} httpEncoding
 * @param {string} environmentEncoding
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-decode-bytes}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#determine-the-fallback-encoding}
 */
export async function decode(stream, httpEncoding, environmentEncoding) {

    const chunkIterator = stream[Symbol.asyncIterator]()
    const chunks = []

    // Resolve encoding
    let size = 0
    while (size < 1024) {
        const { value, done } = await chunkIterator.next()
        if (done) {
            break
        }
        chunks.push(value)
        size += value.length
    }
    const buffer = Buffer.concat(chunks)
    const encoding = getBOMEncoding(buffer)
        ?? httpEncoding
        ?? getCSSEncoding(buffer)
        ?? environmentEncoding
        ?? 'UTF-8'
    const decoder = new TextDecoder(encoding)

    // Decode
    let rules = ''
    for (const chunk of chunks) {
        rules += decoder.decode(chunk, { stream: true })
    }
    for await (const chunk of chunkIterator) {
        rules += decoder.decode(chunk, { stream: true })
    }
    rules += decoder.decode()
    return { encoding, rules }
}

/**
 * @param {Map} options
 * @param {object[]} modifiers
 * @see {@link https://drafts.csswg.org/css-values-5/#apply-request-modifiers-from-url-value}
 */
function applyURLRequestModifiers(options, modifiers = []) {
    for (const { value, types } of modifiers) {
        if (types.includes('<cross-origin-modifier>')) {
            options.set('mode', 'cors')
            options.set('credentials', value.value === 'use-credentials' ? 'include' : 'same-origin')
        } else if (types.includes('<integrity-modifier>')) {
            options.set('integrity', value.value)
        } else if (types.includes('<referrer-policy-modifier>')) {
            options.set('referrerPolicy', value.value)
        }
    }
}

/**
 * @param {CSSRuleImpl|CSSStyleDeclarationImpl} context
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-values-4/#style-resource-base-url}
 */
function computeResourceBaseURL(context) {
    if (context?.parentRule) {
        context = context.parentRule
    }
    const sheet = context?.parentStyleSheet
    return sheet._baseURL ?? sheet._location ?? context._globalObject.document.baseURI
}

/**
 * @param {string} url
 * @param {CSSRuleImpl|CSSStyleDeclarationImpl} context
 * @returns {URL|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#resolve-a-style-resource-url}
 */
export function resolveResourceURL(url, context) {
    return URL.parse(url, computeResourceBaseURL(context))
}

/**
 * @param {object|string} url
 * @param {string} destination
 * @param {CSSRuleImpl|CSSStyleDeclarationImpl} context
 * @param {AbortSignal}
 * @returns {Promise}
 * @see {@link https://drafts.csswg.org/css-values-4/#fetch-a-style-resource}
 */
export async function fetchResource(url, destination, context, signal) {

    let modifiers
    if (typeof url === 'string') {
        url = resolveResourceURL(url, context)
    } else if (isFunction(url)) {
        [url, modifiers] = url.value
        url = resolveResourceURL(url.value, context)
    } else {
        url = resolveResourceURL(url.value, context)
    }
    if (url === null) {
        throw SyntaxError('Invalid URL')
    }

    const options = new Map([
        ['credentials', 'include'],
        ['mode', 'no-cors'],
        ['signal', signal],
    ])
    if (destination === 'image') {
        options.set('headers', { Accept: 'image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5' })
    } else if (destination === 'style') {
        options.set('headers', { Accept: 'text/css,*/*;q=0.1' })
    }
    applyURLRequestModifiers(options, modifiers)

    const response = await fetch(`${url}`, Object.fromEntries(options))

    if (!response.ok || !response.body) {
        throw Error('Invalid response')
    }

    const mode = options.get('mode')
    const clientOrigin = resolveResourceURL('', context).origin
    const responseOrigin = URL.parse(response.url)?.origin

    if (clientOrigin === responseOrigin) {
        return response
    }
    if (mode === 'same-origin') {
        throw TypeError('Network error')
    }
    if (mode === 'cors') {

        const { headers } = response
        const allowOrigin = headers.get('access-control-allow-origin')

        if (allowOrigin !== '*' && allowOrigin !== clientOrigin) {
            throw TypeError('Network error')
        }
        if (
            options.get('credentials') === 'include'
            && (
                !headers.get('access-control-allow-credentials')
                || allowOrigin === '*'
                || headers.get('access-control-allow-headers') === '*'
                || headers.get('access-control-allow-methods') === '*'
                || headers.get('access-control-expose-headers') === '*'
            )
        ) {
            throw TypeError('Network error')
        }
    }
    return response
}
