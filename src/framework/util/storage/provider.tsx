import React from 'react';

import { useConstructor } from '~/framework/hooks/constructor';
import { Storage } from '~/framework/util/storage';

export const StorageProvider = React.memo(function ({ children }: React.PropsWithChildren) {
  useConstructor(async () => {
    await Storage.init();
  });
  return <>{children}</>;
});
