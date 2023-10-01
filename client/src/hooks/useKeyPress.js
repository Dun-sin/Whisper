import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

// An object defining flags for various keyboard shortcut modifiers.
export const ShortcutFlags = {
    ctrl: 1,
    shift: 2,
    alt: 4,
};

const useKeyPress = (
    keys,
    callback,
    modifiers = ShortcutFlags.ctrl,
    node = null
) => {
    const callbackRef = useRef(callback);
    useLayoutEffect(() => {
        callbackRef.current = callback;
    });

    const isShortcut = (event) => {
        // Generate a bitmask for the currently pressed key.
        const pressedFlags =
            (event.altKey && ShortcutFlags.alt) |
            (event.shiftKey && ShortcutFlags.shift) |
            ((event.ctrlKey || event.metaKey) && ShortcutFlags.ctrl);

        return keys.some((key) => {
            const keyMatch = event.key.toLowerCase() === key;

            if (keyMatch) {
                // Verify if both the bitmask argument and the pressed bitmask are identical.
                return pressedFlags === modifiers;
            }

            return false;
        });
    };

    const handleKeyPress = useCallback(
        (event) => {
            if (isShortcut(event)) {
                callbackRef.current(event);
            }
        },
        [keys]
    );

    useEffect(() => {
        const targetNode = node ?? document;

        if (targetNode) {
            targetNode.addEventListener('keydown', handleKeyPress);
        }

        return () => {
            if (targetNode) {
                targetNode.removeEventListener('keydown', handleKeyPress);
            }
        };
    }, [handleKeyPress, node]);
};

export default useKeyPress;
