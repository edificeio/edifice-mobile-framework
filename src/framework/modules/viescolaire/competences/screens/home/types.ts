import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IDevoirsMatieres, ILevel, IMoyenne } from '~/framework/modules/viescolaire/competences/model';
import type { CompetencesNavigationParams } from '~/framework/modules/viescolaire/competences/navigation';
import { AsyncState } from '~/framework/util/redux/async';
import { IPeriodsList } from '~/modules/viescolaire/dashboard/state/periods';

export interface CompetencesHomeScreenProps {
  devoirsList: AsyncState<IDevoirsMatieres>;
  devoirsMoyennesList: AsyncState<IMoyenne[]>;
  levels: ILevel[];
  userType: string;
  userId: string;
  periods: IPeriodsList;
  groups: string[];
  childClasses: string;
  structureId: string;
  childId: string;
  fetchChildInfos: (userId: string) => void;
  fetchChildGroups: (classes: string, student: string) => any;
  getDevoirs: (structureId: string, studentId: string, period?: string, matiere?: string) => void;
  getDevoirsMoyennes: (structureId: string, studentId: string, period?: string) => void;
  getPeriods: (structureId: string, groupId: string) => void;
  getLevels: (structureIs: string) => void;
}

export interface CompetencesHomeScreenNavParams {}

export interface CompetencesHomeScreenPrivateProps
  extends NativeStackScreenProps<CompetencesNavigationParams, 'home'>,
    CompetencesHomeScreenProps {
  // @scaffolder add HOC props here
}
