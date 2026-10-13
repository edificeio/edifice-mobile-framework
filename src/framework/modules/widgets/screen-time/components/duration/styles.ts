import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, UI_SIZES } from '~/framework/components/constants';
import { getLineHeight } from '~/framework/components/text';

export default StyleSheet.create({
  day: {
    flex: 1,
    gap: UI_SIZES.spacing.tiny,
  },
  duration: {
    fontSize: getScaleFontSize(22),
  },
  placeholderDuration: {
    marginTop: UI_SIZES.spacing.tiny,
  },
  placeholderValue: {
    height: getLineHeight('Medium'),
  },
  root: {
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.complementary.yellow.light,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    margin: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.small,
  },
});
