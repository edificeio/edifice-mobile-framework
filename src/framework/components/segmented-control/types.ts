export interface SegmentedItemProps {
  id: string;
  count: number;
  text: string;
  isActive: boolean;
  onPress: () => void;
}

export interface SegmentedControlProps {
  initialSelectedIndex?: number;
  segments: Pick<SegmentedItemProps, 'id' | 'count' | 'text'>[];
  onChange?: (index?: number) => void;
  canUnselect?: boolean;
}
