import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  closeUnderMenu: {
    backgroundColor: theme.palette.primary.pale,
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.minor + UI_SIZES.spacing.tiny,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeUnderMenuCross: {
    backgroundColor: theme.palette.primary.regular,
    padding: UI_SIZES.spacing.tiny,
    borderRadius: UI_SIZES.radius.huge,
    marginRight: UI_SIZES.spacing.minor,
  },
});

export default styles;
