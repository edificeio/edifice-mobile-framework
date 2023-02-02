import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/viescolaire/competences/module-config';
import { CompetencesHomeScreenNavParams } from '~/framework/modules/viescolaire/competences/screens/home';

export const competencesRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface CompetencesNavigationParams extends ParamListBase {
  home: CompetencesHomeScreenNavParams;
}
