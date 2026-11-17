import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SHADOWS, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  card: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.extraLarge,
    boxShadow: UI_SHADOWS.card,
    gap: UI_SIZES.spacing.minor,
    paddingBottom: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.minor,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: theme.palette.grey.black.toString(),
    flex: 1,
  },
});
