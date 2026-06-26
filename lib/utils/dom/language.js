
import { HTML_NAMESPACE, SVG_NAMESPACE, XML_NAMESPACE } from './constants.js'
import { isDigit, toLowerCase } from '../string.js'
import { isError, isFailure } from '../value.js'
import Stream from '../../parse/stream.js'
import { create as error } from '../../error.js'
import { getParent } from './element.js'
import { matchTreesAgainstSelectors } from '../../match/selector.js'
import { parseGrammar } from '../../parse/parser.js'

const MAX_SUBTAG_LENGTH = 8

// Data extracted from IANA registry published on 2026-05-05

// Grandfathered tags mapped to their preferred value if any, otherwise to themselves
const grandfathered = {
    'art-lojban': 'jbo',
    'cel-gaulish': 'cel-gaulish',
    'en-gb-oed': 'en-gb-oxendict',
    'i-ami': 'ami',
    'i-bnn': 'bnn',
    'i-default': 'i-default',
    'i-enochian': 'i-enochian',
    'i-hak': 'hak',
    'i-klingon': 'tlh',
    'i-lux': 'lb',
    'i-mingo': 'i-mingo',
    'i-navajo': 'nv',
    'i-pwn': 'pwn',
    'i-tao': 'tao',
    'i-tay': 'tay',
    'i-tsu': 'tsu',
    'no-bok': 'nb',
    'no-nyn': 'nn',
    'sgn-be-fr': 'sfb',
    'sgn-be-nl': 'vgt',
    'sgn-ch-de': 'sgg',
    'zh-guoyu': 'cmn',
    'zh-hakka': 'hak',
    'zh-min': 'zh-min',
    'zh-min-nan': 'nan',
    'zh-xiang': 'hsn',
}

// Redundant tags mapped to their preferred value
const redundant = {
    'sgn-br': 'bzs',
    'sgn-co': 'csn',
    'sgn-de': 'gsg',
    'sgn-dk': 'dsl',
    'sgn-es': 'ssp',
    'sgn-fr': 'fsl',
    'sgn-gb': 'bfi',
    'sgn-gr': 'gss',
    'sgn-ie': 'isg',
    'sgn-it': 'ise',
    'sgn-jp': 'jsl',
    'sgn-mx': 'mfs',
    'sgn-ni': 'ncs',
    'sgn-nl': 'dse',
    'sgn-no': 'nsl',
    'sgn-pt': 'psr',
    'sgn-se': 'swl',
    'sgn-us': 'ase',
    'sgn-za': 'sfs',
    'zh-cmn': 'cmn',
    'zh-cmn-hans': 'cmn-hans',
    'zh-cmn-hant': 'cmn-hant',
    'zh-gan': 'gan',
    'zh-wuu': 'wuu',
    'zh-yue': 'yue',
}

