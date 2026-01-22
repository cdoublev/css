
import * as environment from './utils/environment.js'

export const ACCESS_THIRD_PARTY_STYLESHEET_ERROR = {
    message: 'Cannot access cross-origin style sheet',
    name: 'SecurityError',
}
export const DELETE_UNEXISTENT_MEDIUM_ERROR = {
    message: 'Cannot delete a medium that is not in the media list',
    name: 'NotFoundError',
}
export const EXTRA_RULE_ERROR = {
    message: 'Cannot parse more than a single rule',
}
export const INSERT_INVALID_IMPORT_ERROR = {
    message: 'Cannot insert @import in a constructed style sheet',
    name: 'SyntaxError',
}
export const INVALID_CUSTOM_PROPERTY_NAME = {
    message: 'Invalid name',
    name: 'SyntaxError',
}
export const INVALID_CUSTOM_PROPERTY_OVERRIDE = {
    message: 'Cannot override an existing custom property definition',
    name: 'InvalidModificationError',
}
export const INVALID_CUSTOM_PROPERTY_SYNTAX = {
    message: 'Invalid syntax',
    name: 'SyntaxError',
}
export const INVALID_DECLARATION_ERROR = {
    message: 'Cannot parse invalid declaration',
}
export const INVALID_DECLARATION_VALUE_ERROR = {
    message: 'Cannot parse invalid declaration value',
}
export const INVALID_FONT_FEATURE_VALUE_ERROR = {
    message: 'Cannot set the feature value (invalid value)',
    name: 'InvalidAccessError',
}
export const INVALID_INITIAL_CUSTOM_PROPERTY_VALUE = {
    message: 'Invalid initial value',
    name: 'SyntaxError',
}
export const INVALID_INITIAL_CUSTOM_PROPERTY_VALUE_UNIVERSAL = {
    message: 'Invalid initial value',
    name: 'SyntaxError',
}
export const MISSING_INITIAL_CUSTOM_PROPERTY_VALUE = {
    message: 'Invalid initial value',
    name: 'SyntaxError',
}
export const INVALID_NAMESPACE_STATE_ERROR = {
    message: 'Cannot insert @namespace when any other rule than @import or @namespace already exists',
    name: 'InvalidStateError',
}
export const INVALID_RULE_ERROR = {
    message: 'Cannot parse invalid rule',
}
export const INVALID_RULE_INDEX_ERROR = {
    message: 'Cannot insert rule at the specified index (negative, or greater than the next index in the list of rules)',
    name: 'IndexSizeError',
}
export const INVALID_RULE_POSITION_ERROR = {
    message: 'Cannot insert rule at the specified index (invalid rules hierarchy)',
    name: 'HierarchyRequestError',
}
export const MISSING_RULE_ERROR = {
    message: 'Cannot parse missing rule',
}
export const SET_INVALID_KEYFRAME_SELECTOR_ERROR = {
    message: "Cannot set 'keyText': invalid value",
    name: 'SyntaxError',
}
export const SET_INVALID_KEYFRAMES_NAME_ERROR = {
    message: "Cannot set 'name': invalid value",
    name: 'SyntaxError',
}
export const UPDATE_COMPUTED_STYLE_DECLARATION_ERROR = {
    message: 'Cannot change a read-only computed style declaration',
    name: 'NoModificationAllowedError',
}
export const UPDATE_LOCKED_STYLESHEET_ERROR = {
    message: 'Cannot insert or replace rules (pending replacement or non-constructed style sheet)',
    name: 'NotAllowedError',
}

/**
 * @param {object} description
 * @returns {DOMException|Error}
 */
export function create({ message, name, type: Type = 'SyntaxError' }) {
    if (name) {
        return new DOMException(message, name)
    }
    if (environment.test) {
        console.error(`${Type}: ${message}`)
    }
    return new Type(message)
}
