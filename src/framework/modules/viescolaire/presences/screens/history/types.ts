import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IUserChild } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams } from '~/framework/modules/viescolaire/presences/navigation';
import { AsyncState } from '~/framework/util/redux/async';

export interface PresencesHistoryScreenProps {
  data: any;
  events: any;
  year: any;
  periods: any;
  userType: string;
  userId: string;
  childId: string;
  structureId: string;
  groupId: string;
  childrenInfos: AsyncState<IUserChild>;
  hasRightToCreateAbsence: boolean;
  getEvents: (childId: string, structureId: string, startDate: moment.Moment, endDate: moment.Moment) => void;
  getPeriods: (structureId: string, groupId: string) => void;
  getChildInfos: (relativeId: string) => void;
  getYear: (strunctureId: string) => void;
}

export interface PresencesHistoryScreenNavParams {
  userId?: string;
}

export interface PresencesHistoryScreenPrivateProps
  extends NativeStackScreenProps<PresencesNavigationParams, 'history'>,
    PresencesHistoryScreenProps {
  // @scaffolder add HOC props here
}
