/**
 *
 * @param {any[]} classes
 * @returns
 */
export function createClassesFromArray(classes) {
    return classes.filter(Boolean).join(' ');
}
