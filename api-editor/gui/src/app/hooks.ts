import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useKeyboardShortcut = function (
    shiftKey: boolean,
    ctrlKey: boolean,
    altKey: boolean,
    key: string,
    callback: (event: KeyboardEvent) => void,
) {
    const callbackRef = useRef(callback);
    useLayoutEffect(() => {
        callbackRef.current = callback;
    });

    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            if (
                event.shiftKey === shiftKey &&
                event.ctrlKey === ctrlKey &&
                event.altKey === altKey &&
                event.key === key
            ) {
                callbackRef.current(event);
                event.preventDefault()
                event.stopPropagation()
            }
        },
        [shiftKey, ctrlKey, altKey, key],
    );

    useEffect(() => {
        // Add listener
        document?.addEventListener('keydown', handleKeyPress);

        // Remove listener
        return () => {
            document?.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);
};
