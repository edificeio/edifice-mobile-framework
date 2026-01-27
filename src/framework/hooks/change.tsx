import React from 'react';

export const useChange = <T,>(value: T, name: string, formatter?: (v: T) => string) => {
  const oldValue = React.useRef(value);
  if (value !== oldValue.current)
    console.warn(
      `[CHANGE] ${name}: ${formatter ? formatter(oldValue.current) : oldValue.current} -> ${formatter ? formatter(value) : value}`,
    );
  oldValue.current = value;
};

export default useChange;
