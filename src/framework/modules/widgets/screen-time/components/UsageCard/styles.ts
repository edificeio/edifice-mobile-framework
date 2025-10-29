import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  cardTitle: {
    color: theme.palette.grey.black,
    flex: 1,
  },
  durationText: {
    color: theme.palette.primary.regular,
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleRow: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginBottom: UI_SIZES.spacing.small,
  },
  usageCard: {
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    flexBasis: '48%',
    padding: UI_SIZES.spacing.medium,
    shadowColor: theme.palette.grey.black,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
