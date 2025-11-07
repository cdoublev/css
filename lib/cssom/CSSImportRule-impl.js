
import * as environment from '../utils/environment.js'
import { decode, fetchResource, getHTTPEncoding, resolveResourceURL } from '../utils/resource.js'
import { isFunction, isOmitted } from '../utils/value.js'
import { serializeComponentValue, serializeURL } from '../serialize.js'
import CSSRuleImpl from './CSSRule-impl.js'
import CSSStyleSheet from './CSSStyleSheet.js'
import MediaList from './MediaList.js'
import matchMediaQueryList from '../match/media.js'
import matchSupport from '../match/support.js'

/**
 * @param {Response} response
 * @param {CSSImportRuleImpl} rule
 * @returns {Promise}
 */
async function processResponse({ body, headers, url }, rule) {

    const contentType = headers.get('content-type')
    const { media, parentStyleSheet } = rule
    const { _encoding, _globalObject, _originClean } = parentStyleSheet
    const quirksMode = _globalObject.document.compatMode === 'BackCompat'
    const clientOrigin = resolveResourceURL('', rule).origin
    const responseOrigin = URL.parse(url)?.origin
    const sameOrigin = clientOrigin === responseOrigin

    if (!(quirksMode && sameOrigin) && !contentType?.startsWith('text/css')) {
        throw Error('Network error: invalid content type')
    }

    const { encoding, rules } = await decode(body, getHTTPEncoding(contentType), _encoding)
    const properties = {
        encoding,
        location: `${resolveResourceURL(rule.href, rule)}`,
        media,
        originClean: sameOrigin && _originClean,
        ownerRule: rule,
        parentStyleSheet,
        rules,
    }
    return CSSStyleSheet.createImpl(globalThis, undefined, properties)
}

/**
 * @param {CSSImportRuleImpl} rule
 * @returns {boolean}
 */
function isMatchingSupport(rule) {
    return rule._supports && matchMediaQueryList(rule.media._list, globalThis)
}

/**
 * @param {CSSImportRuleImpl} rule
 * @returns {boolean}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/4287}
 */
function isCircularImport(rule) {
    const url = `${resolveResourceURL(rule.href, rule)}`
    let ancestor = rule
    while (ancestor = ancestor.parentStyleSheet) {
        if (url === ancestor.href) {
            return true
        }
    }
    return false
}

/**
 * @param {CSSImportRuleImpl} rule
 * @param {Abortsignal}
 * @returns {Promise}
 * @see {@link https://drafts.csswg.org/css-cascade-4/#fetch-an-import}
 */
function fetchImport(rule, signal) {
    if (isCircularImport(rule)) {
        return Promise.reject(Error('Circular import'))
    }
    if (!isMatchingSupport(rule)) {
        return Promise.reject(Error('Mismatching import conditions'))
    }
    return fetchResource(rule._url, 'style', rule, signal).then(response => processResponse(response, rule))
}

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssimportrule}
 */
export default class CSSImportRuleImpl extends CSSRuleImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssimportrule-stylesheet}
     */
    styleSheet = null

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude: [url, layer, conditions] } = privateData
        const [supports, media] = conditions
        this._url = url
        if (isFunction(url)) {
            this.href = url.value[0].value
        } else {
            this.href = url.value
        }
        if (isFunction(layer)) {
            this.layerName = serializeComponentValue(layer.value)
        } else if (isOmitted(layer)) {
            this.layerName = null
        } else {
            this.layerName = ''
        }
        this.media = MediaList.createImpl(globalObject, undefined, isOmitted(media) ? undefined : { list: media })
        if (isOmitted(supports)) {
            this.supportsText = null
            this._supports = true
        } else {
            let { value } = supports
            this.supportsText = serializeComponentValue(value)
            // Interpret <declaration> as if it was wrapped in parens
            if (value.types.at(-1) === '<declaration>') {
                value = { types: ['<block>', '<supports-decl>', '<supports-feature>'], value }
            }
            this._supports = matchSupport(value, globalObject)
        }
        this._fetch()
    }

    // TODO: abort in the parser after discarding this rule
    _abort() {
        this._controller?.abort()
        this._promise = null
        this.styleSheet = null
    }

    // TODO: fetch in a listener of a change event emitted by MediaQuerList representing this.media
    // https://drafts.csswg.org/cssom-view/#dom-mediaquerylist-addlistener
    _fetch() {
        this._controller = new AbortController
        this._promise = fetchImport(this, this._controller.signal)
            .then(styleSheet => this.styleSheet = styleSheet)
            .catch(error => environment.test && console.log(error.message))
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { href, layerName, media: { mediaText }, supportsText } = this
        const url = serializeURL({ value: href })
        let string = `@import ${url}`
        if (layerName) {
            string += ` layer(${layerName})`
        } else if (layerName === '') {
            string += ' layer'
        }
        if (supportsText) {
            string += ` supports(${supportsText})`
        }
        if (mediaText && mediaText !== 'all') {
            string += ` ${mediaText}`
        }
        return `${string};`
    }
}
