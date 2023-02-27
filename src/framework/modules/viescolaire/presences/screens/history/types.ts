import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PresencesNavigationParams } from '~/framework/modules/viescolaire/presences/navigation';

import { ISchoolYear, ITerm } from '~/framework/modules/viescolaire/common/model';
import { IHistory, IUserChild } from '~/framework/modules/viescolaire/presences/model';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface PresencesHistoryScreenProps {
  history: IHistory;
  initialLoadingState: AsyncPagedLoadingState;
  schoolYear: ISchoolYear | undefined;
  terms: ITerm[];
  classes?: string[];
  hasRightToCreateAbsence?: boolean;
  structureId?: string;
  studentId?: string;
  userId?: string;
  userType?: string;
  fetchHistory: (studentId: string, structureId: string, startDate: string, endDate: string) => Promise<IHistory>;
  fetchSchoolYear: (strunctureId: string) => Promise<ISchoolYear>;
  fetchTerms: (structureId: string, groupId: string) => Promise<ITerm[]>;
  fetchUserChildren: (relativeId: string) => Promise<IUserChild[]>;
}

export interface PresencesHistoryScreenNavParams {}

export interface PresencesHistoryScreenPrivateProps
  extends NativeStackScreenProps<PresencesNavigationParams, 'history'>,
    PresencesHistoryScreenProps {
  // @scaffolder add HOC props here
}
