import { ViewStyle } from 'react-native';

import { EventType, IClassCallStudent } from '~/framework/modules/viescolaire/presences/model';

export interface StudentStatusProps {
  hasAbsenceReasons: boolean;
  student?: IClassCallStudent;
  style?: ViewStyle;
  createAbsence: (studentId: string) => Promise<void>;
  deleteAbsence: (eventId: number) => Promise<void>;
  dismissBottomSheet: () => void;
  openEvent: (student: IClassCallStudent, type: EventType) => void;
}
