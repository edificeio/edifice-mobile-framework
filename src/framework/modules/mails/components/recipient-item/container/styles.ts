import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export const HEIGHT_RECIPIENT_CONTAINER = UI_SIZES.spacing.minor * 2 + TextSizeStyle.Normal.lineHeight * 2;

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.tiny,
    paddingVertical: UI_SIZES.spacing.minor,
    zIndex: -1,
  },
  containerSelected: {
    paddingRight: UI_SIZES.spacing.tiny + UI_SIZES.elements.icon.small,
  },
  selectedView: {
    alignItems: 'flex-end',
    backgroundColor: theme.palette.grey.white,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 999,
  },
});
