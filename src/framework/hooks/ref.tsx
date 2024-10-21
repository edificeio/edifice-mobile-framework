import * as React from 'react';

export const useSyncRef = <T extends any>(...refs: React.Ref<T>[]) => {
  return React.useCallback(
    node => {
      refs.forEach(ref => {
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            (ref as React.MutableRefObject<T>).current = node;
          }
        }
      });
    },
    [refs]
  );
};
