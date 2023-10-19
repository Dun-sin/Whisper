import { flattenDeep, uniq } from 'lodash';

/**
 *
 * @param {any[]} classes
 * @returns
 */
export function createClassesFromArray(...classes) {
	return uniq(flattenDeep(classes)).filter(Boolean).join(' ');
}

/**
 * Checks if the socket was explicitly disconnected or due to connection issues
 * @param {string} reason Reason for socket disconnection
 */
export function isExplicitDisconnection(reason) {
	const explicitReasons = ['io server disconnect', 'io client disconnect'];

	return explicitReasons.includes(reason);
}
