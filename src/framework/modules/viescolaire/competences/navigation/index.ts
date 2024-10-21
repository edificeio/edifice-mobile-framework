import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/viescolaire/competences/module-config';
import { CompetencesAssessmentScreenNavParams } from '~/framework/modules/viescolaire/competences/screens/assessment';
import { CompetencesHomeScreenNavParams } from '~/framework/modules/viescolaire/competences/screens/home';

export const competencesRouteNames = {
  assessment: `${moduleConfig.routeName}/assessment` as 'assessment',
  home: `${moduleConfig.routeName}` as 'home',
};
export interface CompetencesNavigationParams extends ParamListBase {
  home: CompetencesHomeScreenNavParams;
  assessment: CompetencesAssessmentScreenNavParams;
}
