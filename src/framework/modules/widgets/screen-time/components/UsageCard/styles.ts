import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  cardTitle: {
    color: theme.palette.grey.black,
    flex: 1,
  },
  durationText: {
    color: theme.palette.primary.regular,
    fontSize: getScaleFontSize(20),
  },
  titleRow: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  usageCard: {
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.cloudy,
    borderLeftWidth: 4,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    flexBasis: '48%',
    padding: UI_SIZES.spacing.medium,
  },
  usageCardToday: {
    borderLeftColor: theme.palette.complementary.green.regular,
  },
  usageCardYesterday: {
    borderLeftColor: theme.palette.complementary.orange.regular,
  },
});
