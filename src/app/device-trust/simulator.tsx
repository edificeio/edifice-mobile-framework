/**
 * Simulator Trust
 *
 * Ensure device is not a simulator before launching the app.
 * Only production builds are affected.
 */

import React, { PropsWithChildren } from 'react';
import { Alert, View } from 'react-native';

import { I18n } from '~/app/i18n';
import AppInfo from '~/framework/util/app-info';

export const SimulatorTrust = React.memo(function SimulatorTrust({
  children,
  onUntrusted,
}: PropsWithChildren<{ onUntrusted: () => void }>) {
  const [isTrustedDevice, setIsTrustedDevice] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    (async () => {
      if (isTrustedDevice !== undefined) return;

      const trusted = __DEV__ || !(await AppInfo.device.isEmulator());

      setIsTrustedDevice(trusted);
      if (trusted) {
        console.debug(`[SimulatorTrust] Device is not a simulator`);
      } else {
        console.error(`[SimulatorTrust] Device is a simulator`);
        Alert.alert(
          I18n.get('device-untrusted-simulator-title'),
          I18n.get('device-untrusted-simulator-description', { name: AppInfo.app.name }),
          [{ isPreferred: true, onPress: onUntrusted, text: I18n.get('device-untrusted-action') }],
          {
            cancelable: false,
          },
        );
      }
    })();
  }, [isTrustedDevice, onUntrusted]);

  return isTrustedDevice ? children : <View />;
});
