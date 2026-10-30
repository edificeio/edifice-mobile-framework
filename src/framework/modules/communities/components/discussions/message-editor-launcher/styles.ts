import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  fakeInput: {
    height: UI_SIZES.elements.avatar.md,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.small,
  },
  placeholder: { color: theme.palette.grey.graphite },
  root: {
    alignItems: 'flex-end',
    backgroundColor: theme.ui.background.card,
    borderTopColor: theme.palette.grey.cloudy,
    borderTopWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.medium,
  },
});
