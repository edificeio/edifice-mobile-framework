import * as React from 'react';

export const useConstructor: any = (callback = () => {}) => {
  const hasBeenCalledRef = React.useRef(false);
  if (hasBeenCalledRef.current) return;
  if (callback) callback();
  hasBeenCalledRef.current = true;
};
