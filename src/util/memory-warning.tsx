import React from 'react';
import { AppState } from 'react-native';

import FastImage from '@d11/react-native-fast-image';

export const MemoryWarningProvider = React.memo(function ({ children }: React.PropsWithChildren) {
  const handleMemoryWarning = React.useCallback(() => {
    FastImage.clearMemoryCache();
    // TODO: Clear heavy reducers?
    // TODO: Clear MMKV Heavy keys?
    // TODO: Clear APIs responses?
  }, []);

  React.useEffect(() => {
    const memoryListener = AppState.addEventListener('memoryWarning', () => {
      handleMemoryWarning();
    });
    return () => memoryListener.remove();
  }, [handleMemoryWarning]);
  return <>{children}</>;
});
MemoryWarningProvider.displayName = 'MemoryWarningProvider';
