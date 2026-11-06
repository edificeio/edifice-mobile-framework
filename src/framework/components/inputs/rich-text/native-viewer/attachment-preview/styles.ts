import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';

export const ATTACHMENT_ICON_SIZE = UI_SIZES.elements.icon.medium;

export default StyleSheet.create({
  container: {
    ...UI_STYLES.clickZone,
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.elements.border.thin,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
  },
  name: {
    flexShrink: 1,
  },
});
