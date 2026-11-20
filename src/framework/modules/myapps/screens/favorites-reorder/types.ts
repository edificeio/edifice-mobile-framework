import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';

export namespace MyAppsFavoritesReorderScreen {
  export type NavParams = undefined;
  export type NavigationProps = NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.FavoritesReorder>;
  export type AllProps = MyAppsFavoritesReorderScreen.NavigationProps;
}
