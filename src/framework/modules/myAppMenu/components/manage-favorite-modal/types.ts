import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppsInfoAggregated } from '~/framework/modules/myapps/types';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';

export type ManageFavoriteSheetContentProps = {
  apps: AppsInfoAggregated[];
  query: string;
  onChangeQuery: (value: string) => void;
  selected: Set<string>;
  onToggle: (appName: string) => void;
  emptyScreenConfig: {
    title: string;
    text: string;
  };
};

export type HeaderLeftProps = {
  isSaving: boolean;
  onClose: () => void;
};
export type HeaderRightProps = {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onValidate: () => void;
};

export namespace ManageFavoriteScreenProps {
  export interface Public {}

  export interface NavParams {}

  export type ManageFavoritesNavigation = NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.FavoritesManagement>;

  export type NavBarConfig = ({ navigation, route }: ManageFavoritesNavigation) => NativeStackNavigationOptions;

  export interface AllProps extends Public, ManageFavoritesNavigation {}
}
