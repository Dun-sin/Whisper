import { CloneStateType } from '@/types/types';
import { flattenDeep, uniq } from 'lodash';

/**
 *
 * @param {any[]} classes
 * @returns
 */
export function createClassesFromArray(...classes: string[]) {
  return uniq(flattenDeep(classes)).filter(Boolean).join(' ');
}

/**
 * Checks if the socket was explicitly disconnected or due to connection issues
 * @param {string} reason Reason for socket disconnection
 */
export function isExplicitDisconnection(reason: string) {
  const explicitReasons = ['io server disconnect', 'io client disconnect'];

  return explicitReasons.includes(reason);
}

export function cloneState<T>(state: T): CloneStateType<T> {
  // This creates a clone of the original state, hence preventing us from
  // accidentally modifying the original state
  return Object.assign({}, state);
}
