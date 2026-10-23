import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const ICON_CONTAINER_SIZE = UI_SIZES.elements.icon.mediumlarge;

export default StyleSheet.create({
  header: {
    justifyContent: 'center',
    minHeight: ICON_CONTAINER_SIZE,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: ICON_CONTAINER_SIZE / 2,
    height: ICON_CONTAINER_SIZE,
    justifyContent: 'center',
    width: ICON_CONTAINER_SIZE,
  },

  step: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },

  stepContainer: {
    flex: 1,
    gap: UI_SIZES.spacing.minor,
    paddingBottom: UI_SIZES.spacing.medium,
  },
  stepLine: {
    flex: 1,
    width: UI_SIZES.border.small,
  },
  title: TextSizeStyle.Big,
  track: {
    alignItems: 'center',
  },
});
