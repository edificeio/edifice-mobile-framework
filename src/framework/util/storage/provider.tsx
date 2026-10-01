import React from 'react';

import { useModules } from '~/app/module/loader';
import { useConstructor } from '~/framework/hooks/constructor';

export const StorageProvider = React.memo(function ({ children }: React.PropsWithChildren) {
  const allStorages = useModules()
    .map(module => module.storage?.device)
    .filter(t => t !== undefined);
  useConstructor(async () => {
    await Promise.all(allStorages.map(item => item.init));
  });
  return <>{children}</>;
});