// Primary language subtags mapped to a preferred value
const languages = {
    aam: 'aas',
    adp: 'dz',
    ajp: 'apc',
    ajt: 'aeb',
    asd: 'snz',
    aue: 'ktz',
    ayx: 'nun',
    bgm: 'bcg',
    bic: 'bir',
    bjd: 'drl',
    blg: 'iba',
    ccq: 'rki',
    cjr: 'mom',
    cka: 'cmr',
    cmk: 'xch',
    coy: 'pij',
    cqu: 'quh',
    dek: 'sqm',
    dit: 'dif',
    drh: 'khk',
    drr: 'kzk',
    drw: 'prs',
    gav: 'dev',
    gfx: 'vaj',
    ggn: 'gvr',
    gli: 'kzk',
    gti: 'nyc',
    guv: 'duz',
    hrr: 'jal',
    ibi: 'opa',
    ilw: 'gal',
    in: 'id',
    iw: 'he',
    jeg: 'oyb',
    ji: 'yi',
    jw: 'jv',
    kgc: 'tdf',
    kgh: 'kml',
    kgm: 'plu',
    koj: 'kwv',
    krm: 'bmf',
    ktr: 'dtp',
    kvs: 'gdj',
    kwq: 'yam',
    kxe: 'tvd',
    kxl: 'kru',
    kzj: 'dtp',
    kzt: 'dtp',
    lak: 'ksp',
    lii: 'raq',
    llo: 'ngt',
    lmm: 'rmx',
    meg: 'cir',
    mo: 'ro',
    mst: 'mry',
    mwj: 'vaj',
    myd: 'aog',
    myt: 'mry',
    nad: 'xny',
    ncp: 'kdz',
    nns: 'nbr',
    nnx: 'ngv',
    nom: 'cbr',
    nte: 'eko',
    nts: 'pij',
    nxu: 'bpp',
    oun: 'vaj',
    pat: 'kxr',
    pcr: 'adx',
    pmc: 'huw',
    pmk: 'crr',
    pmu: 'phr',
    ppa: 'bfy',
    ppr: 'lcq',
    prp: 'gu',
    pry: 'prt',
    puz: 'pub',
    sca: 'hle',
    skk: 'oyb',
    smd: 'kmb',
    snb: 'iba',
    szd: 'umi',
    tdu: 'dtp',
    thc: 'tpo',
    thw: 'ola',
    thx: 'oyb',
    tie: 'ras',
    tkk: 'twm',
    tlw: 'weo',
    tmk: 'tdg',
    tmp: 'tyj',
    tne: 'kak',
    tnf: 'prs',
    tpw: 'tpn',
    tsf: 'taj',
    uok: 'ema',
    xba: 'cax',
    xia: 'acn',
    xkh: 'waw',
    xrq: 'dmw',
    xss: 'zko',
    ybd: 'rki',
    yma: 'lrr',
    ymt: 'mtm',
    yol: 'enm',
    yos: 'zom',
    yuu: 'yug',
    zir: 'scv',
    zkb: 'kjh',
}

// Region subtags mapped to a preferred value
const regions = {
    bu: 'mm',
    dd: 'de',
    fx: 'fr',
    tp: 'tl',
    yd: 'ye',
    zr: 'cd',
}

// Variant subtags mapped to a preferred value
const variants = {
    heploc: 'alalc97',
}

