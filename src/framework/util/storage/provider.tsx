import React from 'react';

import { useModules } from '~/app/module/loader';

import { runDeviceMigrations } from './migrations';

/**
 * Runs the migrations of the storages the modules declare (their `storages`) before anything reads the storage: its children
 * don't show until they are done.
 */
export const StorageProvider = React.memo(function ({ children }: React.PropsWithChildren) {
  const storages = useModules().flatMap(module => module.storages);
  React.use(runDeviceMigrations(storages));
  return <>{children}</>;
});
