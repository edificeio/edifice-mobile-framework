import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  backgroundContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 0,
  },
  container: {
    position: 'relative',
    width: '100%',
  },
  contentContainer: {
    position: 'relative',
    width: '100%',
    zIndex: 3,
  },
  headerContainerHidden: {
    backgroundColor: theme.palette.grey.white,
    height: getScaleWidth(164),
  },
  headerContainerHiddenInner: {
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: getScaleWidth(38),
  },
  headerContainerVisible: {
    backgroundColor: theme.palette.primary.pale,
    borderBottomWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.primary.light,
    borderTopWidth: UI_SIZES.border.thin,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.medium,
  },
  svgBackground: {
    position: 'absolute',
  },
  visibilityIndicatorBorder: {
    position: 'absolute',
  },
  visibilityIndicatorContainer: {
    backgroundColor: theme.palette.grey.fog,
    left: UI_SIZES.spacing.big,
    position: 'absolute',
    top: 0,
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
});
