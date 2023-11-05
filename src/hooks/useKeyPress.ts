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
 * @param keys - An array of key strings to listen for.
 * @param callback - The callback function to execute when the keys are pressed.
 * @param modifiers - A bitmask of modifier flags (e.g., ShortcutFlags.ctrl).
 * @param node - The target HTML element where the event listener is attached.
 */
const useKeyPress = (
  keys: string[],
  callback: Function,
  modifiers: number = ShortcutFlags.ctrl,
  node?: HTMLElement
) => {
  const callbackRef = useRef(callback);

  // Update the callback reference when the callback prop changes.
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  /**
   * Checks if the keyboard event matches the specified keys and modifiers.
   */
  const isShortcut = (event: KeyboardEvent): boolean => {
    const { altKey, shiftKey, ctrlKey, metaKey, key } = event;

    // Generate a bitmask for the currently pressed key modifiers.
    const pressedFlags =
      (altKey ? ShortcutFlags.alt : 0) |
      (shiftKey ? ShortcutFlags.shift : 0) |
      (ctrlKey || metaKey ? ShortcutFlags.ctrl : 0);

    // Convert the pressed key to lowercase for case-insensitive comparison.
    const keyMatch = key.toLowerCase();

    // Convert the keys array to lowercase for case-insensitive comparison.
    const keysLowercase = keys.map(k => k.toLowerCase());
    return keysLowercase.includes(keyMatch) && pressedFlags === modifiers;
  };

  /**
   * Handles the keyboard event and executes the callback if the event matches the shortcut.
   */
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (isShortcut(event)) {
      callbackRef.current(event);
    }
  }, []);

  const handleKeyDown = () => {
    const event = new KeyboardEvent('keydown');
    handleKeyPress(event);
  };

  // Attach the event listener to the specified HTML element or the document.
  useEffect(() => {
    const targetNode = node || document;

    targetNode.addEventListener('keydown', handleKeyDown);

    // Remove the event listener when the component unmounts.
    return () => {
      targetNode.removeEventListener('keydown', handleKeyDown);
    };
  }, [node]);
};

export default useKeyPress;
