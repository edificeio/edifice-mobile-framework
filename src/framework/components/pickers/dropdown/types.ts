import { DropDownPickerProps } from 'react-native-dropdown-picker';

export type DropdownSize = 'big' | 'medium';

export type DropdownType = 'ghost' | 'outline';

export type DropdownPickerProps<T> = DropDownPickerProps<T> & {
  iconName?: string;
  size?: DropdownSize;
  type?: DropdownType;
};
