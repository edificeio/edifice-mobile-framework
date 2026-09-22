import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { COLLAPSIBLE_SMALL_HEIGHT } from '~/framework/modules/communities/components/discussions/header/styles';

export const SCROLL_INDICATOR_INSETS = { top: COLLAPSIBLE_SMALL_HEIGHT };

export default StyleSheet.create({
  firstMessage: {
    paddingBottom: UI_SIZES.spacing.big,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.large,
  },
  listFooterLoader: {
    alignItems: 'center',
    paddingVertical: UI_SIZES.spacing.medium,
  },
  root: { flex: 1 },
});
