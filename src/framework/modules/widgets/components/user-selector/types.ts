import type { ColorValue } from 'react-native';

import type { SvgIconName } from '~/framework/components/picture';
import type { TabLayout } from '~/framework/modules/widgets/components/tabbed-panel';

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
  selected: boolean;
  onMeasure: (id: string, layout: TabLayout) => void;
}
