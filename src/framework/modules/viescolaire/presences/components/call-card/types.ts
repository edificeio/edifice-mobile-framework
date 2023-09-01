import type { ColorValue } from 'react-native';

import type { ICourse } from '~/framework/modules/viescolaire/presences/model';

export interface CallCardProps {
  course: ICourse;
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
