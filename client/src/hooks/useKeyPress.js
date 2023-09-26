import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

const useKeyPress = (keys, callback, node = null) => {
    const callbackRef = useRef(callback);
    useLayoutEffect(() => {
        callbackRef.current = callback;
    });

    const isShortcut = (event) => keys.some((key) => event.key === key);

    const handleKeyPress = useCallback(
        (event) => {
            if ((event.ctrlKey || event.metaKey) && isShortcut(event)) {
                callbackRef.current(event);
            }
        },
        [keys]
    );

    useEffect(() => {
        const targetNode = node ?? document;

        if (targetNode) {
            targetNode.addEventListener("keydown", handleKeyPress);
        }

        return () => {
            if (targetNode) {
                targetNode.removeEventListener("keydown", handleKeyPress);
            }
        }
    }, [handleKeyPress, node]);
};

export default useKeyPress;
