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

export interface AnchorLayout {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface WidgetUserSelectorMenuItemProps {
  item: WidgetUserSelectorItem;
  onSelect: (id: string) => void;
}

export interface WidgetUserSelectorMenuProps extends Pick<WidgetUserSelectorMenuItemProps, 'onSelect'> {
  anchor?: AnchorLayout;
  items: WidgetUserSelectorItem[];
  onClose: () => void;
}

export interface WidgetUserSelectorTabProps extends Pick<WidgetUserSelectorProps, 'onSelect' | 'ringColor'> {
  item: WidgetUserSelectorItem;
  selected: boolean;
  onMeasure: (id: string, layout: TabLayout) => void;
}
