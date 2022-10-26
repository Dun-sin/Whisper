import { flattenDeep, uniq } from 'lodash';

/**
 *
 * @param {any[]} classes
 * @returns
 */
export function createClassesFromArray(...classes) {
    return uniq(flattenDeep(classes)).filter(Boolean).join(' ');
}
