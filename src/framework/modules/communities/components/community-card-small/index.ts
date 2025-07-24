import { CommunityCardSmall } from './component';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const SMALL_CARD_METRICS = {
  imgHeight: getScaleWidth(80),
  maxBorderWidth: UI_SIZES.border.small,
  titlePadding: UI_SIZES.spacing.small,
};

export default CommunityCardSmall;
