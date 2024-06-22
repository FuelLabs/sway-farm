import React, {
  useState,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from 'react';

import { useWindowListener } from './useWindowListener';

export const Controls = {
  forward: 'forward',
  back: 'back',
  left: 'left',
  right: 'right',
} as const;

export type ControlsType = (typeof Controls)[keyof typeof Controls];

export type KeyboardControlsEntry = {
  name: ControlsType;
  keys: string[];
  up?: boolean;
};

export type KeyboardControlsState = { [key in ControlsType]: boolean };

const KeyboardControlsContext = createContext<
  KeyboardControlsState | undefined
>(undefined);

export const useKeyboardControls = () => {
  const context = useContext(KeyboardControlsContext);
  if (!context) {
    throw new Error(
      'useKeyboardControls must be used within a KeyboardControlsProvider'
    );
  }
  return context;
};

type KeyboardControlsProviderProps = {
  map: KeyboardControlsEntry[];
  children: React.ReactNode;
};

export const KeyboardControlsProvider: React.FC<
  KeyboardControlsProviderProps
> = ({ map, children }) => {
  const [state, setState] = useState<KeyboardControlsState>(
    map.reduce(
      (acc, cur) => ({ ...acc, [cur.name]: false }),
      {} as KeyboardControlsState
    )
  );

  const keyMap = useMemo(
    () =>
      map.reduce(
        (acc, { name, keys }) => {
          keys.forEach((key) => {
            acc[key] = name;
          });
          return acc;
        },
        {} as { [key: string]: ControlsType }
      ),
    [map]
  );

  const downHandler = useCallback(
    (event: KeyboardEvent) => {
      // Reset the state if the meta key is pressed
      if (event.metaKey || event.key === 'Meta') {
        event.preventDefault();

        setState((prevState) =>
          Object.keys(prevState).reduce(
            (acc, key) => ({
              ...acc,
              [key]: false,
            }),
            {} as KeyboardControlsState
          )
        );
        return;
      }

      const controlName = keyMap[event.key];
      if (controlName && !state[controlName]) {
        event.preventDefault();
        setState((prevState) => ({ ...prevState, [controlName]: true }));
      }
    },
    [keyMap, state]
  );

  const upHandler = useCallback(
    (event: KeyboardEvent) => {
      // Reset the state if the meta key is pressed
      if (event.key === 'Meta') {
        event.preventDefault();

        setState((prevState) =>
          Object.keys(prevState).reduce(
            (acc, key) => ({
              ...acc,
              [key]: false,
            }),
            {} as KeyboardControlsState
          )
        );

        return;
      }

      const controlName = keyMap[event.key];
      if (controlName && state[controlName]) {
        event.preventDefault();
        setState((prevState) => ({ ...prevState, [controlName]: false }));
      }
    },
    [keyMap, state]
  );

  useWindowListener('keydown', downHandler);
  useWindowListener('keyup', upHandler);

  return (
    <KeyboardControlsContext.Provider value={state}>
      {children}
    </KeyboardControlsContext.Provider>
  );
};
