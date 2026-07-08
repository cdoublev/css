
import { ELEMENT_NODE_TYPE, HTML_NAMESPACE, TEXT_NODE_TYPE } from '../utils/dom/constants.js'
import { every, iterate, some } from '../utils/dom/collection.js'
import {
    findAncestor,
    findFirstSiblingIndex,
    findLastSiblingIndex,
    findNextSibling,
    findPreviousSibling,
    isOfType,
    leftCombined,
    rightCombined,
} from '../utils/dom/element.js'
import { getElementLanguageTag, matchesLanguageRange, parseLanguageTag } from '../utils/dom/language.js'
import { isDelimiter, isOmitted } from '../utils/value.js'
import { isHTMLDocument, isShadowRoot, traverse } from '../utils/dom/tree.js'
import { serializeComponentValue, serializeIdentifier } from '../serialize.js'
import getDirectionality from '../utils/dom/directionality.js'
import { parseGrammar } from '../parse/parser.js'
import { toLowerCase } from '../utils/string.js'

const MEDIA_NETWORK_STATE_LOADING = 2
const MEDIA_READY_STATE_HAVE_CURRENT_DATA = 2

const links = ['a', 'area']
const medias = ['audio', 'video']
const submitables = ['button', 'input', 'select', 'textarea']

const caseInsensitiveAttributes = [
    'accept',
    'accept-charset',
    'align',
    'alink',
    'axis',
    'bgcolor',
    'charset',
    'checked',
    'clear',
    'codetype',
    'color',
    'compact',
    'declare',
    'defer',
    'dir',
    'direction',
    'disabled',
    'enctype',
    'face',
    'frame',
    'hreflang',
    'http-equiv',
    'lang',
    'language',
    'link',
    'media',
    'method',
    'multiple',
    'nohref',
    'noresize',
    'noshade',
    'nowrap',
    'readonly',
    'rel',
    'rev',
    'rules',
    'scope',
    'scrolling',
    'selected',
    'shape',
    'target',
    'text',
    'type',
    'valign',
    'valuetype',
    'vlink',
]

const inputTypeAttributes = {
    'button': [],
    'checkbox': ['checked', 'required'],
    'color': ['autocomplete'],
    'date': ['autocomplete', 'max', 'min', 'readonly', 'required'],
    'datetime-local': ['autocomplete', 'max', 'min', 'readonly', 'required'],
    'email': ['autocomplete', 'placeholder', 'readonly', 'required'],
    'file': ['required'],
    'hidden': ['autocomplete'],
    'image': [],
    'month': ['autocomplete', 'max', 'min', 'readonly', 'required'],
    'number': ['autocomplete', 'max', 'min', 'placeholder', 'readonly', 'required'],
    'password': ['autocomplete', 'placeholder', 'readonly', 'required'],
    'radio': ['checked', 'required'],
    'range': ['autocomplete', 'max', 'min'],
    'reset': [],
    'search': ['autocomplete', 'placeholder', 'readonly', 'required'],
    'submit': [],
    'tel': ['autocomplete', 'readonly', 'required'],
    'text': ['autocomplete', 'placeholder', 'readonly', 'required'],
    'time': ['autocomplete', 'max', 'min', 'readonly', 'required'],
    'url': ['autocomplete', 'readonly', 'required'],
    'week': ['autocomplete', 'max', 'min', 'readonly', 'required'],
}

/**
 * @param {*[]} selector
 * @param {ElementImpl} element
 * @param {object} context
 */
function addSelectorToElementCache(selector, element, { anchors, elementCache, scopes }) {
    if (!anchors && !scopes) {
        const key = serializeComponentValue(selector)
        if (elementCache.has(key)) {
            elementCache.get(key).push(element)
        } else {
            elementCache.set(key, [element])
        }
    }
}

/**
 * @param {NodeImpl} tree
 * @param {object} [context]
 * @returns {object}
 */
function createContext(tree, { elementCache = new Map, ...context } = {}) {
    return { elementCache, root: tree.getRootNode({}), ...context }
}

/**
 * @param {number} a
 * @param {number} n
 * @param {number} b
 * @returns {boolean}
 */
function isAnBTh(a, n, b) {
    if (a === 0) {
        return n === b
    }
    if (0 < a) {
        return b <= n && (n - b) % a === 0
    }
    return n <= b && (b - n) % -a === 0
}

