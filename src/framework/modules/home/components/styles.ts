import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

/**
 * Frame shared by the news card and the notification preview: a colored block, a header, and the
 * content on white. Colors and sizes stay in their own styles, laid over these ones.
 */
export default StyleSheet.create({
  block: {
    borderRadius: UI_SIZES.radius.extraLarge,
    gap: UI_SIZES.spacing.tiny,
    padding: UI_SIZES.spacing.tiny,
  },
  blockBody: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.large,
    gap: UI_SIZES.spacing.tiny,
    padding: UI_SIZES.spacing.small,
  },
  blockHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
});
