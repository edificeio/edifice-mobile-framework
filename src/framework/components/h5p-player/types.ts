import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';

export interface H5PPlayerNavParams {
  contentId: string;
}

export interface H5PPlayerScreenProps extends NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.H5PPlayer> {}
