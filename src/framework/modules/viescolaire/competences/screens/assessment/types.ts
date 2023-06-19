import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type {
  fetchCompetencesAction,
  fetchCompetencesDomainesAction,
  fetchCompetencesLevelsAction,
} from '~/framework/modules/viescolaire/competences/actions';
import type { ICompetence, IDevoir, IDomaine, ILevel } from '~/framework/modules/viescolaire/competences/model';
import type { CompetencesNavigationParams, competencesRouteNames } from '~/framework/modules/viescolaire/competences/navigation';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface CompetencesAssessmentScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
}

export interface CompetencesAssessmentScreenNavParams {
  assessment: IDevoir;
  studentClass: string;
}

export interface CompetencesAssessmentScreenStoreProps {
  competences: ICompetence[];
  domaines: IDomaine[];
  levels: ILevel[];
  studentId?: string;
  structureId?: string;
}

export interface CompetencesAssessmentScreenDispatchProps {
  tryFetchCompetences: (...args: Parameters<typeof fetchCompetencesAction>) => Promise<ICompetence[]>;
  tryFetchDomaines: (...args: Parameters<typeof fetchCompetencesDomainesAction>) => Promise<IDomaine[]>;
  tryFetchLevels: (...args: Parameters<typeof fetchCompetencesLevelsAction>) => Promise<ILevel[]>;
}

export type CompetencesAssessmentScreenPrivateProps = CompetencesAssessmentScreenProps &
  CompetencesAssessmentScreenStoreProps &
  CompetencesAssessmentScreenDispatchProps &
  NativeStackScreenProps<CompetencesNavigationParams, typeof competencesRouteNames.assessment>;
