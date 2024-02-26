import { ViewStyle } from 'react-native';

import { CallEventType, CallStudent } from '~/framework/modules/viescolaire/presences/model';

export interface StudentStatusProps {
  hasAbsenceViewAccess: boolean;
  student?: CallStudent;
  style?: ViewStyle;
  exemption_attendance?: boolean;
  lastCourseAbsent?: boolean;
  createAbsence: (studentId: string) => Promise<void>;
  deleteAbsence: (eventId: number) => Promise<void>;
  dismissBottomSheet: () => void;
  openEvent: (student: CallStudent, type: CallEventType) => void;
}
