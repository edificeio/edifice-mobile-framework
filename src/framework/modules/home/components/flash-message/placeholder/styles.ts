import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { PLACEHOLDER_LINE_HEIGHT } from '~/framework/modules/home/components/constants';

/** The card stands for a message of any length, so it holds a height of its own. */
const CARD_HEIGHT = getScaleWidth(162);

export default StyleSheet.create({
  button: {
    alignSelf: 'flex-end',
    borderRadius: UI_SIZES.radius.huge,
    height: getScaleWidth(36),
    // Sits at the bottom of the card, where the real one is.
    marginTop: 'auto',
    width: getScaleWidth(100),
  },
  card: {
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.extraLarge,
    borderWidth: UI_SIZES.border.small,
    height: CARD_HEIGHT,
    paddingBottom: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingTop: UI_SIZES.spacing.small,
  },
  header: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },
  icon: {
    // A placeholder line carries a bottom margin of its own, which the gap already provides.
    marginBottom: 0,
  },
  lastLine: {
    height: PLACEHOLDER_LINE_HEIGHT,
    marginBottom: 0,
  },
  line: {
    height: PLACEHOLDER_LINE_HEIGHT,
    marginBottom: UI_SIZES.spacing.tiny,
  },
  lines: {
    flex: 1,
  },
});
