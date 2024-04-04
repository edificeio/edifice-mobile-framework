import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    borderRadius: UI_SIZES.radius.mediumPlus,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
    backgroundColor: theme.ui.background.card,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowColor: theme.ui.shadowColor,
    shadowOpacity: 0.15,
    elevation: 4,
  },
  iconContainer: {
    backgroundColor: theme.palette.primary.pale,
    padding: UI_SIZES.spacing.small,
    borderRadius: UI_SIZES.radius.huge,
  },
  text: { marginLeft: UI_SIZES.spacing.medium },
});
