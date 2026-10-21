import { AppsInfoAggregated } from '~/framework/modules/myapps/types';

export interface MyAppsListProps {
  apps: AppsInfoAggregated[];
  isAllAppsFilter: boolean;
  onPressApp: (app: AppsInfoAggregated) => void;
  onLongPressApp?: (app: AppsInfoAggregated) => void;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  emptyScreenConfig: { text: string; title: string; testID?: string };
}

export type MyAppsListItem = { type: 'app'; app: AppsInfoAggregated } | { type: 'separator' };
