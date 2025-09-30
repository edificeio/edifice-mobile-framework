import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.huge,
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
});
