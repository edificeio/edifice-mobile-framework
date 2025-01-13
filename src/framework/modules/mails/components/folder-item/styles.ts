import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  containerFolders: {
    padding: UI_SIZES.spacing.minor,
    borderWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.input,
    rowGap: UI_SIZES.spacing.tiny,
  },
  container: {
    borderRadius: UI_SIZES.radius.selector,
    columnGap: UI_SIZES.spacing.small,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  isSelected: {
    backgroundColor: theme.palette.primary.pale,
  },
  disabled: {
    backgroundColor: theme.palette.grey.pearl,
  },
  text: {
    flex: 1,
  },
  nbUnread: {
    backgroundColor: theme.palette.secondary.regular,
    paddingHorizontal: UI_SIZES.spacing.minor,

    borderRadius: UI_SIZES.radius.big,
    flexDirection: 'row',
  },
  nbUnreadText: {
    color: theme.palette.grey.white,
  },
});
