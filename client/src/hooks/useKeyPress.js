import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

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

    const isShortcut = (event, keys) => {
        const pressedFlags =
            (event.altKey && ShortcutFlags.alt) |
            (event.shiftKey && ShortcutFlags.shift) |
            ((event.ctrlKey || event.metaKey) && ShortcutFlags.ctrl);

        return keys.some((key) => {
            const keyMatch = event.key.toLowerCase() === key;

            if (keyMatch) {
                return pressedFlags === modifiers;
            }

            return false;
        });
    };

    const handleKeyPress = useCallback(
        (event) => {
            if (isShortcut(event, keys)) {
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
