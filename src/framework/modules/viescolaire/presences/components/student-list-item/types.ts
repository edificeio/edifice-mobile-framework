import { CallState, CallStudent } from '~/framework/modules/viescolaire/presences/model';

export interface StudentListItemProps {
  callState: CallState;
  student: CallStudent;
  isSelected?: boolean;
  onPress: () => void;
}
