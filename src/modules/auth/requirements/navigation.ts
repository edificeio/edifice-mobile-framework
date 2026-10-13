import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { ModuleModals, ModuleScreens, NavigationParamsOfScreens } from '~/app/module';

import type requirementsModule from '.';

/**
 * Params of every route of the requirements module, inferred from the `StaticScreenProps` of its screens (see `index.ts`).
 */
type RequirementsParamList = NavigationParamsOfScreens<ModuleScreens<typeof requirementsModule>> &
  NavigationParamsOfScreens<ModuleModals<typeof requirementsModule>>;

export type RequirementsNavigation = NativeStackNavigationProp<RequirementsParamList, keyof RequirementsParamList>;

/**
 * Same as `useNavigation`, but typed with the screens of the requirements module.
 * A screen that uses it must annotate its return type (`: React.JSX.Element`), else TypeScript can't infer the screens' types.
 */
export const useRequirementsNavigation = () => useNavigation<RequirementsNavigation>();
