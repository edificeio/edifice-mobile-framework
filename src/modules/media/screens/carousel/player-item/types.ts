import { ReactVideoSourceProperties } from 'react-native-video';

import { FileMedia } from '~/modules/media/types';

export interface PlayerItemProps {
  hideNavBar: () => void;
  isCurrentItem: boolean;
  isPlayerLoadTimeout: boolean;
  item: FileMedia;
  itemIndex: number;
  onInitialMediaLoad?: () => void;
  setIsPlayerError: (isError: boolean) => void;
  setIsPlayerLoadTimeout: (isTimeout: boolean) => void;
  showNavBar: () => void;
  source: ReactVideoSourceProperties;
}
