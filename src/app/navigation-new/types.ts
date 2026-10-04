import type { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AllModulesNavigationParams } from '~/app/module/types';

/**
 * Type of the root navigator, built from all modules screens and modals.
 * It's the same as the one created in `useModulesNavigation` but it must be known statically for the global navigation types.
 */
type RootStackType = ReturnType<typeof createNativeStackNavigator<AllModulesNavigationParams>>;

declare module '@react-navigation/native' {
  interface RootNavigator extends RootStackType {}
}
