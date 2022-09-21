export function cloneState(state) {
    // This creates a clone of the original state, hence preventing us from
    // accidentally modifying the original state
    return Object.assign({}, state);
}
