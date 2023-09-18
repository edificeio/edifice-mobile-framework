import { CallStudent } from '~/framework/modules/viescolaire/presences/model';

export interface StudentListItemProps {
  student: CallStudent;
  isSelected?: boolean;
  onPress: () => void;
}
