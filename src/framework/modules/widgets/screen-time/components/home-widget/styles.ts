import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  day: {
    flex: 1,
    gap: UI_SIZES.spacing.tiny,
  },
  duration: {
    fontSize: getScaleFontSize(22),
  },
  durations: {
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.complementary.yellow.light,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    margin: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.small,
  },
  empty: {
    justifyContent: 'center',
    paddingVertical: UI_SIZES.spacing.big,
  },
  emptyText: {
    flex: 1,
    textAlign: 'center',
  },
  placeholderDuration: {
    marginTop: UI_SIZES.spacing.tiny,
  },
});
