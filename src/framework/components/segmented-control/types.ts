import type { StyleProp, ViewStyle } from 'react-native';

export interface SegmentedItemProps {
  count?: number;
  id: string;
  isActive: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  text: string;
}

export interface SegmentedControlProps {
  canUnselect?: boolean;
  fullWidth?: boolean;
  initialSelectedIndex?: number;
  onChange?: (index?: number) => void;
  segments: Pick<SegmentedItemProps, 'id' | 'count' | 'text'>[];
}
