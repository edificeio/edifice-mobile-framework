import * as React from 'react';
import { ColorValue } from 'react-native';

import { FlashListProps } from '@shopify/flash-list';

import { SvgIconName } from '~/framework/components/picture';

export type StepperProps<ItemT> = Omit<
  FlashListProps<StepperRow<ItemT>>,
  'data' | 'getItemType' | 'keyExtractor' | 'renderItem'
> & {
  keyExtractor?: (item: ItemT, index: number) => string;
  renderItem: (info: StepperRenderItemInfo<ItemT>) => React.ReactElement | null;
  sections: readonly StepperSection<ItemT>[];
};

export interface StepperRenderItemInfo<ItemT> {
  index: number;
  item: ItemT;
  section: StepperSection<ItemT>;
}

export type StepperRow<ItemT> =
  | { type: 'header'; section: StepperSection<ItemT> }
  | { index: number; isLast: boolean; item: ItemT; section: StepperSection<ItemT>; type: 'item' };

export interface StepperSection<ItemT> {
  color: ColorValue;
  data: readonly ItemT[];
  icon?: SvgIconName;
  key: string;
  title: string;
}
