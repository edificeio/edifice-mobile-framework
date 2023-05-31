import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ICompetence, IDevoir, IDomaine, ILevel } from '~/framework/modules/viescolaire/competences/model';
import type { CompetencesNavigationParams } from '~/framework/modules/viescolaire/competences/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface CompetencesAssessmentScreenProps {
  competences: ICompetence[];
  domaines: IDomaine[];
  initialLoadingState: AsyncPagedLoadingState;
  levels: ILevel[];
  studentId?: string;
  structureId?: string;
  fetchCompetences: (studentId: string, classId: string) => Promise<ICompetence[]>;
  fetchDomaines: (classId: string) => Promise<IDomaine[]>;
  fetchLevels: (structureId: string) => Promise<ILevel[]>;
}

export interface CompetencesAssessmentScreenNavParams {
  assessment: IDevoir;
  studentClass: string;
}

export interface CompetencesAssessmentScreenPrivateProps
  extends NativeStackScreenProps<CompetencesNavigationParams, 'assessment'>,
    CompetencesAssessmentScreenProps {
  // @scaffolder add HOC props here
}
