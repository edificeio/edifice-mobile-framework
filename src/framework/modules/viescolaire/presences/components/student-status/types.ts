import { ViewStyle } from 'react-native';

import { CallEventType, CallStudent } from '~/framework/modules/viescolaire/presences/model';

export interface StudentStatusProps {
  hasAbsenceReasons: boolean;
  student?: CallStudent;
  style?: ViewStyle;
  createAbsence: (studentId: string) => Promise<void>;
  deleteAbsence: (eventId: number) => Promise<void>;
  dismissBottomSheet: () => void;
  openEvent: (student: CallStudent, type: CallEventType) => void;
}
