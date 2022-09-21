import { cloneState } from './utils';

export default function chatReducer(state, action) {
    const clonedState = cloneState(state);

    switch (action.type) {
        case 'ADD_MESSAGE': {
            const { id, time, room } = action.payload;

            const message = {
                message: action.payload.message,
                time,
            };

            if (clonedState[id] === undefined) {
                clonedState[id] = {
                    id,
                    messages: [].concat(message),
                    room,
                };
            } else {
                clonedState[id].messages.push(message);
            }
            break;
        }

        default:
            throw new Error('No action provided!');
    }

    // Save auth state to localStorage on each change
    localStorage.setItem('chats', JSON.stringify(clonedState));

    return clonedState;
}
