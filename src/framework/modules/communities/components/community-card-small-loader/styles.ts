import { PixelRatio, StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';
import { SMALL_CARD_METRICS } from '~/framework/modules/communities/components/community-card-small';

export const styles = StyleSheet.create({
  card: {
    borderRadius: UI_SIZES.radius.mediumPlus,
    height:
      TextSizeStyle.Medium.lineHeight * PixelRatio.getFontScale() +
      SMALL_CARD_METRICS.imgHeight +
      2 * (SMALL_CARD_METRICS.maxBorderWidth + SMALL_CARD_METRICS.titlePadding),
    width: '100%',
  },
  cardContainer: {
    marginHorizontal: UI_SIZES.spacing.big,
  },
});
