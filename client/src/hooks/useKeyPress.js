import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

const isShortcut = (event, keys, options) => {
    const ctrlOrCmdPressed = event.ctrlKey || event.metaKey;
    const shiftPressed = event.shiftKey;
    const altPressed = event.altKey;

    return keys.some((key) => {
        const keyMatch = event.key.toLowerCase() === key;

        if (keyMatch) {
            const modifiersMatch =
                (!options.useCtrl || ctrlOrCmdPressed) &&
                (!options.useShift || shiftPressed) &&
                (!options.useAlt || altPressed);

            return modifiersMatch;
        }

        return false;
    });
};

const useKeyPress = (
    keys,
    callback,
    options = { useCtrl: true, useShift: false, useAlt: false },
    node = null
) => {
    const callbackRef = useRef(callback);
    useLayoutEffect(() => {
        callbackRef.current = callback;
    });

    const handleKeyPress = useCallback(
        (event) => {
            if (isShortcut(event, keys, options)) {
                callbackRef.current(event);
            }
        },
        [keys, options]
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

class KeyPressBuilder {
    constructor() {
        this.keys = [];
        this.modifiers = [];
        this.callback = null;
        this.node = null;
    }

    withKeys(keys) {
        this.keys = keys;
        return this;
    }

    withModifiers(modifiers) {
        this.modifiers = modifiers;
        return this;
    }

    withCallback(callback) {
        this.callback = callback;
        return this;
    }

    withNode(node) {
        this.node = node;
        return this;
    }

    build() {
        return useKeyPress(
            this.keys,
            this.callback,
            {
                useCtrl: this.modifiers.includes('ctrl'),
                useShift: this.modifiers.includes('shift'),
                useAlt: this.modifiers.includes('alt'),
            },
            this.node
        )
    }
}

export const useKeyPressBuilder = () => new KeyPressBuilder();
