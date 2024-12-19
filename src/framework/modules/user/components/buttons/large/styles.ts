import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.mediumPlus,
    elevation: 4,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  iconContainer: {
    backgroundColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.huge,
    padding: UI_SIZES.spacing.small,
  },
  text: { marginLeft: UI_SIZES.spacing.medium },
});
