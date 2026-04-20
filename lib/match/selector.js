
import { findAncestor, getParent } from '../utils/dom.js'
import { isDelimiter, isOmitted } from '../utils/value.js'
import { serializeComponentValue, serializeIdentifier } from '../serialize.js'
import { toLowerCase } from '../utils/string.js'

const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'

const DOCUMENT_NODE_TYPE = 9
const DOCUMENT_FRAGMENT_NODE_TYPE = 11
const TEXT_NODE_TYPE = 3

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
 * @param {string} modifier
 * @returns {boolean}
 */
function isCaseInsensitiveAttribute({ localName, ownerElement }, modifier) {
    switch (modifier) {
        case 'i':
            return true
        case '':
            return caseInsensitiveAttributes.includes(localName)
                && isHTMLDocument(ownerElement.ownerDocument)
        default:
            return false
    }
}

/**
 * @param {DocumentImpl} document
 * @returns {boolean}
 * @see {@link https://dom.spec.whatwg.org/#html-document}
 */
function isHTMLDocument(document) {
    return document.contentType === 'text/html'
}

// Element utilities

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
    if (n === -1) {
        return false
    }
    return isAnBTh(a, n + 1, b)
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
    return element === element.form?.elements.find(isSubmitButton)
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
            if (isOfType(firstElementChild, 'legend')) {
                return !findAncestor(element, parent => parent === firstElementChild, parent => parent === fieldSet)
            }
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
        if (nodeType !== TEXT_NODE_TYPE || 0 < data.length) {
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
    return element === context.tree.host
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
        && matchCompoundSelector(element, selector, { ...context, tree: element.getRootNode({}) })
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
        context = { ...context, tree: element.getRootNode({}) }
        return findAncestor(element, element => matchCompoundSelector(element, selector, context))
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
            const group = form.elements.filter(control => control.type === 'radio' && name === control.name)
            return 1 < group.length && group.every(control => !control.checked)
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
        return element.elements.some(element => isCandidateForConstraintValidation(element) && isInvalid(element))
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
 * @param  {...string} types
 * @returns {boolean}
 */
function isOfType({ namespaceURI, localName }, ...types) {
    return namespaceURI && types.includes(localName)
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
    if (isOfType(element, 'input')) {
        const attributes = inputTypeAttributes[element.type]
        return attributes.includes('min') || attributes.includes('max')
    }
    return false
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
    return element === context.tree.documentElement
}

/**
 * @param {ElementImpl} element
 * @param {object} context
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#scope-pseudo}
 */
function isScopingRoot(element, { scopes, tree }) {
    return scopes?.roots.find(root => root === element || root.documentElement === element)
        ?? element === (tree.host ?? tree.documentElement)
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
    return element.hasAttribute('id') && element.getAttribute('id') === element.ownerDocument.location.hash.slice(1)
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
        return element.elements.every(element => !isCandidateForConstraintValidation(element) || isValid(element))
    }
    return isCandidateForConstraintValidation(element) && element.validity.valid
}

/**
 * @param {ElementImpl} element
 * @yields {ElementImpl}
 */
function* ancestors({ parentElement }) {
    while (parentElement) {
        yield parentElement
        if (parentElement.shadowRoot) {
            return
        }
        parentElement = getParent(parentElement)
    }
}

/**
 * @param {ElementImpl} element
 * @yields {ElementImpl}
 */
function* children({ children }) {
    for (let index = 0; index < children.length; index++) {
        yield children.item(index)
    }
}

/**
 * @param {ElementImpl} element
 * @param {object} combinator
 * @yields {ElementImpl}
 */
function* leftCombined(element, combinator) {
    switch (serializeComponentValue(combinator)) {
        case '>':
            return yield getParent(element)
        case '+':
            if (element.previousElementSibling) {
                yield element.previousElementSibling
            }
            return
        case '~':
            return yield* previousSiblings(element)
        case '||':
            return
        default:
            return yield* ancestors(element)
    }
}

/**
 * @param {ElementImpl} element
 * @yields {ElementImpl}
 */
function* nextSiblings({ nextElementSibling }) {
    while (nextElementSibling) {
        yield nextElementSibling
        nextElementSibling = nextElementSibling.nextElementSibling
    }
}

/**
 * @param {ElementImpl} element
 * @yields {ElementImpl}
 */
function* previousSiblings({ previousElementSibling }) {
    while (previousElementSibling) {
        yield previousElementSibling
        previousElementSibling = previousElementSibling.previousElementSibling
    }
}

/**
 * @param {ElementImpl} element
 * @param {object} combinator
 * @yields {ElementImpl}
 */
function* rightCombined(element, combinator) {
    switch (serializeComponentValue(combinator)) {
        case '>':
            return yield* children(element)
        case '+':
            if (element.nextElementSibling) {
                yield element.nextElementSibling
            }
            return
        case '~':
            return yield* nextSiblings(element)
        case '||':
            return
        default:
            return yield* traverse(element)
    }
}

/**
 * @param {ElementImpl} element
 * @param {function} predicate
 * @returns {number}
 */
function findFirstSiblingIndex(element, predicate) {
    const parent = getParent(element)
    if (!parent) {
        return predicate(element) ? 0 : -1
    }
    const { children } = parent
    const end = children.length
    let index = -1
    for (let start = 0; start < end; start++) {
        const child = children.item(start)
        if (predicate(child)) {
            index++
            if (child === element) {
                return index
            }
        }
    }
    return -1
}

