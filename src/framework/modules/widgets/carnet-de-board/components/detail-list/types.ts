import type { StyleProp, ViewStyle } from 'react-native';

import type { CarnetDeBordDetailItem } from '~/framework/modules/widgets/carnet-de-board/model';

export interface CarnetDeBordDetailListProps {
  items: CarnetDeBordDetailItem[];
  style?: StyleProp<ViewStyle>;
}

export interface CarnetDeBordDetailRowProps {
  item: CarnetDeBordDetailItem;
}
