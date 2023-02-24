import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISchoolYear, ITerm } from '~/framework/modules/viescolaire/common/model';
import { IHistory, IUserChild } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams } from '~/framework/modules/viescolaire/presences/navigation';
import { AsyncState } from '~/framework/util/redux/async';

export interface PresencesHistoryScreenProps {
  data: any;
  events: IHistory;
  year: AsyncState<ISchoolYear | undefined>;
  periods: AsyncState<ITerm[]>;
  userType: string;
  userId: string;
  childId: string;
  structureId: string;
  groupId: string;
  childrenInfos: AsyncState<IUserChild[]>;
  hasRightToCreateAbsence: boolean;
  fetchHistory: (studentId: string, structureId: string, startDate: string, endDate: string) => Promise<IHistory>;
  fetchSchoolYear: (strunctureId: string) => Promise<ISchoolYear>;
  fetchTerms: (structureId: string, groupId: string) => Promise<IUserChild[]>;
  fetchUserChildren: (relativeId: string) => Promise<ITerm[]>;
}

export interface PresencesHistoryScreenNavParams {}

export interface PresencesHistoryScreenPrivateProps
  extends NativeStackScreenProps<PresencesNavigationParams, 'history'>,
    PresencesHistoryScreenProps {
  // @scaffolder add HOC props here
}