/**
 * @param {ElementImpl} element
 * @param {function} predicate
 * @returns {number}
 */
function findLastSiblingIndex(element, predicate) {
    const parent = getParent(element)
    if (!parent) {
        return predicate(element) ? 0 : -1
    }
    const { children } = parent
    const end = -1
    let index = -1
    for (let start = children.length - 1; end < start; start--) {
        const child = children.item(start)
        if (predicate(child)) {
            index++
            if (child === element) {
                return index
            }
        }
    }
    return -1
}

/**
 * @param {ElementImpl} element
 * @param {function} predicate
 * @returns {ElementImpl|undefined}
 */
function findNextSibling({ nextElementSibling }, predicate) {
    while (nextElementSibling) {
        if (predicate(nextElementSibling)) {
            return nextElementSibling
        }
        nextElementSibling = nextElementSibling.nextElementSibling
    }
}

/**
 * @param {ElementImpl} element
 * @param {function} predicate
 * @returns {ElementImpl|undefined}
 */
function findPreviousSibling({ previousElementSibling }, predicate) {
    while (previousElementSibling) {
        if (predicate(previousElementSibling)) {
            return previousElementSibling
        }
        previousElementSibling = previousElementSibling.previousElementSibling
    }
}

/**
 * @param {DocumentImpl|ShadowRootImpl|ElementImpl} tree
 * @param {object} [context]
 * @param {boolean} [inclusive]
 * @yields {ElementImpl}
 */
function* traverse(tree, context = {}, inclusive = context.scopes?.inclusive) {
    const { includeSubtrees, scopes } = context
    if (scopes?.limits?.includes(tree)) {
        return
    }
    if (inclusive) {
        yield tree
    } else if (tree.nodeType === DOCUMENT_NODE_TYPE) {
        tree = tree.documentElement
        yield tree
    } else if (tree.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE) {
        yield tree.host
    }
    const { children, shadowRoot } = tree
    for (let index = 0; index < children.length; index++) {
        yield* traverse(children.item(index), context, true)
    }
    if (shadowRoot && includeSubtrees) {
        const { children } = shadowRoot
        for (let index = 0; index < children.length; index++) {
            yield* traverse(children.item(index), {}, true)
        }
    }
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
            return isMatching(element, value, context, /* ignoreSpecifity = */ true)
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
function matchAttributeNameSelector(element, selector, { namespaces = new Map }) {
    let [prefix, name] = selector.map(serializeComponentValue)
    prefix = prefix.slice(0, -1)
    if (element.namespaceURI === HTML_NAMESPACE && isHTMLDocument(element.ownerDocument)) {
        name = toLowerCase(name)
    }
    if (prefix === '*') {
        for (const attribute of element.attributes) {
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
    const [, matcher, expression, modifier] = selector.map(serializeComponentValue)
    let expected = expression
    let { value } = attribute
    if (selector[2].types[0] === '<string-token>') {
        expected = expected.slice(1, -1)
    }
    if (isCaseInsensitiveAttribute(attribute, modifier)) {
        expected = toLowerCase(expected)
        value = toLowerCase(value)
    }
    switch (matcher) {
        case '*=':
            return expected && value.includes(expected)
        case '^=':
            return expected && value.startsWith(expected)
        case '=':
            return expected === value
        case '|=':
            return expected === value || value.startsWith(`${expected.split('-')[0]}-`)
        case '~=':
            return expected && value.split(' ').some(word => word === expected)
        case '$=':
            return expected && value.endsWith(expected)
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
            return serializeComponentValue(subclass) === `#${element.getAttribute('id')}`
        }
        if (subclass.types.includes('<class-selector>')) {
            return element.classList.contains(serializeComponentValue(subclass).slice(1))
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
function matchTypeNameSelector({ localName, namespaceURI, ownerDocument }, selector) {
    selector = serializeComponentValue(selector)
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
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#match-a-selector-against-an-element}
 */
function matchElementAgainstSelectors(element, selectors, context, all, cached) {
    if (all) {
        const results = context?.selectorCache.get(element)
        return selectors.filter(selector => results?.get(selector) ?? matchComplexSelector(element, selector, context, cached))
    }
    const results = new Map
    context.selectorCache?.set(element, results)
    return selectors.some(selector => {
        const result = matchComplexSelector(element, selector, context, cached)
        results.set(selector, result)
        return result
    })
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
 * @param {ElementImpl[]} trees
 * @param {*[]} selectors
 * @param {object} [context]
 * @param {boolean} [first]
 * @returns {ElementImpl|ElementImpl[]}
 * @see {@link https://drafts.csswg.org/selectors-4/#match-a-selector-against-a-tree}
 */
function matchTreesAgainstSelectors(trees, selectors, context = {}, first) {

    // Assert: all trees share the same root

    const selected = new Set
    const { anchors, elementCache = new Map, scopes, pseudos } = context

    context = { ...context, elementCache, tree: trees[0].getRootNode({}) }

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

    trees.forEach(tree => {
        for (const element of traverse(tree, context)) {
            if (matchElementAgainstSelectors(element, selectors, context)) {
                if (first) {
                    return selected
                }
                selected.add(element)
            }
            pseudos?.forEach(type => {
                const pseudo = element.pseudo(type)
                if (pseudo && matchPseudoElementAgainstSelectors(pseudo, selectors, context)) {
                    selected.add(pseudo)
                }
            })
        }
    })

    return Array.from(selected)
}

export {
    matchElementAgainstSelectors,
    matchTreesAgainstSelectors,
}
