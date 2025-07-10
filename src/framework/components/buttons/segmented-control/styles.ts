import { PixelRatio, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const LOADER_HEIGHT =
  TextSizeStyle.Normal.lineHeight * PixelRatio.getFontScale() + UI_SIZES.spacing.minor * 2 + UI_SIZES.spacing.tiny * 2;

const LOADER_WIDTH = getScaleWidth(124);

export const styles = StyleSheet.create({
  activeContainer: {
    backgroundColor: theme.palette.primary.pale,
  },
  container: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.medium,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.tiny,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  inactiveContainer: {
    backgroundColor: theme.palette.grey.white,
  },
  loaderContainer: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    flexShrink: 1,
    justifyContent: 'center',
  },
  loaderContent: {
    borderRadius: UI_SIZES.radius.input,
    height: LOADER_HEIGHT,
    width: LOADER_WIDTH,
  },
  scrollContainer: {
    borderColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.input,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.tiny,
  },
});
