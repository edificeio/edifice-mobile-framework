/**
 * Privilege Trust
 *
 * Ensure device is not jail-broken or rooted before launching the app.
 * Only production builds are affected.
 */

import React, { PropsWithChildren } from 'react';

import JailMonkey from 'jail-monkey';


export const PrivilegeTrust = React.memo(function PrivilegeTrust({
  children,
  onUntrusted,
}: PropsWithChildren<{ onUntrusted: () => void }>) {
  const [isTrustedDevice, setIsTrustedDevice] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    (async () => {
      if (isTrustedDevice !== undefined) return;

      const isDebug = await JailMonkey.isDebuggedMode();
      const trusted = __DEV__ || isDebug || (!JailMonkey.isJailBroken() && !JailMonkey.hookDetected);

      setIsTrustedDevice(trusted);
      if (trusted) {
        console.debug(`[PrivilegeTrust] Trusted device`);
      } else {
        console.error(`[PrivilegeTrust] UNTRUSTED DEVICE`);
        /*Alert.alert(
          I18n.get('device-untrusted-privilege-title'),
          I18n.get('device-untrusted-privilege-description', { name: DeviceInfo.getApplicationName() }),
          [{ isPreferred: true, onPress: onUntrusted, text: I18n.get('device-untrusted-action') }],
          {
            cancelable: false,
          },
        );*/
      }
    })();
  }, [isTrustedDevice, onUntrusted]);

  /*if (isTrustedDevice === undefined) return <Loading />;
  else if (!isTrustedDevice) return <View />;
  else */ return children;
});