/**
 * @param {AttrImpl} attribute
 * @param {string} [modifier]
 * @returns {boolean}
 */
function isCaseInsensitiveAttribute({ localName, ownerElement }, modifier) {
    switch (modifier) {
        case 'i':
            return true
        case undefined:
            return caseInsensitiveAttributes.includes(localName)
                && isHTMLDocument(ownerElement.ownerDocument)
        default:
            return false
    }
}


// Pseudo matching utilities

/**
 * @param {ElementImpl} meter
 * @returns {string}
 */
function getMeterValueRegion({ high, low, max, min, optimum, value }) {
    if (optimum === low || optimum === high || (low < optimum && optimum < high)) {
        if (low <= value && value <= high) {
            return 'optimal'
        }
        if (min <= value && value < low) {
            return 'low'
        }
        if (high < value && value <= max) {
            return 'high'
        }
        return 'out-of-range'
    }
    if (optimum < low) {
        if (min <= value && value <= low) {
            return 'optimal'
        }
        if (value <= max) {
            return 'high'
        }
        return 'out-of-range'
    }
    // high < optimum
    if (high <= value && value <= max) {
        return 'optimal'
    }
    if (min <= value) {
        return 'low'
    }
    return 'out-of-range'
}

/**
 * @param {ElementImpl} element
 * @param {object} context
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-view-transitions-2/#active-view-transition-pseudo}
 */
function hasActiveViewTransition(element, context) {
    return isRoot(element, context) && element.ownerDocument.activeViewTransition
}

/**
 * @param {ElementImpl} element
 * @param {object[]} types
 * @param {object} context
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-view-transitions-2/#active-view-transition-type-pseudo}
 */
function hasActiveViewTransitionType(element, types, context) {
    const transition = hasActiveViewTransition(element, context)
    return transition && types.some(type => transition.types.includes(serializeIdentifier(type)))
}

/**
 * @param {ElementImpl} element
 * @param {object} direction
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#dir-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-ltr}
 */
function hasDirection(element, direction) {
    return getDirectionality(element) === direction.value
}

/**
 * @param {ElementImpl} element
 * @param {object[]} ranges
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#lang-pseudo}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/8720}
 */
function hasLanguage(element, ranges) {
    let tag = getElementLanguageTag(element)
    if (tag === null) {
        return false
    }
    if (tag === '') {
        return ranges.some(range => range.value === '')
    }
    tag = parseLanguageTag(tag)
    if (tag) {
        return ranges.some(({ value }) => {
            value = value && parseLanguageTag(value, true)
            return value && matchesLanguageRange(tag, value)
        })
    }
    return false
}

/**
 * @param {ElementImpl} element
 * @param {string} value
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-high-value}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-low-value}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-optimal-value}
 */
function hasMeterValue(element, value) {
    return isOfType(element, 'meter') && getMeterValueRegion(element) === value
}

/**
 * @param {ElementImpl} element
 * @param {*[]} selectors
 * @param {object} context
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#has-pseudo}
 */
