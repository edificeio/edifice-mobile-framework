import type { ColorValue } from 'react-native';

import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import type { SvgIconName } from '~/framework/components/picture';

export interface NotificationFilterItem {
  color?: ColorValue;
  icon?: SvgIconName;
  id: string;
  labelI18n: string;
}

export type NotificationFilterSelection = Record<string, boolean>;

export interface NotificationFiltersTemplateProps {
  items: readonly NotificationFilterItem[];
  labelsI18n: {
    leaveAlertText: string;
    leaveAlertTitle: string;
    selectAll: string;
    selectedCount: string;
  };
  navigation: NavigationProp<ParamListBase>;
  onSave: (selection: NotificationFilterSelection) => void | Promise<void>;
  savedSelection: NotificationFilterSelection;
}

export interface NotificationFilterRowProps extends NotificationFilterItem {
  checked: boolean;
  onPress: (id: string) => void;
}
