import { AppsInfoAggregated } from '~/framework/modules/myapps/types';

export type MyAppsCardProps = {
  app: AppsInfoAggregated;
  onPress?: () => void;
  onLongPress?: () => void;
};
