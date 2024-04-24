import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/collaborativewall/module-config';
import type { CollaborativewallHomeScreenNavParams } from '~/framework/modules/collaborativewall/screens/home';
import type { CollaborativewallViewerScreenNavParams } from '~/framework/modules/collaborativewall/screens/viewer';

export const collaborativewallRouteNames = {
  home: `${moduleConfig.name}` as 'home',
  viewer: `${moduleConfig.name}/viewer` as 'viewer',
};
export interface CollaborativewallNavigationParams extends ParamListBase {
  home: CollaborativewallHomeScreenNavParams;
  viewer: CollaborativewallViewerScreenNavParams;
}
