import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/form/module-config';
import type { FormDistributionScreenNavParams } from '~/framework/modules/form/screens/distribution';
import type { FormDistributionListScreenNavParams } from '~/framework/modules/form/screens/distribution-list';

export const formRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  distribution: `${moduleConfig.routeName}/distribution` as 'distribution',
};
export interface FormNavigationParams extends ParamListBase {
  home: FormDistributionListScreenNavParams;
  distribution: FormDistributionScreenNavParams;
}
