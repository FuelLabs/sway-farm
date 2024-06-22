import { useRef, useEffect } from 'react';

/**
 * A custom React hook that allows you to easily add and remove event listeners to the `window` object.
 * This hook ensures that the event listener is properly cleaned up when the component unmounts or the event changes.
 * It also handles the potential issue of stale closures by using a ref to keep the callback function up to date.
 *
 * @template E The type of event that this hook will listen for. It extends the base `Event` type.
 * @param {string} event - The name of the event to listen for on the window object. For example: 'resize', 'scroll', etc.
 * @param {(e: E) => void} callback - The callback function that will be executed when the event is triggered.
 * The callback receives the event object as its parameter.
 *
 * @example
 * // Example of using useWindowListener to add a resize event listener
 * useWindowListener('resize', (e) => {
 *   console.log('Window resized', e);
 * });
 *
 * @example
 * // Example of using useWindowListener with a custom event type
 * useWindowListener<CustomEvent>('myCustomEvent', (e) => {
 *   console.log('Custom event triggered', e.detail);
 * });
 */
export const useWindowListener = <E extends Event>(
  event: string,
  callback: (e: E) => void
) => {
  // useRef is used to hold a reference to the callback. This approach ensures that
  // the callback can be updated without re-adding the event listener, reducing unnecessary operations.
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (e: Event) => ref.current(e as E);
    window.addEventListener(event, handler);
    return () => {
      window.removeEventListener(event, handler);
    };
  }, [event]);
};
