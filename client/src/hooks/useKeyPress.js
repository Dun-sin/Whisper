/* eslint-disable max-len */
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

// An object defining flags for various keyboard shortcut modifiers.
export const ShortcutFlags = {
    ctrl: 1,
    shift: 2,
    alt: 4,
};

/**
 * A custom React hook for handling keyboard shortcuts.
 * @param {string[]} keys - An array of key strings to listen for.
 * @param {Function} callback - The callback function to execute when the keys are pressed.
 * @param {number} modifiers - A bitmask of modifier flags (e.g., ShortcutFlags.ctrl).
 * @param {HTMLElement} node - The target HTML element where the event listener is attached.
 */
const useKeyPress = (
    keys,
    callback,
    modifiers = ShortcutFlags.ctrl,
    node = null
) => {
    const callbackRef = useRef(callback);

    // Update the callback reference when the callback prop changes.
    useLayoutEffect(() => {
        callbackRef.current = callback;
    });

    /**
     * Checks if the keyboard event matches the specified keys and modifiers.
     * @param {KeyboardEvent} event - The keyboard event.
     * @returns {boolean} True if the event matches the keys and modifiers; otherwise, false.
     */
    const isShortcut = (event) => {
			const { altKey, shiftKey, ctrlKey, metaKey, key } = event;
	
			// Generate a bitmask for the currently pressed key modifiers.
			const pressedFlags = (altKey && ShortcutFlags.alt) |
					(shiftKey && ShortcutFlags.shift) |
					((ctrlKey || metaKey) && ShortcutFlags.ctrl);
	
			// Convert the pressed key to lowercase for case-insensitive comparison.
			const keyMatch = key.toLowerCase();
	
			// Convert the keys array to lowercase for case-insensitive comparison.
			const keysLowercase = keys.map((k) => k.toLowerCase());
			return keysLowercase.includes(keyMatch) && pressedFlags === modifiers;
			};
	

    /**
     * Handles the keyboard event and executes the callback if the event matches the shortcut.
     * @param {KeyboardEvent} event - The keyboard event.
     */
    const handleKeyPress = useCallback(
        (event) => {
            if (isShortcut(event)) {
                callbackRef.current(event);
            }
        },
        [keys]
    );

    // Attach the event listener to the specified HTML element or the document.
    useEffect(() => {
        const targetNode = node || document;

        targetNode.addEventListener('keydown', handleKeyPress);

        // Remove the event listener when the component unmounts.
        return () => {
            targetNode.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress, node]);
};

export default useKeyPress;