// Extended subtags mapped to their prefix
const extlangs = {
    aao: 'ar',
    abh: 'ar',
    abv: 'ar',
    acm: 'ar',
    acq: 'ar',
    acw: 'ar',
    acx: 'ar',
    acy: 'ar',
    adf: 'ar',
    ads: 'sgn',
    aeb: 'ar',
    aec: 'ar',
    aed: 'sgn',
    aen: 'sgn',
    afb: 'ar',
    afg: 'sgn',
    ajp: 'ar',
    ajs: 'sgn',
    apc: 'ar',
    apd: 'ar',
    arb: 'ar',
    arq: 'ar',
    ars: 'ar',
    ary: 'ar',
    arz: 'ar',
    ase: 'sgn',
    asf: 'sgn',
    asp: 'sgn',
    asq: 'sgn',
    asw: 'sgn',
    auz: 'ar',
    avl: 'ar',
    ayh: 'ar',
    ayl: 'ar',
    ayn: 'ar',
    ayp: 'ar',
    bbz: 'ar',
    bfi: 'sgn',
    bfk: 'sgn',
    bjn: 'ms',
    bog: 'sgn',
    bqn: 'sgn',
    bqy: 'sgn',
    btj: 'ms',
    bve: 'ms',
    bvl: 'sgn',
    bvu: 'ms',
    bzs: 'sgn',
    cdo: 'zh',
    cds: 'sgn',
    cjy: 'zh',
    cmn: 'zh',
    cnp: 'zh',
    coa: 'ms',
    cpx: 'zh',
    csc: 'sgn',
    csd: 'sgn',
    cse: 'sgn',
    csf: 'sgn',
    csg: 'sgn',
    csl: 'sgn',
    csn: 'sgn',
    csp: 'zh',
    csq: 'sgn',
    csr: 'sgn',
    csx: 'sgn',
    czh: 'zh',
    czo: 'zh',
    doq: 'sgn',
    dse: 'sgn',
    dsl: 'sgn',
    dsz: 'sgn',
    dup: 'ms',
    dyl: 'sgn',
    ecs: 'sgn',
    ehs: 'sgn',
    esl: 'sgn',
    esn: 'sgn',
    eso: 'sgn',
    eth: 'sgn',
    fcs: 'sgn',
    fse: 'sgn',
    fsl: 'sgn',
    fss: 'sgn',
    gan: 'zh',
    gds: 'sgn',
    gom: 'kok',
    gse: 'sgn',
    gsg: 'sgn',
    gsm: 'sgn',
    gss: 'sgn',
    gus: 'sgn',
    hab: 'sgn',
    haf: 'sgn',
    hak: 'zh',
    hds: 'sgn',
    hji: 'ms',
    hks: 'sgn',
    hnm: 'zh',
    hos: 'sgn',
    hps: 'sgn',
    hsh: 'sgn',
    hsl: 'sgn',
    hsn: 'zh',
    icl: 'sgn',
    iks: 'sgn',
    ils: 'sgn',
    inl: 'sgn',
    ins: 'sgn',
    ise: 'sgn',
    isg: 'sgn',
    isr: 'sgn',
    jak: 'ms',
    jax: 'ms',
    jcs: 'sgn',
    jhs: 'sgn',
    jks: 'sgn',
    jls: 'sgn',
    jos: 'sgn',
    jsl: 'sgn',
    jus: 'sgn',
    kgi: 'sgn',
    knn: 'kok',
    kvb: 'ms',
    kvk: 'sgn',
    kvr: 'ms',
    kxd: 'ms',
    lbs: 'sgn',
    lce: 'ms',
    lcf: 'ms',
    lgs: 'sgn',
    liw: 'ms',
    lls: 'sgn',
    lsb: 'sgn',
    lsc: 'sgn',
    lsg: 'sgn',
    lsl: 'sgn',
    lsn: 'sgn',
    lso: 'sgn',
    lsp: 'sgn',
    lst: 'sgn',
    lsv: 'sgn',
    lsw: 'sgn',
    lsy: 'sgn',
    ltg: 'lv',
    luh: 'zh',
    lvs: 'lv',
    lws: 'sgn',
    lzh: 'zh',
    max: 'ms',
    mdl: 'sgn',
    meo: 'ms',
    mfa: 'ms',
    mfb: 'ms',
    mfs: 'sgn',
    min: 'ms',
    mnp: 'zh',
    mqg: 'ms',
    mre: 'sgn',
    msd: 'sgn',
    msi: 'ms',
    msr: 'sgn',
    mui: 'ms',
    mzc: 'sgn',
    mzg: 'sgn',
    mzy: 'sgn',
    nan: 'zh',
    nbs: 'sgn',
    ncs: 'sgn',
    nsi: 'sgn',
    nsl: 'sgn',
    nsp: 'sgn',
    nsr: 'sgn',
    nzs: 'sgn',
    okl: 'sgn',
    orn: 'ms',
    ors: 'ms',
    pel: 'ms',
    pga: 'ar',
    pgz: 'sgn',
    pks: 'sgn',
    prl: 'sgn',
    prz: 'sgn',
    psc: 'sgn',
    psd: 'sgn',
    pse: 'ms',
    psg: 'sgn',
    psl: 'sgn',
    pso: 'sgn',
    psp: 'sgn',
    psr: 'sgn',
    pys: 'sgn',
    rib: 'sgn',
    rms: 'sgn',
    rnb: 'sgn',
    rsi: 'sgn',
    rsl: 'sgn',
    rsm: 'sgn',
    rsn: 'sgn',
    sdl: 'sgn',
    sfb: 'sgn',
    sfs: 'sgn',
    sgg: 'sgn',
    sgx: 'sgn',
    shu: 'ar',
    sjc: 'zh',
    slf: 'sgn',
    sls: 'sgn',
    sqk: 'sgn',
    sqs: 'sgn',
    sqx: 'sgn',
    ssh: 'ar',
    ssp: 'sgn',
    ssr: 'sgn',
    svk: 'sgn',
    swc: 'sw',
    swh: 'sw',
    swl: 'sgn',
    syy: 'sgn',
    szs: 'sgn',
    tmw: 'ms',
    tse: 'sgn',
    tsm: 'sgn',
    tsq: 'sgn',
    tss: 'sgn',
    tsy: 'sgn',
    tza: 'sgn',
    ugn: 'sgn',
    ugy: 'sgn',
    ukl: 'sgn',
    uks: 'sgn',
    urk: 'ms',
    uzn: 'uz',
    uzs: 'uz',
    vgt: 'sgn',
    vkk: 'ms',
    vkt: 'ms',
    vsi: 'sgn',
    vsl: 'sgn',
    vsv: 'sgn',
    wbs: 'sgn',
    wuu: 'zh',
    xki: 'sgn',
    xml: 'sgn',
    xmm: 'ms',
    xms: 'sgn',
    yds: 'sgn',
    ygs: 'sgn',
    yhs: 'sgn',
    ysl: 'sgn',
    ysm: 'sgn',
    yue: 'zh',
    zhk: 'sgn',
    zib: 'sgn',
    zlm: 'ms',
    zmi: 'ms',
    zsl: 'sgn',
    zsm: 'ms',
}

