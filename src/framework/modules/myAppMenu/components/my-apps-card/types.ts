import { ImageSourcePropType } from 'react-native';

import { AppsInfoAggregated } from '~/framework/modules/myapps/types';

export type MyAppsCardProps = {
  app: AppsInfoAggregated;
  onPress?: () => void;
  onLongPress?: () => void;
  isAllAppsFilter?: boolean;
};

export type AppIcon =
  | { type: 'svg'; name: string }
  | { type: 'svg-uri'; uri: string }
  | { type: 'image'; source: ImageSourcePropType }
  | { type: 'fallback' };
