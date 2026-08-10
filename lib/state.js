
export const customProperties = new WeakMap
export const randomCacheNames = new WeakMap

/**
 * @param {Window} globalObject
 */
export function create(globalObject) {
    customProperties.set(globalObject, new Map)
    randomCacheNames.set(globalObject, [])
}

/**
 * @param {Window} globalObject
 * @param {object} name
 * @returns {number}
 */
export function getRandomBaseValue(globalObject, { element, identifier, scope }) {
    const names = randomCacheNames.get(globalObject)
    const name = names.find(name =>
        (name.element === element || !element)
        && name.identifier === identifier
        && name.scope === scope)
    if (name) {
        return name.base
    }
    const base = Math.random()
    names.push({ base, element, identifier, scope })
    return base
}
