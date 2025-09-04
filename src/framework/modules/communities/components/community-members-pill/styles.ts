import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  membersText: {
    marginLeft: UI_SIZES.spacing.tiny,
  },
  pillContainer: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.extraLarge,
    flexDirection: 'row',
    justifyContent: 'center',
    left: UI_SIZES.spacing.minor,
    opacity: 0.95,
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.tiny,
    position: 'absolute',
    top: UI_SIZES.spacing.minor,
  },
});
