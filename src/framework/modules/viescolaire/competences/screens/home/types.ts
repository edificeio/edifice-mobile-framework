import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ITerm } from '~/framework/modules/viescolaire/common/model';
import { IDevoirsMatieres, ILevel, IMoyenne, IUserChild } from '~/framework/modules/viescolaire/competences/model';
import type { CompetencesNavigationParams } from '~/framework/modules/viescolaire/competences/navigation';
import { AsyncState } from '~/framework/util/redux/async';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface CompetencesHomeScreenProps {
  devoirsMatieres: AsyncState<IDevoirsMatieres>;
  initialLoadingState: AsyncPagedLoadingState;
  levels: ILevel[];
  moyennes: AsyncState<IMoyenne[]>;
  terms: ITerm[];
  childId?: string;
  classes?: string[];
  structureId?: string;
  userType?: string;
  userId?: string;
  fetchDevoirs: (structureId: string, studentId: string, period?: string, matiere?: string) => Promise<IDevoirsMatieres>;
  fetchLevels: (structureId: string) => Promise<ILevel[]>;
  fetchMoyennes: (structureId: string, studentId: string, period?: string) => Promise<IMoyenne[]>;
  fetchTerms: (structureId: string, groupId: string) => Promise<ITerm[]>;
  fetchUserChildren: (userId: string) => Promise<IUserChild[]>;
}

export interface CompetencesHomeScreenNavParams {}

export interface CompetencesHomeScreenPrivateProps
  extends NativeStackScreenProps<CompetencesNavigationParams, 'home'>,
    CompetencesHomeScreenProps {
  // @scaffolder add HOC props here
}
