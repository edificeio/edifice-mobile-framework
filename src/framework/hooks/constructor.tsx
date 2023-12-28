import * as React from 'react';

export const useConstructor: any = (callback = () => {}) => {
  const [hasBeenCalled, setHasBeenCalled] = React.useState(false);
  if (hasBeenCalled) return;
  if (callback) callback();
  setHasBeenCalled(true);
};
