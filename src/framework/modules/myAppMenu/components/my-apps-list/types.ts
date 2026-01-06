import { AppsInfoAggregated } from '~/framework/modules/myapps/types';

export interface MyAppsListProps {
  apps: AppsInfoAggregated[];
  isFavoritesFilter: boolean;
  onPressApp: (app: AppsInfoAggregated) => void;
  onLongPressApp?: (app: AppsInfoAggregated) => void;
  emptyScreenConfig: { text: string; title: string };
}

export type MyAppsListItem = { type: 'app'; app: AppsInfoAggregated } | { type: 'separator' };
