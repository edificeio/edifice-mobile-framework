import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  externalView: {
    flex: 0,
    borderLeftWidth: UI_SIZES.radius.card,
    borderRadius: UI_SIZES.radius.card,

    // Color is meant to be raffected in component
    borderLeftColor: theme.palette.status.info.regular,
  },
  internalView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopRightRadius: UI_SIZES.radius.card,
    borderBottomRightRadius: UI_SIZES.radius.card,
    borderWidth: 1,
    borderLeftWidth: 0,
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,

    // Color is meant to be raffected in component
    borderColor: theme.palette.status.info.pale,
  },
  contentView: {
    flex: 1,
  },
  iconView: {
    marginRight: UI_SIZES.spacing.small,
  },
});