function hasRelativeMatching(element, selectors, context) {
    return selectors.some(([combinator, [head, tail]]) => {
        function matchRight(left, combinator, compound, index = 0) {
            for (const right of rightCombined(left, combinator)) {
                if (
                    matchCompoundSelector(right, compound, context)
                    && (index === tail.length || matchRight(right, ...tail[index], index + 1))
                ) {
                    return true
                }
            }
            return false
        }
        return matchRight(element, combinator, head)
    })
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-shadow-1/#selectordef-has-slotted}
 */
function hasSlotted(element) {
    return isOfType(element, 'slot') && 0 < element.assignedNodes({ flatten: true }).length
}

/**
 * @param {ElementImpl} a
 * @param {ElementImpl} b
 * @returns {boolean}
 */
function haveSameType(a, b) {
    return a.localName === b.localName && a.namespaceURI === b.namespaceURI
}

/**
 * @param {ElementImpl} element
 * @param {object[]} anb
 * @param {object|*[]} selector
 * @param {object} [context]
 * @param {boolean} [reverse]
 * @returns {boolean}
 */
function isAnBOfSelector(element, { value: { a, b } }, selector, context, reverse) {
    const predicate = isOmitted(selector) ? sibling => sibling : sibling => matchElementAgainstSelectors(sibling, selector[1], context)
    const n = reverse ? findLastSiblingIndex(element, predicate) : findFirstSiblingIndex(element, predicate)
    return -1 < n && isAnBTh(a, n + 1, b)
}

/**
 * @param {ElementImpl} element
 * @param {object[]} anb
 * @param {boolean} [reverse]
 * @returns {boolean}
 */
function isAnBOfType(element, { value: { a, b } }, reverse) {
    const predicate = sibling => haveSameType(sibling, element)
    const n = reverse ? findLastSiblingIndex(element, predicate) : findFirstSiblingIndex(element, predicate)
    return isAnBTh(a, n + 1, b)
}

/**
 * @param {ElementImpl} element
 * @param {object} context
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#selectordef-}
 */
function isAnchor(element, context) {
    return context.anchors?.includes(element) ?? isScopingRoot(element, context)
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#any-link-pseudo}
 */
function isAnyLink(element) {
    return isOfType(element, ...links) && element.getAttributeNode('href')
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-5/#blank-pseudo}
 */
function isBlank(element) {
    if (isOfType(element, 'input')) {
        switch (element.type) {
            case 'button':
            case 'image':
            case 'reset':
            case 'submit':
                return false
            case 'checkbox':
            case 'radio':
                return !element.checked
        }
        return element.value === ''
    }
    if (isOfType(element, 'select')) {
        return element.selectedIndex === -1
    }
    if (isOfType(element, 'textarea')) {
        return element.value === ''
    }
    return false
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-buffering}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-buffering}
 */
function isBuffering(element) {
    return isOfType(element, ...medias)
        && !element.paused
        && element.networkState === MEDIA_NETWORK_STATE_LOADING
        && element.readyState === MEDIA_READY_STATE_HAVE_CURRENT_DATA
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#candidate-for-constraint-validation}
 */
function isCandidateForConstraintValidation(element) {
    return isOfType(element, ...submitables)
        // && is not barred from constraint validation
        && element.type !== 'button'
        && element.type !== 'hidden'
        && element.type !== 'reset'
        && !(isOfType(element, 'button') && !isSubmitButton(element))
        && !(isOfType(element, 'input', 'textarea') && element.hasAttribute('readonly'))
        && isEnabled(element)
        && !findAncestor(element, element => isOfType(element, 'datalist'))
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#checked-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-checked}
 */
function isChecked(element) {
    if (isOfType(element, 'input')) {
        return element.checked && inputTypeAttributes[element.type].includes('checked')
    }
    if (isOfType(element, 'option')) {
        return element.selected
    }
    return false
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#default-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-default}
 */
function isDefault(element) {
    if (isOfType(element, 'input') && inputTypeAttributes[element.type].includes('checked')) {
        return element.hasAttribute('checked')
    }
    if (isOfType(element, 'option')) {
        return element.hasAttribute('selected')
    }
    if (element.form) {
        for (const child of traverse(element.getRootNode({}))) {
            if (child.form === element.form && isSubmitButton(child)) {
                return element === child
            }
        }
    }
    return false
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#disabled-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-disabled}
 */
function isDisabled(element) {
    if (isOfType(element, 'optgroup')) {
        return element.hasAttribute('disabled')
    }
    if (isOfType(element, 'option')) {
        if (element.hasAttribute('disabled')) {
            return true
        }
        const group = findAncestor(
            element,
            element => isOfType(element, 'optgroup'),
            element => isOfType(element, 'datalist', 'hr', 'option', 'select'))
        return group?.hasAttribute('disabled')
    }
    if (isOfType(element, 'button', 'fieldset', 'input', 'select', 'textarea')) {
        if (element.hasAttribute('disabled')) {
            return true
        }
        const fieldSet = findAncestor(element, element => isOfType(element, 'fieldset') && element.hasAttribute('disabled'))
        if (fieldSet) {
            const { firstElementChild } = fieldSet
            return !isOfType(firstElementChild, 'legend')
                || !findAncestor(element, parent => parent === firstElementChild, parent => parent === fieldSet)
        }
    }
    return false
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#empty-pseudo}
 */
function isEmpty(element) {
    const { childNodes } = element
    for (let index = 0; index < childNodes.length; index++) {
        const { data, nodeType } = childNodes.item(index)
        if (nodeType === ELEMENT_NODE_TYPE || (nodeType === TEXT_NODE_TYPE && 0 < data.length)) {
            return false
        }
    }
    return true
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#enabled-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-enabled}
 */
function isEnabled(element) {
    return isOfType(element, 'button', 'fieldset', 'input', 'optgroup', 'option', 'select', 'textarea')
        && !isDisabled(element)
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#first-child-pseudo}
 */
function isFirstChild(element) {
    return !element.previousElementSibling
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#first-of-type-pseudo}
 */
function isFirstOfType(element) {
    return !findPreviousSibling(element, sibling => haveSameType(element, sibling))
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-fullscreen}
 * @see {@link https://fullscreen.spec.whatwg.org/#:fullscreen-pseudo-class}
 */
function isFullscreen(element) {
    return element === element.getRootNode({}).fullscreenElement
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-5/#heading-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-heading}
 */
function isHeading(element) {
    return isOfType(element, 'h1', 'h2', 'h3', 'h4', 'h5', 'h6')
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-5/#heading-functional-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-heading-functional}
 */
function isHeadingLevel(element, levels) {
    if (isHeading(element)) {
        const level = element.localName.slice(1)
        return levels.some(number => serializeComponentValue(number) === level)
    }
    return false
}

/**
 * @param {ElementImpl} element
 * @param {object} context
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-shadow-1/#selectordef-host}
 */
function isHost(element, context) {
    return element === context.root.host
}

/**
 * @param {ElementImpl} element
 * @param {object[]} selector
 * @param {object} context
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-shadow-1/#selectordef-host-function}
 */
function isHostMatching(element, selector, context) {
    return isHost(element, context)
        && matchCompoundSelector(element, selector, { ...context, root: element.getRootNode({}) })
}

/**
 * @param {ElementImpl} element
 * @param {object[]} selector
 * @param {object} context
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-shadow-1/#selectordef-host-context}
 */
function isHostContextMatching(element, selector, context) {
    if (isHost(element, context)) {
        context = { ...context, root: element.getRootNode({}) }
        return matchCompoundSelector(element, selector, context)
            || findAncestor(element, element => matchCompoundSelector(element, selector, context))
    }
    return false
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#in-range-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-in-range}
 */
function isInRange(element) {
    return isRangeLimited(element)
        && isCandidateForConstraintValidation(element)
        && !element.validity.rangeOverflow
        && !element.validity.rangeUnderflow
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#indeterminate-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-indeterminate}
 */
function isIndeterminate(element) {
    if (isOfType(element, 'progress')) {
        return !element.getAttributeNode('value')
    }
    if (isOfType(element, 'input')) {
        const { form, indeterminate, type } = element
        const name = element.getAttribute('name')
        if (type === 'checkbox') {
            return indeterminate
        }
        if (type === 'radio' && name) {
            if (form) {
                return every(form.elements, control => !(control.type === 'radio' && control.name === name && control.checked))
            }
            const root = element.getRootNode({})
            const selectors = parseGrammar(`input[type=radio][name="${name}"]:checked`, '<selector-list>')
            const elements = matchTreesAgainstSelectors([root], selectors)
            return elements.every(element => element.form || !element.checked)
        }
    }
    return false
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#invalid-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-invalid}
 */
function isInvalid(element) {
    if (isOfType(element, 'form', 'fieldset')) {
        return some(element.elements, element => isCandidateForConstraintValidation(element) && isInvalid(element))
    }
    return isCandidateForConstraintValidation(element) && !element.validity.valid
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#last-child-pseudo}
 */
function isLastChild(element) {
    return !element.nextElementSibling
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#last-of-type-pseudo}
 */
function isLastOfType(element) {
    return !findNextSibling(element, sibling => haveSameType(element, sibling))
}

/**
 * @param {ElementImpl} element
 * @param {object} [level]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-5/#local-link-pseudo}
 */
function isLocalLink(element, level) {
    if (isAnyLink(element)) {
        let link = URL.parse(element.href)
        if (link === null) {
            return false
        }
        let current = element.ownerDocument.location
        if (current.protocol !== link.protocol || current.host !== link.host || current.search !== link.search) {
            return false
        }
        current = current.pathname.slice(1).split('/')
        level = level?.value ?? current.length
        if (current.length < level) {
            return false
        }
        // Undo path defaulting to `/` after URL.parse()
        if (link.pathname === '/' && !element.getAttribute('href').endsWith('/')) {
            link = []
        } else {
            link = link.pathname.slice(1).split('/')
        }
        if (link.length < level) {
            return false
        }
        return current.slice(0, level).every((segment, index) => segment === link[index])
    }
    return false
}

/**
 * @param {ElementImpl} element
 * @param {*[]} selectors
 * @param {object} context
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#matches-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#where-pseudo}
 */
function isMatching(element, selectors, context) {
    selectors = selectors.filter(selector => 0 < selector.types.length)
    return matchElementAgainstSelectors(element, selectors, context)
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-modal}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-modal}
 */
function isModal(element) {
    return isFullscreen(element)
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-muted}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-muted}
 */
function isMuted(element) {
    return isOfType(element, ...medias) && element.muted
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#only-child-pseudo}
 */
function isOnlyChild(element) {
    return isFirstChild(element) && isLastChild(element)
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#only-of-type-pseudo}
 */
function isOnlyOfType(element) {
    return isFirstOfType(element) && isLastOfType(element)
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-open}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-open}
 */
function isOpen(element) {
    return element.hasAttribute('open') && isOfType(element, 'details', 'dialog')
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#optional-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-optional}
 */
function isOptional(element) {
    if (isOfType(element, 'input')) {
        return !element.hasAttribute('required') && inputTypeAttributes[element.type].includes('required')
    }
    if (isOfType(element, 'select', 'textarea')) {
        return !element.hasAttribute('required')
    }
    return false
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#out-of-range-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-out-of-range}
 */
function isOutOfRange(element) {
    return isRangeLimited(element)
        && isCandidateForConstraintValidation(element)
        && (element.validity.rangeOverflow || element.validity.rangeUnderflow)
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-paused}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-paused}
 */
function isPaused(element) {
    return isOfType(element, ...medias) && element.paused
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-picture-in-picture}
 * @see {@link https://w3c.github.io/picture-in-picture/#css-pseudo-class}
 */
function isPictureInPicture(element) {
    return element === element.getRootNode({}).pictureInPictureElement
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#placeholder-shown-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-placeholder-shown}
 */
function isShowingPlaceholder(element) {
    if (isOfType(element, 'input')) {
        return inputTypeAttributes[element.type].includes('placeholder')
            && element.value === ''
            && element.getAttributeNode('placeholder')
    }
    if (isOfType(element, 'textarea')) {
        return element.value === ''
            && element.getAttributeNode('placeholder')
    }
    return false
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-playing}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-playing}
 */
function isPlaying(element) {
    return isOfType(element, ...medias) && !element.paused
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://html.spec.whatwg.org/multipage/input.html#have-range-limitations}
 */
function isRangeLimited(element) {
    return isOfType(element, 'input')
        && inputTypeAttributes[element.type].includes('min')
        && (element.type === 'range' || element.hasAttribute('min') || element.hasAttribute('max'))
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#read-only-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-read-only}
 */
function isReadOnly(element) {
    return !isReadWrite(element) && element.namespaceURI === HTML_NAMESPACE
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#read-write-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-read-write}
 */
function isReadWrite(element) {
    if (isOfType(element, 'input')) {
        return !element.hasAttribute('readonly')
            && isEnabled(element)
            && inputTypeAttributes[element.type].includes('readonly')
    }
    if (isOfType(element, 'textarea')) {
        return !element.hasAttribute('readonly')
            && isEnabled(element)
    }
    return element.isContentEditable
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#required-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-required}
 */
function isRequired(element) {
    if (isOfType(element, 'input')) {
        return element.hasAttribute('required')
            && inputTypeAttributes[element.type].includes('required')
    }
    if (isOfType(element, 'select', 'textarea')) {
        return element.hasAttribute('required')
    }
    return false
}

/**
 * @param {ElementImpl} element
 * @param {object} context
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#root-pseudo}
 */
function isRoot(element, context) {
    return element === context.root.documentElement
}

/**
 * @param {ElementImpl} element
 * @param {object} context
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#scope-pseudo}
 */
function isScopingRoot(element, { root, scopes }) {
    if (scopes) {
        return scopes.roots.find(root => root === element || root.documentElement === element)
    }
    return element === (root.host ?? root.documentElement)
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-seeking}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-seeking}
 */
function isSeeking(element) {
    return isOfType(element, ...medias) && element.seeking
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://html.spec.whatwg.org/multipage/forms.html#concept-submit-button}
 */
function isSubmitButton(element) {
    return (isOfType(element, 'button') && element.type === 'submit')
        || (isOfType(element, 'input') && (element.type === 'image' || element.type === 'submit'))
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#target-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-target}
 */
function isTarget(element) {
    return element.isConnected
        && element.hasAttribute('id')
        && element.getAttribute('id') === element.ownerDocument.location.hash.slice(1)
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#unchecked-pseudo}
 */
function isUnchecked(element) {
    if (isOfType(element, 'input')) {
        return !element.checked
            && inputTypeAttributes[element.type].includes('checked')
    }
    if (isOfType(element, 'option')) {
        return !element.selected
    }
    return false
}

/**
 * @param {ElementImpl} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#valid-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-valid}
 */
function isValid(element) {
    if (isOfType(element, 'form', 'fieldset')) {
        return every(element.elements, element => !isCandidateForConstraintValidation(element) || isValid(element))
    }
    return isCandidateForConstraintValidation(element) && element.validity.valid
}


// Match against selectors

/**
 * @param {ElementImpl} element
 * @param {object} selector
 * @param {object} [context]
 * @returns {boolean}
 */
function matchPseudoClassSelector(element, { name, value }, context) {
    switch (name) {
        case undefined:
            break
        case 'active-view-transition-type':
            return hasActiveViewTransitionType(element, value, context)
        case 'dir':
            return hasDirection(element, value)
        case 'has':
            return hasRelativeMatching(element, value, context)
        case 'host':
            return isHostMatching(element, value, context)
        case 'host-context':
            return isHostContextMatching(element, value, context)
        case 'heading':
            return isHeadingLevel(element, value)
        case 'is':
            return isMatching(element, value, context)
        case 'lang':
            return hasLanguage(element, value)
        case 'local-link':
            return isLocalLink(element, value)
        case 'not':
            return !isMatching(element, value, context)
        case 'nth-child':
            return isAnBOfSelector(element, ...value, context)
        case 'nth-last-child':
            return isAnBOfSelector(element, ...value, context, true)
        case 'nth-last-of-type':
            return isAnBOfType(element, value, true)
        case 'nth-of-type':
            return isAnBOfType(element, value)
        case 'where':
            return isMatching(element, value, context)
        default:
            return false
    }
    switch (value) {
        case 'active-view-transition':
            return hasActiveViewTransition(element, context)
        case 'any-link':
            return isAnyLink(element)
        case 'blank':
            return isBlank(element)
        case 'buffering':
            return isBuffering(element)
        case 'checked':
            return isChecked(element)
        case 'default':
            return isDefault(element)
        case 'disabled':
            return isDisabled(element)
        case 'empty':
            return isEmpty(element)
        case 'enabled':
            return isEnabled(element)
        case 'first-child':
            return isFirstChild(element)
        case 'first-of-type':
            return isFirstOfType(element)
        case 'fullscreen':
            return isFullscreen(element)
        case 'has-slotted':
            return hasSlotted(element)
        case 'high-value':
            return hasMeterValue(element, 'high')
        case 'heading':
            return isHeading(element)
        case 'host':
            return isHost(element, context)
        case 'in-range':
            return isInRange(element)
        case 'indeterminate':
            return isIndeterminate(element)
        case 'invalid':
            return isInvalid(element)
        case 'last-child':
            return isLastChild(element)
        case 'last-of-type':
            return isLastOfType(element)
        case 'link':
            return isAnyLink(element)
        case 'local-link':
            return isLocalLink(element)
        case 'low-value':
            return hasMeterValue(element, 'low')
        case 'modal':
            return isModal(element)
        case 'muted':
            return isMuted(element)
        case 'only-child':
            return isOnlyChild(element)
        case 'only-of-type':
            return isOnlyOfType(element)
        case 'open':
            return isOpen(element)
        case 'optimal-value':
            return hasMeterValue(element, 'optimal')
        case 'optional':
            return isOptional(element)
        case 'out-of-range':
            return isOutOfRange(element)
        case 'paused':
            return isPaused(element)
        case 'placeholder-shown':
            return isShowingPlaceholder(element)
        case 'playing':
            return isPlaying(element)
        case 'picture-in-picture':
            return isPictureInPicture(element)
        case 'read-only':
            return isReadOnly(element)
        case 'read-write':
            return isReadWrite(element)
        case 'required':
            return isRequired(element)
        case 'root':
            return isRoot(element, context)
        case 'scope':
            return isScopingRoot(element, context)
        case 'seeking':
            return isSeeking(element)
        case 'target':
            return isTarget(element)
        case 'unchecked':
            return isUnchecked(element)
        case 'valid':
            return isValid(element)
        default:
            return false
    }
}

/**
 * @param {ElementImpl} element
 * @param {*[]} selector <pseudo-compound-selector>*
 * @param {object} [context]
 * @returns {boolean}
 */
function matchPseudoCompoundSelectors(element, pseudos, context) {
    return true
}

/**
 * @param {ElementImpl} element
 * @param {*[]} selector
 * @param {object} {context}
 * @returns {AttrImpl|null}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#case-sensitivity-of-selectors}
 */
function matchAttributeNameSelector(element, [prefix, name], { namespaces = new Map }) {
    prefix = serializeComponentValue(prefix).slice(0, -1)
    name = name.value
    if (element.namespaceURI === HTML_NAMESPACE && isHTMLDocument(element.ownerDocument)) {
        name = toLowerCase(name)
    }
    if (prefix === '*') {
        for (const attribute of iterate(element.attributes)) {
            if (attribute.localName === name) {
                return attribute
            }
        }
        return null
    }
    const namespace = prefix ? namespaces.get(prefix) : null
    return element.getAttributeNodeNS(namespace, name)
}

/**
 * @param {ElementImpl} element
 * @param {*[]} selector
 * @param {object} {context}
 * @returns {boolean}
 */
function matchAttributeSelector(element, { value: selector }, context) {
    if (selector.types.at(-1) === '<wq-name>') {
        return matchAttributeNameSelector(element, selector, context)
    }
    const attribute = matchAttributeNameSelector(element, selector[0], context)
    if (!attribute) {
        return false
    }
    let [, matcher, { value: expected }, { value: modifier }] = selector
    let actual = attribute.value
    if (isCaseInsensitiveAttribute(attribute, modifier)) {
        expected = toLowerCase(expected)
        actual = toLowerCase(actual)
    }
    switch (serializeComponentValue(matcher)) {
        case '*=':
            return expected && actual.includes(expected)
        case '^=':
            return expected && actual.startsWith(expected)
        case '=':
            return expected === actual
        case '|=':
            return expected === actual || actual.startsWith(`${expected}-`)
        case '~=':
            return expected && actual.split(' ').some(word => word === expected)
        case '$=':
            return expected && actual.endsWith(expected)
    }
}

/**
 * @param {ElementImpl} element
 * @param {*[]} selector
 * @param {object} {context}
 * @returns {boolean}
 */
function matchSubclassSelector(element, selector, context) {
    return selector.every(subclass => {
        if (isDelimiter('&', subclass)) {
            return isAnchor(element, context)
        }
        if (subclass.types.includes('<id-selector>')) {
            return subclass.value === element.getAttribute('id')
        }
        if (subclass.types.includes('<class-selector>')) {
            return element.classList.contains(subclass[1].value)
        }
        if (subclass.types.includes('<attribute-selector>')) {
            return matchAttributeSelector(element, subclass, context)
        }
        return matchPseudoClassSelector(element, subclass[1], context)
    })
}

/**
 * @param {ElementImpl} element
 * @param {object} selector
 * @returns {boolean}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#case-sensitivity-of-selectors}
 */
function matchTypeNameSelector({ localName, namespaceURI, ownerDocument }, { value: selector }) {
    if (namespaceURI === HTML_NAMESPACE && isHTMLDocument(ownerDocument)) {
        selector = toLowerCase(selector)
    }
    return selector === '*' || selector === localName
}

/**
 * @param {ElementImpl} element
 * @param {object|object[]} selector
 * @param {object} [context]
 * @returns {boolean}
 */
function matchTypeNamespacePrefixSelector({ namespaceURI }, selector, { namespaces = new Map }) {
    selector = serializeComponentValue(selector)
    switch (selector) {
        case '':
            return namespaces.has('') ? namespaces.get('') === namespaceURI : true
        case '|':
            return null === namespaceURI
        case '*|':
            return true
        default:
            return namespaces.get(selector.slice(0, -1)) === namespaceURI
    }
}

/**
 * @param {ElementImpl} element
 * @param {object|*[]} selector
 * @param {object} {context}
 * @returns {boolean}
 */
function matchTypeSelector(element, selector, context) {
    if (isOmitted(selector)) {
        return true
    }
    if (isDelimiter('&', selector)) {
        return isAnchor(element, context)
    }
    // :host is featureless in the context of a shadow tree
    if (isHost(element, context)) {
        return false
    }
    const [prefix, type] = selector
    return matchTypeNamespacePrefixSelector(element, prefix, context)
        && matchTypeNameSelector(element, type)
}

/**
 * @param {ElementImpl} element
 * @param {*[]} selector
 * @param {object} [context]
 * @returns {boolean}
 */
function matchCompoundSelector(element, selector, context) {
    if (selector.types.includes('<complex-selector-unit>')) {
        const [compound, pseudos] = selector
        return (isOmitted(compound) || matchCompoundSelector(element, compound, context))
            && matchPseudoCompoundSelectors(element, pseudos, context)
    }
    const [type, subclasses] = selector
    return matchTypeSelector(element, type, context)
        && matchSubclassSelector(element, subclasses, context)
}

/**
 * @param {ElementImpl} element
 * @param {*[]} selector
 * @param {object} [context]
 * @param {boolean} [cached]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#match-a-complex-selector-against-an-element}
 */
function matchComplexSelector(element, [head, tail], context, cached) {
    function matchLeft(right, index) {
        if (index === -1) {
            return cached || matchCompoundSelector(right, head, context)
        }
        const { [index]: [combinator, compound] } = tail
        if (cached || matchCompoundSelector(right, compound, context)) {
            if (right === element) {
                addSelectorToElementCache(head, element, context)
                cached = false
            }
            for (const left of leftCombined(right, combinator)) {
                if (matchLeft(left, index - 1)) {
                    return true
                }
            }
        }
        return false
    }
    return matchLeft(element, tail.length - 1)
}

/**
 * @param {ElementImpl} element
 * @param {*[]} selectors
 * @param {object} [context]
 * @param {boolean} [all]
 * @param {boolean} [cached]
 * @returns {*[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#match-a-selector-against-an-element}
 */
function matchElementAgainstSelectors(element, selectors, context, all, cached) {
    context = createContext(element, context)
    if (all) {
        const results = context.selectorCache?.get(element)
        return selectors.filter(selector => results?.get(selector) ?? matchComplexSelector(element, selector, context, cached))
    }
    const results = new Map
    context.selectorCache?.set(element, results)
    const match = selectors.find(selector => {
        const result = matchComplexSelector(element, selector, context, cached)
        results.set(selector, result)
        return result
    })
    return match ?? null
}

/**
 * @param {CSSPseudoElementImpl} pseudo
 * @param {*[]} selectors
 * @param {object} [context]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#match-a-selector-against-a-pseudo-element}
 */
function matchPseudoElementAgainstSelectors(pseudo, selectors, context) { }

/**
 * @param {*[]} trees
 * @param {*[]} selectors
 * @param {object} [context]
 * @param {object} [options]
 * @returns {ElementImpl|ElementImpl[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#match-a-selector-against-a-tree}
 */
function matchTreesAgainstSelectors(trees, selectors, context, { first, includeSubtrees, pseudos = [] } = {}) {

    context = createContext(trees[0], context)

    const selected = new Set
    const { anchors, elementCache, root, scopes } = context

    if (scopes) {
        trees = scopes.roots
    }

    if (!anchors && !scopes && 0 < elementCache.size) {
        selectors = selectors.filter(selector => {
            const [head, tail] = selector
            const key = serializeComponentValue(tail.at(-1)?.[1] ?? head)
            if (!elementCache.has(key)) {
                return true
            }
            elementCache.get(key).forEach(element => {
                if (matchElementAgainstSelectors(element, [selector], context, false, true)) {
                    selected.add(element)
                }
            })
        })
    }

    const options = {
        includeSubtrees,
        inclusive: scopes ? scopes.inclusive : root && isShadowRoot(root),
        limits: scopes?.limits,
    }

    for (const tree of trees) {
        for (const element of traverse(tree, options)) {
            if (matchElementAgainstSelectors(element, selectors, context)) {
                if (first) {
                    return element
                }
                selected.add(element)
                continue
            }
            for (const type of pseudos) {
                const pseudo = element.pseudo(type)
                if (pseudo && matchPseudoElementAgainstSelectors(pseudo, selectors, context)) {
                    if (first) {
                        return pseudo
                    }
                    selected.add(pseudo)
                }
            }
        }
    }

    if (first) {
        return null
    }
    return Array.from(selected)
}

export {
    matchElementAgainstSelectors,
    matchTreesAgainstSelectors,
}
