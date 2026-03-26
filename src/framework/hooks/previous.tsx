import React from 'react';

export function usePrevious<T>(value: T) {
  const [previous, setPrevious] = React.useState<T>(value);
  if (previous !== value) {
    setPrevious(value);
  }
  return previous;
}