/**
 * @param {string} char
 * @returns {boolean}
 */
function isAlphabetical(char) {
    return /[a-z]/i.test(char)
}

/**
 * @param {string} char
 * @returns {boolean}
 */
function isAlphaNumeric(char) {
    return isAlphabetical(char) || isDigit(char)
}

/**
 * @param {Stream} input
 * @param {object} definition
 * @returns {SyntaxError|string|null}
 */
function consumeSubtag(input, definition) {

    if (input.atEnd()) {
        return null
    }

    const { index } = input
    const { allowDigits, allowWildCard, onlyDigits, length = [1] } = definition

    if (-1 < index) {
        if (!input.consume('-')) {
            return error({ message: 'Invalid language subtag separator' })
        }
        if (allowWildCard && input.consume('*')) {
            return consumeSubtag(input, definition)
        }
    } else if (allowWildCard && input.consume('*')) {
        if (input.next() === '-' || input.atEnd()) {
            return '*'
        }
        return error({ message: 'Invalid language wild card' })
    }

    let value
    if (allowDigits) {
        value = input.consumeRunOf(isAlphaNumeric)
    } else if (onlyDigits) {
        value = input.consumeRunOf(isDigit)
    } else {
        value = input.consumeRunOf(isAlphabetical)
    }
    const [min, max = MAX_SUBTAG_LENGTH] = Array.isArray(length) ? length : [length, length]

    if (MAX_SUBTAG_LENGTH < value.length) {
        return error({ message: 'Invalid language subtag length' })
    }
    if (value.length < min || max < value.length) {
        input.backtrack(index)
        return null
    }
    return value
}

/**
 * @param {string} tag
 * @param {boolean} [allowWildCard]
 * @returns {SyntaxError|string|null}
 */
function consumePrivateSubtag(input, allowWildCard) {

    const { index } = input

    let reserved = consumeSubtag(input, { allowWildCard })
    if (isFailure(reserved)) {
        return reserved
    }
    if (reserved !== 'x' && reserved !== '*') {
        input.backtrack(index)
        return null
    }

    while (!input.atEnd()) {
        const subtag = consumeSubtag(input, { allowDigits: true, allowWildCard })
        if (isError(subtag)) {
            return subtag
        }
        if (!subtag) {
            break
        }
        reserved += `-${subtag}`
    }
    if (reserved.length === 1 && reserved !== '*' && !allowWildCard) {
        input.backtrack(index)
        return null
    }
    return reserved
}

