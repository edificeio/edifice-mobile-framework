/**
 * Device Trust
 *
 * Ensure device is not jail-broken or rooted before launching the app.
 * Only production builds are affected.
 */

import React, { PropsWithChildren } from 'react';
import { Alert, View } from 'react-native';

import { exitApp } from '@logicwind/react-native-exit-app';
import JailMonkey from 'jail-monkey';
import DeviceInfo from 'react-native-device-info';

import { I18n } from './i18n';

import { Loading } from '~/ui/Loading';

export const DeviceTrust = React.memo(function DeviceTrust({
  children,
  onUntrusted = exitApp,
}: PropsWithChildren<{ onUntrusted?: () => void }>) {
  const [isTrustedDevice, setIsTrustedDevice] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    (async () => {
      if (isTrustedDevice !== undefined) return;

      const isDebug = await JailMonkey.isDebuggedMode();
      const trusted = __DEV__ || isDebug || (!JailMonkey.isJailBroken() && !JailMonkey.hookDetected);

      setIsTrustedDevice(trusted);
      if (trusted) {
        console.debug(`[DeviceTrust] Trusted device`);
      } else {
        console.error(`[DeviceTrust] UNTRUSTED DEVICE`);
        Alert.alert(
          I18n.get('device-untrusted-title'),
          I18n.get('device-untrusted-description', { name: DeviceInfo.getApplicationName() }),
          [{ isPreferred: true, onPress: onUntrusted, text: I18n.get('device-untrusted-action') }],
          {
            cancelable: false,
          },
        );
      }
    })();
  }, [isTrustedDevice, onUntrusted]);

  if (isTrustedDevice === undefined) return <Loading />;
  else if (!isTrustedDevice) return <View />;
  else return children;
});
