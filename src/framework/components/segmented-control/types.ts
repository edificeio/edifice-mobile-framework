import { ColorValue } from 'react-native';

export interface SegmentedItemProps {
  badgeColor?: ColorValue;
  count?: number;
  id: string;
  isActive: boolean;
  onPress: () => void;
  testID?: string;
  text: string;
}

export interface SegmentedControlLoaderProps {
  isFullWidth?: boolean;
}

export interface SegmentedControlProps {
  canUnselect?: boolean;
  initialSelectedIndex?: number;
  onChange?: (index?: number) => void;
  segments: Pick<SegmentedItemProps, 'badgeColor' | 'id' | 'count' | 'text'>[];
}
