import type { ColorValue } from 'react-native';

import type { Course } from '~/framework/modules/viescolaire/presences/model';

export interface CallCardProps {
  course: Course;
  disabled?: boolean;
  showStatus?: boolean;
  onPress?: () => void;
}

export interface CallCardStyle {
  borderColor: ColorValue;
  borderWidth: number;
  textColor: ColorValue;
  status?: {
    backgroundColor: ColorValue;
    iconColor: ColorValue;
    iconName: string;
  };
}
