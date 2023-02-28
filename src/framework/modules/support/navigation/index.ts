import { ParamListBase } from '@react-navigation/native';

import { SupportScreenNavParams } from '~/framework/modules/support/screens/create-ticket/types';

import moduleConfig from '../module-config';

export const supportRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface SupportNavigationParams extends ParamListBase {
  home: SupportScreenNavParams;
}

// home screen have back handler (handleGoBack)
