import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/viescolaire/competences/module-config';
import { CompetencesAssessmentScreenNavParams } from '~/framework/modules/viescolaire/competences/screens/assessment';
import { CompetencesHomeScreenNavParams } from '~/framework/modules/viescolaire/competences/screens/home';

export const competencesRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  assessment: `${moduleConfig.routeName}/assessment` as 'assessment',
};
export interface CompetencesNavigationParams extends ParamListBase {
  home: CompetencesHomeScreenNavParams;
  assessment: CompetencesAssessmentScreenNavParams;
}
