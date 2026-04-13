import { ReactVideoSourceProperties } from 'react-native-video';

import { FileMedia } from '~/framework/util/media';

export interface PlayerItemProps {
  hideNavBar: () => void;
  itemIndex: number;
  isCurrentItem: boolean;
  item: FileMedia;
  onInitialMediaLoad?: () => void;
  showNavBar: () => void;
  source: ReactVideoSourceProperties;
}
