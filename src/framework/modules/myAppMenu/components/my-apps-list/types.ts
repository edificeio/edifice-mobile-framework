import { AppsInfoAggregated } from '~/framework/modules/myapps/types';

export interface MyAppsListProps {
  apps: AppsInfoAggregated[];
  onPressApp: (app: AppsInfoAggregated) => void;
  onLongPressApp?: (app: AppsInfoAggregated) => void;
}
