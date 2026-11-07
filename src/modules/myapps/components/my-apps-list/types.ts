import type { Ref } from 'react';

import type { FlashListRef } from '@shopify/flash-list';

import type { ListedApp } from '~/modules/myapps/model';

export interface MyAppsListProps {
  apps: ListedApp[];
  isAllAppsFilter: boolean;
  onPressApp: (item: ListedApp) => void;
  onLongPressApp?: (item: ListedApp) => void;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  emptyScreenConfig: { text: string; title: string; testID?: string };
  /** The list (scroll to the top…). */
  ref?: Ref<FlashListRef<MyAppsListItem>>;
}

export type MyAppsListItem = { type: 'app'; item: ListedApp } | { type: 'separator' };
