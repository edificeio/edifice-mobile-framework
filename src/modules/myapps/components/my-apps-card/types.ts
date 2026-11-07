import type { ImageSourcePropType } from 'react-native';

import type { ListedApp } from '~/modules/myapps/model';

export type MyAppsCardProps = {
  item: ListedApp;
  /** Given the app of the card: the same function for every card (the card is memoized). */
  onPress?: (item: ListedApp) => void;
  onLongPress?: (item: ListedApp) => void;
};

/** How to show the icon of an app (see `resolveAppIcon`). */
export type AppIcon =
  | { type: 'svg'; name: string }
  | { type: 'svg-uri'; uri: string }
  | { type: 'image'; source: ImageSourcePropType }
  | { type: 'fallback' };
