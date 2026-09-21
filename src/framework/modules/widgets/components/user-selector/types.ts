import type { Ref } from 'react';
import type { ColorValue, View } from 'react-native';

import type { SvgIconName } from '~/framework/components/picture';

export interface WidgetUserSelectorItem {
  id: string;
  name: string;
  userId: string;
}

export interface WidgetUserSelectorAction {
  icon: SvgIconName;
  testID?: string;
}

export interface WidgetUserSelectorProps {
  items: WidgetUserSelectorItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  action?: WidgetUserSelectorAction;
  maxShown?: number;
  ringColor: ColorValue;
}

export interface WidgetUserSelectorPlaceholderProps {
  count?: number;
}

export interface WidgetUserSelectorTabProps extends Pick<WidgetUserSelectorProps, 'onSelect' | 'ringColor'> {
  item: WidgetUserSelectorItem;
  ref?: Ref<View>;
  /** Alone, a tab has nothing to switch to, so it stops answering to presses. */
  selectable: boolean;
  selected: boolean;
}
