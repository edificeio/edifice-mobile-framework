import { StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const CARD_WIDTH = getScaleWidth(150);

export default StyleSheet.create({
  imageContainer: {
    height: getScaleWidth(50),
    width: getScaleWidth(50),
  },
  mainContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    padding: UI_SIZES.spacing.minor,
    rowGap: UI_SIZES.spacing.tiny,
  },
  nameText: {
    flexShrink: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
  },
});
