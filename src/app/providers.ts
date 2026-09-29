import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { UI_STYLES } from '~/framework/components/constants';
import { NetworkMonitorProvider } from '~/framework/util/monitoring/network';
import { DeviceTrust } from '~/util/device-trust';

import { ProviderEntry } from '../util/compose-providers';

export const providers: ProviderEntry[] = [
  [DeviceTrust],
  [NetworkMonitorProvider],
  [GestureHandlerRootView, { style: UI_STYLES.flex1 }],
  [SafeAreaProvider, { initialMetrics: initialWindowMetrics }],
  [KeyboardProvider, { navigationBarTranslucent: true, statusBarTranslucent: true }],
] as const;
