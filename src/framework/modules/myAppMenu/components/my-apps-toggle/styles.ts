import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.grey,
    borderRadius: UI_SIZES.radius.newCard,
    borderWidth: 1,
    height: UI_SIZES.spacing.big,
    justifyContent: 'center',
    width: getScaleWidth(34),
  },
  containerChecked: {
    backgroundColor: theme.palette.primary.regular,
    borderColor: theme.palette.primary.regular,
  },
  thumb: {
    backgroundColor: theme.palette.grey.stone,
    borderRadius: getScaleWidth(UI_SIZES.dimensions.width.smallPlus) / 2,
    height: getScaleWidth(UI_SIZES.dimensions.height.smallPlus),
    width: getScaleWidth(UI_SIZES.dimensions.width.smallPlus),
  },
  thumbChecked: {
    backgroundColor: theme.palette.grey.white,
  },
});

const CONTAINER_WIDTH = getScaleWidth(34);
const CONTAINER_BORDER = 1;

const INNER_SPACING = 2;

const THUMB_SIZE = getScaleWidth(UI_SIZES.dimensions.width.smallPlus);

export const TRANSLATE_X_OFF = INNER_SPACING;
export const TRANSLATE_X_ON = CONTAINER_WIDTH - THUMB_SIZE - INNER_SPACING - CONTAINER_BORDER * 2;
