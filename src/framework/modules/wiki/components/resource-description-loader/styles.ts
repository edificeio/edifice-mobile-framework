import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const CARD_WIDTH = 327;
const CARD_HEIGHT = 104;

export const styles = StyleSheet.create({
  resourceLoaderContent: {
    alignSelf: 'center',
    borderBottomWidth: 0,
    borderColor: theme.palette.grey.white,
    borderLeftWidth: 0,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderWidth: UI_SIZES.elements.border.large,
    height: getScaleWidth(CARD_HEIGHT),
    margin: -UI_SIZES.spacing.big,
    width: getScaleWidth(CARD_WIDTH),
  },
});
