import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

const useKeyPress = (keys, callback, node = null) => {
    const callbackRef = useRef(callback);
    useLayoutEffect(() => {
        callbackRef.current = callback;
    });

    const handleKeyPress = useCallback(
        (event) => {
            if ((event.ctrlKey || event.metaKey) && keys.some((key) => event.key === key)) {
                callbackRef.current(event);
            }
        },
        [keys]
    );

    useEffect(() => {
        const targetNode = node ?? document;
        targetNode &&
        targetNode.addEventListener("keydown", handleKeyPress);

        return () =>
            targetNode &&
            targetNode.removeEventListener("keydown", handleKeyPress);
    }, [handleKeyPress, node]);
};

export default useKeyPress;
