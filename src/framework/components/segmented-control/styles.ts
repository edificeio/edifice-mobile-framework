import { PixelRatio, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const LOADER_HEIGHT =
  TextSizeStyle.Normal.lineHeight * PixelRatio.getFontScale() + UI_SIZES.spacing.minor * 2 + UI_SIZES.spacing.tiny * 2;

// The width a segment is drawn at while it loads, which is the one the design gives a segment.
const SEGMENT_WIDTH = getScaleWidth(124);

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
  // The width travels down from the parent to the segments, one level per style. A segment never
  // drops below its own, so enough of them overflow the row and it scrolls.
  fullWidthContent: {
    flexGrow: 1,
  },
  fullWidthItem: {
    flexGrow: 1,
    width: SEGMENT_WIDTH,
  },
  // The frame moves up to the scroll view, which stays put, the row being the part that travels.
  fullWidthRow: {
    borderWidth: 0,
    flexGrow: 1,
  },
  fullWidthScrollView: {
    alignSelf: 'stretch',
    borderColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.input,
    borderWidth: UI_SIZES.border.thin,
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
    width: SEGMENT_WIDTH,
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