/**
 * @param {Stream} input
 * @param {boolean} [allowWildCard]
 * @returns {SyntaxError|string|null}
 */
function consumeExtensionSubtag(input, allowWildCard) {

    const { index } = input

    let extension = consumeSubtag(input, { allowDigits: true, allowWildCard, length: 1 })
    if (isFailure(extension)) {
        return extension
    }
    if (extension === 'x') {
        input.backtrack(index)
        return null
    }

    while (!input.atEnd()) {
        const subtag = consumeSubtag(input, { allowDigits: true, allowWildCard, length: [2] })
        if (isError(subtag)) {
            return subtag
        }
        if (!subtag) {
            break
        }
        extension += `-${subtag}`
    }
    if (extension.length === 1 && extension !== '*' && !allowWildCard) {
        input.backtrack(index)
        return null
    }
    return extension
}

/**
 * @param {Stream} input
 * @param {boolean} [allowWildCard]
 * @returns {SyntaxError|string}
 */
function consumeExtensionSubtags(input, allowWildCard) {
    const list = []
    while (!input.atEnd()) {
        const extension = consumeExtensionSubtag(input, allowWildCard)
        if (isError(extension)) {
            return extension
        }
        if (!extension) {
            break
        }
        list.push(extension)
    }
    return list.sort((a, b) => a[0] < b[0] ? -1 : 0).join('-')
}

/**
 * @param {Stream} input
 * @param {boolean} [allowWildCard]
 * @returns {SyntaxError|string}
 */
function consumeVariantSubtags(input, allowWildCard) {
    const list = []
    while (!input.atEnd()) {
        const variant = consumeSubtag(input, { allowDigits: true, allowWildCard, length: [4] })
        if (isError(variant)) {
            return variant
        }
        if (!variant || (variant.length === 4 && !isDigit(variant[0]))) {
            break
        }
        list.push(variants[variant] ?? variant)
    }
    return list.join('-')
}

/**
 * @param {Stream} input
 * @param {boolean} [allowWildCard]
 * @returns {SyntaxError|string|null}
 */
function consumeRegionSubtag(input, allowWildCard) {
    let region = consumeSubtag(input, { allowWildCard, length: 2 })
    if (isError(region)) {
        return region
    }
    if (region) {
        return regions[region] ?? region
    }
    region = consumeSubtag(input, { allowWildCard, length: 3, onlyDigits: true })
    if (isFailure(region)) {
        return region
    }
    return regions[region] ?? region
}

/**
 * @param {Stream} input
 * @param {boolean} [allowWildCard]
 * @returns {SyntaxError|string|null}
 */
function consumeScriptSubtag(input, allowWildCard) {
    return consumeSubtag(input, { allowWildCard, length: 4 })
}

/**
 * @param {Stream} input
 * @param {boolean} [allowWildCard]
 * @returns {SyntaxError|string}
 */
function consumeExtendedLanguageSubtag(input, allowWildCard) {
    let extension = ''
    let index = 0
    while (index++ < 3 && !input.atEnd()) {
        const subtag = consumeSubtag(input, { allowWildCard, length: 3 })
        if (isError(subtag)) {
            return subtag
        }
        if (!subtag) {
            break
        }
        extension += `-${subtag}`
    }
    return extension
}

/**
 * @param {Stream}
 * @param {boolean} [allowWildCard]
 * @returns {SyntaxError|string|null}
 */
function consumeLanguageSubtag(input, allowWildCard) {

    const primary = consumeSubtag(input, { allowWildCard, length: [2] })

    if (isFailure(primary)) {
        return primary
    }

    let language = languages[primary] ?? primary

    const prefix = extlangs[language]
    if (prefix) {
        language = `${prefix}-${language}`
    }

    if (primary.length < 4) {
        const extension = consumeExtendedLanguageSubtag(input, allowWildCard)
        if (isError(extension)) {
            return extension
        }
        if (extension) {
            language += extension
        }
    }
    return language
}

