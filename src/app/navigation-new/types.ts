import type { ParamListBase, RouteProp, StaticParamList } from '@react-navigation/native';
import type {
  createNativeStackNavigator,
  createNativeStackScreen,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import type { AllModulesNavigationParams } from '~/app/module';

import type { useRootStackNavigation } from './rootStack';
import type { useTabNavigation } from './tabs';
import type { createTabStackNavigation } from './tabStack';

/**
 * Type of the root navigator, built from all modules screens and modals.
 * It's the same as the one created in `useModulesNavigation` but it must be known statically for the global navigation types.
 */
type RootStackType = ReturnType<typeof createNativeStackNavigator<AllModulesNavigationParams>>;

declare module '@react-navigation/native' {
  interface RootNavigator extends RootStackType {}
}

/**
 * Component rendered by a screen (or a modal).
 * A static screen only declares the `route` prop (see `StaticScreenProps`): navigation is done through hooks (`useNavigation`).
 * Screens that need the `navigation` prop (dynamic navigation) are rejected on purpose.
 * Name and params are `any` here as they are inferred from the component props at each screen.
 */
export type ScreenComponent = React.ComponentType<{
  route: Omit<RouteProp<ParamListBase>, 'name' | 'params'> & { name: any; params: any };
}>;

export type ScreenConfig<Component extends ScreenComponent> = Parameters<typeof createNativeStackScreen<Component>>[0];
export type ScreenOptionsProps = Parameters<Extract<ScreenConfig<ScreenComponent>['options'], Function>>[0];

type TabStackParamList = StaticParamList<ReturnType<typeof createTabStackNavigation>>;
export type StackNavigation = NativeStackNavigationProp<TabStackParamList, keyof TabStackParamList>;

type RootStackParamList = StaticParamList<ReturnType<typeof useRootStackNavigation>>;
export type RootNavigation = NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList>;

type TabsParamList = StaticParamList<ReturnType<typeof useTabNavigation>>;
export type TabNavigation = NativeStackNavigationProp<TabsParamList, keyof TabsParamList>;
