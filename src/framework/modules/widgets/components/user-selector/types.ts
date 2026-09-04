import type { ColorValue } from 'react-native';

import type { SvgIconName } from '~/framework/components/picture';
import type { TabLayout } from '~/framework/modules/widgets/components/tabbed-panel';

export interface WidgetUserSelectorItem {
  id: string;
  name: string;
  /** Whose avatar to show, which is not always the id the selection runs on. */
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
  /** Shown at the end of the row once some items are left out. */
  action?: WidgetUserSelectorAction;
  /** How many items fit the row before the action takes over. Two by default. */
  maxShown?: number;
  /** Ring around the avatar of the selected item, matching the shape it stands on. */
  ringColor: ColorValue;
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
