import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  backgroundContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 0,
  },
  backgroundContainerHidden: {
    backgroundColor: theme.palette.grey.white,
  },
  backgroundContainerVisible: {
    backgroundColor: theme.palette.primary.pale,
    borderBottomWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.primary.light,
    borderTopWidth: UI_SIZES.border.thin,
  },
  backgroundPatternContainer: {
    height: '100%',
    overflow: 'hidden',
    paddingVertical: UI_SIZES.border.small,
    width: '100%',
  },
  container: {
    paddingBottom: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.medium,
    position: 'relative',
    width: '100%',
  },
  content: { alignItems: 'stretch', gap: UI_SIZES.spacing.minor },
  placeholderStyle: {
    backgroundColor: theme.palette.grey.fog,
    borderBottomWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
    borderTopWidth: UI_SIZES.border.thin,
    marginVertical: -1,
  },
  svgLowerLine: {
    bottom: 0,
    position: 'absolute',
  },
  svgUpperLine: {
    position: 'absolute',
    top: 0,
  },
  visibilityIconContainer: {
    height: UI_SIZES.elements.icon.xsmall,
    width: UI_SIZES.elements.icon.xsmall,
  },
  visibilityIndicator: {
    backgroundColor: theme.palette.grey.fog,
    borderBottomLeftRadius: UI_SIZES.radius.medium,
    borderBottomRightRadius: UI_SIZES.radius.medium,
  },
  visibilityIndicatorBorder: {
    height: '100%',
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  visibilityIndicatorContainer: {
    left: UI_SIZES.spacing.big,
    pointerEvents: 'none',
    position: 'absolute',
    top: UI_SIZES.border.small,
    zIndex: 1,
  },
  visibilityIndicatorInner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    paddingBottom: UI_SIZES.spacing.tiny,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.tiny,
  },
  visibilityIndicatorText: {
    color: theme.palette.complementary.blue.regular,
  },
});
