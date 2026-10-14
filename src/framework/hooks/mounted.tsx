import React from 'react';

/**
 * Hold a ref to a boolean indicating that the current component is mounted.
 * Useful in callbacks to bypass async logic when component is no more present.
 */
export const useMounted = () => {
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return mounted.current;
};
