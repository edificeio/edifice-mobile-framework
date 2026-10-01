import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { UI_STYLES } from '~/framework/components/constants';
import appConf from '~/framework/util/appConf';
import { NetworkMonitorProvider } from '~/framework/util/monitoring/network';
import { StorageProvider } from '~/framework/util/storage/provider';
import { ZendeskProvider } from '~/framework/util/zendesk';
import { provider } from '~/util/compose-providers';
import { DeviceTrust } from '~/util/device-trust';
import { I18nProvider } from '~/util/i18n';
import { MemoryWarningProvider } from '~/util/memory-warning';

import { ReduxProvider } from './store';

export const providers = [
  provider(MemoryWarningProvider),
  provider(StorageProvider),
  provider(I18nProvider),
  provider(ReduxProvider),
  provider(DeviceTrust),
  provider(NetworkMonitorProvider),
  provider(GestureHandlerRootView, { style: UI_STYLES.flex1 }),
  provider(SafeAreaProvider, { initialMetrics: initialWindowMetrics }),
  provider(KeyboardProvider, { navigationBarTranslucent: true, statusBarTranslucent: true }),
  !!appConf.zendeskEnabled && provider(ZendeskProvider, { zendeskConfig: appConf.zendesk! }),
];
