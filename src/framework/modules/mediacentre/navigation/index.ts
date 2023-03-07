import { ParamListBase } from '@react-navigation/native';

import type { MediacentreHomeScreenNavigationParams } from '~/framework/modules/mediacentre/screens/MediacentreHomeScreen';

import moduleConfig from '../module-config';

export const mediacentreRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface MediacentreNavigationParams extends ParamListBase {
  home: MediacentreHomeScreenNavigationParams;
}
