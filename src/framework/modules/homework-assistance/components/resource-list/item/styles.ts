import { StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const CARD_WIDTH = getScaleWidth(190);
export const CARD_HEIGHT = getScaleWidth(100);

export default StyleSheet.create({
  imageContainer: {
    width: getScaleWidth(60),
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    padding: UI_SIZES.spacing.minor,
    columnGap: UI_SIZES.spacing.minor,
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'column',
  },
});
