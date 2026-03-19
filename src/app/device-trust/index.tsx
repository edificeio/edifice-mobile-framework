/**
 * Device Trust
 *
 * Ensure device is trustable before launching the app.
 * This includes check for jailbroken/rooted device, and simulator device.
 */

import React, { PropsWithChildren } from 'react';

import { exitApp } from '@logicwind/react-native-exit-app';

import { PrivilegeTrust } from './privilege';
import { SimulatorTrust } from './simulator';

export const DeviceTrust = React.memo(function DeviceTrust({
  children,
  onUntrusted = exitApp,
}: PropsWithChildren<{ onUntrusted?: () => void }>) {
  return (
    <PrivilegeTrust onUntrusted={onUntrusted}>
      <SimulatorTrust onUntrusted={onUntrusted}>{children}</SimulatorTrust>
    </PrivilegeTrust>
  );
});