/**
 * @param {string} tag
 * @param {boolean} [allowWildCard]
 * @returns {string}
 */
function consumeLanguageTag(input, allowWildCard) {
    let language = consumeLanguageSubtag(input, allowWildCard)
    if (isFailure(language)) {
        return language
    }
    const optionals = [
        consumeScriptSubtag,
        consumeRegionSubtag,
        consumeVariantSubtags,
        consumeExtensionSubtags,
        consumePrivateSubtag,
    ]
    for (const consume of optionals) {
        const subtag = consume(input, allowWildCard)
        if (isError(subtag)) {
            return subtag
        }
        if (subtag) {
            language += `-${subtag}`
        }
    }
    return language
}

/**
 * @param {string} input
 * @param {boolean} [allowWildCard]
 * @returns {string|null}
 * @see {@link https://www.rfc-editor.org/rfc/rfc5646#section-2.1}
 */
function parseLanguageTag(input, allowWildCard) {

    input = toLowerCase(input)

    let tag = grandfathered[input]
    if (tag) {
        return tag
    }

    input = new Stream(redundant[input] ?? input)

    tag = consumeLanguageTag(input, allowWildCard)
    if (isError(tag)) {
        return null
    }
    if (tag && input.atEnd()) {
        return redundant[tag] ?? tag
    }

    tag = consumePrivateSubtag(input, allowWildCard)
    if (isFailure(tag) || !input.atEnd()) {
        return null
    }
    return tag
}

/**
 * @param {Element} element
 * @returns {string|null}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics.html#pragma-set-default-language}
 */
function getPageLanguageTag({ ownerDocument }) {
    const selector = parseGrammar('meta[http-equiv=content-language i]', '<selector-list>')
    const tags = matchTreesAgainstSelectors([ownerDocument], selector)
    return tags.findLast(({ content }) => content && !content.includes(','))?.content ?? null
}

/**
 * @param {Element} element
 * @returns {string|null}
 * @see {@link https://html.spec.whatwg.org/multipage/dom.html#language}
 */
function getElementLanguageTag(element) {
    if (element.hasAttributeNS(XML_NAMESPACE, 'lang')) {
        return element.getAttributeNS(XML_NAMESPACE, 'lang')
    }
    const { namespaceURI } = element
    if ((namespaceURI === HTML_NAMESPACE || namespaceURI === SVG_NAMESPACE) && element.hasAttribute('lang')) {
        return element.getAttribute('lang')
    }
    const parent = getParent(element)
    return parent ? getElementLanguageTag(parent) : getPageLanguageTag(element)
}

/**
 * @param {string} tag
 * @param {string} range
 * @returns {boolean}
 * @see {@link https://www.rfc-editor.org/rfc/rfc4647#section-3.3.2}
 */
function matchesLanguageRange(tag, range) {

    tag = tag.split('-')
    range = range.split('-')

    if (range[0] !== tag[0] && range[0] !== '*') {
        return false
    }

    let tagIndex = 1
    let rangeIndex = 1
    let tagSubtag = tag[tagIndex]
    let rangeSubtag = range[rangeIndex]

    while (rangeSubtag) {
        if (rangeSubtag === '*') {
            rangeSubtag = range[++rangeIndex]
            continue
        }
        if (tagSubtag === rangeSubtag) {
            rangeSubtag = range[++rangeIndex]
            tagSubtag = tag[++tagIndex]
            continue
        }
        if (!tagSubtag || tagSubtag.length === 1) {
            return false
        }
        tagSubtag = tag[++tagIndex]
    }

    return true
}

export {
    getElementLanguageTag,
    matchesLanguageRange,
    parseLanguageTag,
}
