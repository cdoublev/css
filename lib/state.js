
export const states = new WeakMap

/**
 * @param {Window} globalObject
 * @param {object} name
 * @returns {number}
 */
export function getRandomBaseValue(globalObject, { element, identifier, scope }) {
    const { randomCacheNames } = states.get(globalObject)
    const name = randomCacheNames.find(name =>
        (name.element === element || !element)
        && name.identifier === identifier
        && name.scope === scope)
    if (name) {
        return name.base
    }
    const base = Math.random()
    randomCacheNames.push({ base, element, identifier, scope })
    return base
}
