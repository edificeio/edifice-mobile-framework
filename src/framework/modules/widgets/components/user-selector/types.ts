import type { ColorValue } from 'react-native';

import type { SvgIconName } from '~/framework/components/picture';
import type { TabLayout } from '~/framework/modules/widgets/components/panel';

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
  /** Alone, a tab has nothing to switch to, so it stops answering to presses. */
  selectable: boolean;
  selected: boolean;
  onMeasure: (id: string, layout: TabLayout) => void;
}
