import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_VALUES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.selector,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: UI_SIZES.spacing.medium,
    // Kept narrow so the longest week labels read at full size instead of being shrunk to fit.
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.small,
  },
  disabledContainer: {
    opacity: UI_VALUES.opacity.half,
  },
  weekText: {
    flex: 1,
    textAlign: 'center',
  },
  weekTextContainer: {
    alignItems: 'center',
    flex: 1,
  },
});
