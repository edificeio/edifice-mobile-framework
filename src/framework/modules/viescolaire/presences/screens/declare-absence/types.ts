import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { PresencesNavigationParams } from '~/framework/modules/viescolaire/presences/navigation';

export interface PresencesDeclareAbsenceScreenProps {
  childName: string;
  declareAbsenceAction: (startDate: moment.Moment, endDate: moment.Moment, comment: string) => void;
  declareAbsenceWithFileAction: (startDate: moment.Moment, endDate: moment.Moment, comment: string, file: LocalFile) => void;
}

export interface PresencesDeclareAbsenceScreenNavParams {
  childName?: string;
}

export interface PresencesDeclareAbsenceScreenPrivateProps
  extends NativeStackScreenProps<PresencesNavigationParams, 'declareAbsence'>,
    PresencesDeclareAbsenceScreenProps {
  // @scaffolder add HOC props here
}
