import { IClassCallStudent } from '~/framework/modules/viescolaire/presences/model';

export interface StudentListItemProps {
  student: IClassCallStudent;
  isSelected?: boolean;
  onPress: () => void;
}
