import React from 'react';

export default <T,>(value: T, name: string) => {
  const oldValue = React.useRef(value);
  if (value !== oldValue.current) console.warn(`[CHANGE] ${name}: ${oldValue.current} -> ${value}`);
  oldValue.current = value;
};
