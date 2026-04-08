import { ColorValue, StyleProp, ViewStyle } from 'react-native';

export interface SearchBarProps {
  query: string;
  containerStyle?: StyleProp<ViewStyle>;
  placeholder?: string;
  onChangeQuery: (value: string) => void;
  onClear?: () => void;
  onSearch?: () => void;
}

export type SearchBarHandle = {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
};

export type SearchBarPropsWithFocus = SearchBarProps & {
  onFocusChange?: (focused: boolean) => void;
  forceUnfocusedStyle?: boolean;
  clearButtonCustomColor?: ColorValue;
};
