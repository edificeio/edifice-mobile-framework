import type { AppsInfoAggregated } from '~/framework/modules/myapps/types';

export interface FavoriteReorderItemProps {
  app: AppsInfoAggregated;
  isActive: boolean;
  isPlaceholder?: boolean;
  onDrag?: () => void;
}
