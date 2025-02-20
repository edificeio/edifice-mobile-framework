import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.selector,
    columnGap: UI_SIZES.spacing.small,
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  containerFolders: {
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.input,
    borderWidth: UI_SIZES.border.thin,
    padding: UI_SIZES.spacing.minor,
    rowGap: UI_SIZES.spacing.tiny,
  },
  disabled: {
    backgroundColor: theme.palette.grey.pearl,
  },
  isSelected: {
    backgroundColor: theme.palette.primary.pale,
  },
  nbUnread: {
    backgroundColor: theme.palette.secondary.regular,
    borderRadius: UI_SIZES.radius.big,

    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
  nbUnreadText: {
    color: theme.palette.grey.white,
  },
  text: {
    flex: 1,
  },
});
