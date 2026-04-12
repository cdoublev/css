
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
 * @param {Attr} attribute
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
 * @param {Document} document
 * @returns {boolean}
 * @see {@link https://dom.spec.whatwg.org/#html-document}
 */
function isHTMLDocument(document) {
    return document.contentType === 'text/html'
}

// Element utilities

/**
 * @param {Element} meter
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
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-view-transitions-2/#active-view-transition-pseudo}
 */
function hasActiveViewTransition(element) {
    return isRoot(element) && element.ownerDocument.activeViewTransition
}

/**
 * @param {Element} element
 * @param {object[]} types
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-view-transitions-2/#active-view-transition-type-pseudo}
 */
function hasActiveViewTransitionType(element, types) {
    const transition = hasActiveViewTransition(element)
    return transition && types.some(type => transition.types.includes(serializeIdentifier(type)))
}

/**
 * @param {Element} element
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
 * @param {Element} element
 * @param {*[]} selectors
 * @param {object} options
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#has-pseudo}
 */
function hasRelativeMatching(element, selectors, options) {
    return selectors.some(([combinator, [head, tail]]) => {
        function matchRight(left, combinator, compound, index = 0) {
            for (const right of rightCombined(left, combinator)) {
                if (
                    matchCompoundSelector(right, compound, options)
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
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-shadow-1/#selectordef-has-slotted}
 */
function hasSlotted(element) {
    return isOfType(element, 'slot') && 0 < element.assignedNodes({ flatten: true }).length
}

/**
 * @param {Element} a
 * @param {Element} b
 * @returns {boolean}
 */
function haveSameType(a, b) {
    return a.localName === b.localName && a.namespaceURI === b.namespaceURI
}

/**
 * @param {Element} element
 * @param {object[]} anb
 * @param {object|*[]} selector
 * @param {object} [options]
 * @param {boolean} [reverse]
 * @returns {boolean}
 */
function isAnBOfSelector(element, { value: { a, b } }, selector, options, reverse) {
    const predicate = isOmitted(selector) ? sibling => sibling : sibling => matchElementAgainstSelectors(sibling, selector[1], options)
    const n = reverse ? findLastSiblingIndex(element, predicate) : findFirstSiblingIndex(element, predicate)
    if (n === -1) {
        return false
    }
    return isAnBTh(a, n + 1, b)
}

/**
 * @param {Element} element
 * @param {object[]} anb
 * @param {object} [options]
 * @param {boolean} [reverse]
 * @returns {boolean}
 */
function isAnBOfType(element, { value: { a, b } }, reverse) {
    const predicate = sibling => haveSameType(sibling, element)
    const n = reverse ? findLastSiblingIndex(element, predicate) : findFirstSiblingIndex(element, predicate)
    return isAnBTh(a, n + 1, b)
}

/**
 * @param {Element} element
 * @param {object} options
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#selectordef-}
 */
function isAnchor(element, options) {
    return options.anchors?.includes(element) ?? isScopingRoot(element, options)
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#any-link-pseudo}
 */
function isAnyLink(element) {
    return isOfType(element, ...links) && element.getAttributeNode('href')
}

/**
 * @param {Element} element
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
 * @param {Element} element
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
 * @param {Element} element
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
        && !(isOfType(element, 'input', 'textarea') && element.readOnly)
        && isEnabled(element)
        && !findAncestor(element, element => isOfType(element, 'datalist'))
}

/**
 * @param {Element} element
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
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#default-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-default}
 */
function isDefault(element) {
    if (isOfType(element, 'input') && inputTypeAttributes[element.type].includes('checked')) {
        return element.defaultChecked
    }
    if (isOfType(element, 'option')) {
        return element.defaultSelected
    }
    return element === element.form?.elements.find(isSubmitButton)
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#disabled-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-disabled}
 */
function isDisabled(element) {
    if (isOfType(element, 'optgroup')) {
        return element.disabled
    }
    if (isOfType(element, 'option')) {
        if (element.disabled) {
            return true
        }
        const group = findAncestor(
            element,
            element => isOfType(element, 'optgroup'),
            element => isOfType(element, 'datalist', 'hr', 'option', 'select'))
        return group?.disabled ?? false
    }
    if (isOfType(element, 'button', 'fieldset', 'input', 'select', 'textarea')) {
        if (element.disabled) {
            return true
        }
        const fieldSet = findAncestor(element, element => isOfType(element, 'fieldset') && element.disabled)
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
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#empty-pseudo}
 */
function isEmpty(element) {
    return element.childNodes.every(({ data, nodeType }) => nodeType === TEXT_NODE_TYPE && data.length === 0)
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#enabled-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-enabled}
 */
function isEnabled(element) {
    return isOfType(element, 'button', 'fieldset', 'input', 'optgroup', 'option', 'select', 'textarea')
        && !isDisabled(element)
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#first-child-pseudo}
 */
function isFirstChild(element) {
    return !element.previousElementSibling
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#first-of-type-pseudo}
 */
function isFirstOfType(element) {
    return !findPreviousSibling(element, sibling => haveSameType(element, sibling))
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-fullscreen}
 * @see {@link https://fullscreen.spec.whatwg.org/#:fullscreen-pseudo-class}
 */
function isFullscreen(element) {
    return element === element.getRootNode().fullscreenElement
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-5/#heading-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-heading}
 */
function isHeading(element) {
    return isOfType(element, 'h1', 'h2', 'h3', 'h4', 'h5', 'h6')
}

/**
 * @param {Element} element
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
 * @param {Element} element
 * @param {object} options
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-shadow-1/#selectordef-host}
 */
function isHost(element, options) {
    return element === options.tree.getRootNode().host
}

/**
 * @param {Element} element
 * @param {object[]} selector
 * @param {object} options
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-shadow-1/#selectordef-host-function}
 */
function isHostMatching(element, selector, options) {
    return isHost(element, options)
        && matchCompoundSelector(element, selector, { ...options, tree: element.getRootNode() })
}

/**
 * @param {Element} element
 * @param {object[]} selector
 * @param {object} options
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-shadow-1/#selectordef-host-context}
 */
function isHostContextMatching(element, selector, options) {
    if (!isHost(element, options)) {
        return false
    }
    options = { ...options, tree: element.getRootNode() }
    return findAncestor(element, element => matchCompoundSelector(element, selector, options))
}

/**
 * @param {Element} element
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
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#indeterminate-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-indeterminate}
 */
function isIndeterminate(element) {
    if (isOfType(element, 'progress')) {
        return !element.getAttributeNode('value')
    }
    if (isOfType(element, 'input')) {
        const { form, indeterminate, name, type } = element
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
 * @param {Element} element
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
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#last-child-pseudo}
 */
function isLastChild(element) {
    return !element.nextElementSibling
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#last-of-type-pseudo}
 */
function isLastOfType(element) {
    return !findNextSibling(element, sibling => haveSameType(element, sibling))
}

/**
 * @param {Element} element
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
 * @param {Element} element
 * @param {*[]} selectors
 * @param {object} options
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#matches-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#where-pseudo}
 */
function isMatching(element, selectors, options) {
    selectors = selectors.filter(selector => 0 < selector.types.length)
    return matchElementAgainstSelectors(element, selectors, options)
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-modal}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-modal}
 */
function isModal(element) {
    return (isOfType(element, 'dialog') && element.open && !element.getAttributeNode('open'))
        || isFullscreen(element)
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-muted}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-muted}
 */
function isMuted(element) {
    return isOfType(element, ...medias) && element.muted
}

/**
 * @param {Element} element
 * @param  {...string} types
 * @returns {boolean}
 */
function isOfType({ namespaceURI, localName }, ...types) {
    return namespaceURI && types.includes(localName)
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#only-child-pseudo}
 */
function isOnlyChild(element) {
    return isFirstChild(element) && isLastChild(element)
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#only-of-type-pseudo}
 */
function isOnlyOfType(element) {
    return isFirstOfType(element) && isLastOfType(element)
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-open}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-open}
 */
function isOpen(element) {
    return element.open && isOfType(element, 'details', 'dialog')
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#optional-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-optional}
 */
function isOptional(element) {
    if (isOfType(element, 'input')) {
        return !element.required && inputTypeAttributes[element.type].includes('required')
    }
    if (isOfType(element, 'select', 'textarea')) {
        return !element.required
    }
    return false
}

/**
 * @param {Element} element
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
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-paused}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-paused}
 */
function isPaused(element) {
    return isOfType(element, ...medias) && element.paused
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-picture-in-picture}
 * @see {@link https://w3c.github.io/picture-in-picture/#css-pseudo-class}
 */
function isPictureInPicture(element) {
    return element === element.getRootNode().pictureInPictureElement
}

/**
 * @param {Element} element
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
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-playing}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-playing}
 */
function isPlaying(element) {
    return isOfType(element, ...medias) && !element.paused
}

/**
 * @param {Element} element
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
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#read-only-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-read-only}
 */
function isReadOnly(element) {
    return !isReadWrite(element) && element.namespaceURI === HTML_NAMESPACE
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#read-write-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-read-write}
 */
function isReadWrite(element) {
    if (isOfType(element, 'input')) {
        return !element.readOnly
            && isEnabled(element)
            && inputTypeAttributes[element.type].includes('readonly')
    }
    if (isOfType(element, 'textarea')) {
        return !element.readOnly
            && isEnabled(element)
    }
    return element.isContentEditable
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#required-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-required}
 */
function isRequired(element) {
    if (isOfType(element, 'input')) {
        return element.required
            && inputTypeAttributes[element.type].includes('required')
    }
    if (isOfType(element, 'select', 'textarea')) {
        return element.required
    }
    return false
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#root-pseudo}
 */
function isRoot(element) {
    return element === element.ownerDocument.documentElement
}

/**
 * @param {Element} element
 * @param {object} options
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#scope-pseudo}
 */
function isScopingRoot(element, options) {
    const { scope, tree } = options
    switch (scope) {
        case undefined: {
            const { documentElement, host } = tree.getRootNode()
            return element === (host ?? documentElement)
        }
        case element.ownerDocument:
            return element === element.ownerDocument.documentElement
        default:
            return scope === element
    }
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-seeking}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-seeking}
 */
function isSeeking(element) {
    return isOfType(element, ...medias) && element.seeking
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://html.spec.whatwg.org/multipage/forms.html#concept-submit-button}
 */
function isSubmitButton(element) {
    return (isOfType(element, 'button') && element.type === 'submit')
        || (isOfType(element, 'input') && (element.type === 'image' || element.type === 'submit'))
}

/**
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#target-pseudo}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics-other.html#selector-target}
 */
function isTarget({ id, ownerDocument }) {
    return id && `#${id}` === ownerDocument.location.hash
}

/**
 * @param {Element} element
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
 * @param {Element} element
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
 * @param {Element} element
 * @yields {Element}
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
 * @param {Element} element
 * @param {object} combinator
 * @yields {Element}
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
 * @param {Element} element
 * @yields {Element}
 */
function* nextSiblings({ nextElementSibling }) {
    while (nextElementSibling) {
        yield nextElementSibling
        nextElementSibling = nextElementSibling.nextElementSibling
    }
}

/**
 * @param {Element} element
 * @yields {Element}
 */
function* previousSiblings({ previousElementSibling }) {
    while (previousElementSibling) {
        yield previousElementSibling
        previousElementSibling = previousElementSibling.previousElementSibling
    }
}

/**
 * @param {Element} element
 * @param {object} combinator
 * @yields {Element}
 */
function* rightCombined(element, combinator) {
    switch (serializeComponentValue(combinator)) {
        case '>':
            return yield* element.children
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
 * @param {Element} element
 * @param {function} predicate
 * @returns {number}
 */
function findFirstSiblingIndex(element, predicate) {
    const children = getParent(element)?.children ?? [element]
    const end = children.length
    let index = -1
    for (let start = 0; start < end; start++) {
        const child = children[start]
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
 * @param {Element} element
 * @param {function} predicate
 * @returns {number}
 */
function findLastSiblingIndex(element, predicate) {
    const children = getParent(element)?.children ?? [element]
    const end = -1
    let index = -1
    for (let start = children.length - 1; end < start; start--) {
        const child = children[start]
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
 * @param {Element} element
 * @param {function} predicate
 * @returns {Element|undefined}
 */
function findNextSibling({ nextElementSibling }, predicate) {
    while (nextElementSibling) {
        if (predicate(nextElementSibling)) {
            return nextElementSibling
        }
        ({ nextElementSibling } = nextElementSibling)
    }
}

/**
 * @param {Element} element
 * @param {function} predicate
 * @returns {Element|undefined}
 */
function findPreviousSibling({ previousElementSibling }, predicate) {
    while (previousElementSibling) {
        if (predicate(previousElementSibling)) {
            return previousElementSibling
        }
        ({ previousElementSibling } = previousElementSibling)
    }
}

/**
 * @param {Document|ShadowRoot|Element} tree
 * @param {object} [options]
 * @param {boolean} [inclusive]
 * @yields {Element}
 */
function* traverse(tree, options = {}, inclusive = options.scopes?.inclusive) {
    const { scopes, excludeSubtrees } = options
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
    for (const element of children) {
        yield* traverse(element, options, true)
    }
    if (shadowRoot && !excludeSubtrees) {
        for (const element of shadowRoot.children) {
            yield* traverse(element, {}, true)
        }
    }
}


// Match against selectors

/**
 * @param {Element} element
 * @param {object} selector
 * @param {object} [options]
 * @returns {boolean}
 */
function matchPseudoClassSelector(element, { name, value }, options) {
    switch (name) {
        case undefined:
            break
        case 'active-view-transition-type':
            return hasActiveViewTransitionType(element, value)
        case 'has':
            return hasRelativeMatching(element, value, options)
        case 'host':
            return isHostMatching(element, value, options)
        case 'host-context':
            return isHostContextMatching(element, value, options)
        case 'heading':
            return isHeadingLevel(element, value)
        case 'is':
            return isMatching(element, value, options)
        case 'local-link':
            return isLocalLink(element, value)
        case 'not':
            return !isMatching(element, value, options)
        case 'nth-child':
            return isAnBOfSelector(element, ...value, options)
        case 'nth-last-child':
            return isAnBOfSelector(element, ...value, options, true)
        case 'nth-last-of-type':
            return isAnBOfType(element, value, true)
        case 'nth-of-type':
            return isAnBOfType(element, value)
        case 'where':
            return isMatching(element, value, options)
        default:
            return false
    }
    switch (value) {
        case 'active-view-transition':
            return hasActiveViewTransition(element)
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
            return isHost(element, options)
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
            return isRoot(element)
        case 'scope':
            return isScopingRoot(element, options)
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
 * @param {Element} element
 * @param {*[]} selector <pseudo-compound-selector>*
 * @param {object} [options]
 * @returns {boolean}
 */
function matchPseudoCompoundSelectors(element, pseudos, options) {
    return true
}

/**
 * @param {Element} element
 * @param {*[]} selector
 * @param {object} {options}
 * @returns {Attr|null}
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
 * @param {Element} element
 * @param {*[]} selector
 * @param {object} {options}
 * @returns {boolean}
 */
function matchAttributeSelector(element, { value: selector }, options) {
    if (selector.types.at(-1) === '<wq-name>') {
        return matchAttributeNameSelector(element, selector, options)
    }
    const attribute = matchAttributeNameSelector(element, selector[0], options)
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
 * @param {Element} element
 * @param {*[]} selector
 * @param {object} {options}
 * @returns {boolean}
 */
function matchSubclassSelector(element, selector, options) {
    return selector.every(subclass => {
        if (isDelimiter('&', subclass)) {
            return isAnchor(element, options)
        }
        if (subclass.types.includes('<id-selector>')) {
            return serializeComponentValue(subclass) === `#${element.id}`
        }
        if (subclass.types.includes('<class-selector>')) {
            return element.classList.contains(serializeComponentValue(subclass).slice(1))
        }
        if (subclass.types.includes('<attribute-selector>')) {
            return matchAttributeSelector(element, subclass, options)
        }
        return matchPseudoClassSelector(element, subclass[1], options)
    })
}

/**
 * @param {Element} element
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
 * @param {Element} element
 * @param {object|object[]} selector
 * @param {object} [options]
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
 * @param {Element} element
 * @param {object|*[]} selector
 * @param {object} {options}
 * @returns {boolean}
 */
function matchTypeSelector(element, selector, options) {
    if (isOmitted(selector)) {
        return true
    }
    if (isDelimiter('&', selector)) {
        return isAnchor(element, options)
    }
    // :host is featureless in the context of a shadow tree
    if (isHost(element, options)) {
        return false
    }
    const [prefix, type] = selector
    return matchTypeNamespacePrefixSelector(element, prefix, options)
        && matchTypeNameSelector(element, type)
}

/**
 * @param {Element} element
 * @param {*[]} selector
 * @param {object} [options]
 * @returns {boolean}
 */
function matchCompoundSelector(element, selector, options) {
    if (selector.types.includes('<complex-selector-unit>')) {
        const [compound, pseudos] = selector
        return (isOmitted(compound) || matchCompoundSelector(element, compound, options))
            && matchPseudoCompoundSelectors(element, pseudos, options)
    }
    const [type, subclasses] = selector
    return matchTypeSelector(element, type, options)
        && matchSubclassSelector(element, subclasses, options)
}

/**
 * @param {Element} element
 * @param {*[]} selector
 * @param {object} [options]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#match-a-complex-selector-against-an-element}
 */
function matchComplexSelector(element, [head, tail], options) {
    function matchLeft(right, index) {
        if (index === -1) {
            return matchCompoundSelector(right, head, options)
        }
        const { [index]: [combinator, compound] } = tail
        if (matchCompoundSelector(right, compound, options)) {
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
 * @param {Element} element
 * @param {*[]} selector
 * @param {object} [options]
 * @param {boolean} [all]
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#match-a-selector-against-an-element}
 */
function matchElementAgainstSelectors(element, selector, options, all) {
    if (all) {
        return selector.filter(selector => matchComplexSelector(element, selector, options))
    }
    return selector.some(selector => matchComplexSelector(element, selector, options))
}

/**
 * @param {CSSPseudoElement} pseudo
 * @param {object} selector
 * @param {object} [options]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/selectors-4/#match-a-selector-against-a-pseudo-element}
 */
function matchPseudoElementAgainstSelectors(pseudo, selector, options) { }

/**
 * @param {Element[]} trees
 * @param {*[]} selector
 * @param {object} [options]
 * @param {boolean} [first]
 * @returns {Element|Element[]}
 * @see {@link https://drafts.csswg.org/selectors-4/#match-a-selector-against-a-tree}
 */
function matchTreesAgainstSelectors(trees, selector, options = {}, first) {

    // Assert: all trees share the same root

    const { scopes: { roots } = {}, pseudos } = options

    if (roots) {
        trees = roots.filter(root => trees.some(tree => tree.contains(root)))
    }

    const selected = []

    trees.forEach(tree => {
        options = roots ? { ...options, scope: tree, tree } : { ...options, tree }
        for (const element of traverse(tree, options)) {
            if (matchElementAgainstSelectors(element, selector, options)) {
                if (first) {
                    return selected
                }
                selected.push(element)
            }
            pseudos?.forEach(type => {
                const pseudo = element.pseudo(type)
                if (pseudo && matchPseudoElementAgainstSelectors(pseudo, selector, options)) {
                    selected.push(pseudo)
                }
            })
        }
    })

    return selected
}

export {
    matchElementAgainstSelectors,
    matchTreesAgainstSelectors,
}
