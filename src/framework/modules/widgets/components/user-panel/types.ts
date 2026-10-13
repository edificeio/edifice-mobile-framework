import type { PropsWithChildren } from 'react';
import type { ColorValue } from 'react-native';

import type { WidgetPlaceholderProps } from '~/framework/modules/widgets/components/types';
import type { WidgetUserSelectorItem } from '~/framework/modules/widgets/components/user-selector';

export type WidgetUserPanelProps = PropsWithChildren<
  WidgetPlaceholderProps & {
    background: ColorValue;
    border: ColorValue;
    users: WidgetUserSelectorItem[];
    selectedId?: string;
    onSelect: (id: string) => void;
    actionTestID: string;
  }
>;

export type WidgetUserPanelPlaceholderProps = PropsWithChildren<WidgetPlaceholderProps>;
