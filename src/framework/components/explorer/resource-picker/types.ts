import * as React from 'react';
import { ColorValue } from 'react-native';

export interface ResourcePickerProps {
  data: any[];
  defaultThumbnail: { name: string; fill: ColorValue; background: ColorValue };
  emptyComponent: React.ComponentType;
  onPressItem: (item) => void;
  onRefresh: () => void;
}

export interface ResourcePickerState {
  isRefreshing: boolean;
}
