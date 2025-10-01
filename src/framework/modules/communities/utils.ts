import { ViewStyle } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export const getItemSeparatorStyle = (index: number, totalLength: number, separatorStyle: ViewStyle) => {
  const isLastItem = index === totalLength - 1;
  return isLastItem ? undefined : separatorStyle;
};

export const ESTIMATED_LIST_SIZE = {
  height: UI_SIZES.getViewHeight(),
  width: UI_SIZES.screen.width,
};
