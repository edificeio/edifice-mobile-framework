import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: UI_SIZES.spacing.large,
  },

  activeDot: {
    backgroundColor: theme.palette.primary.regular,
  },
  animation: {
    height: getScaleWidth(180),
    width: getScaleWidth(180),
  },
  container: {
    maxHeight: UI_SIZES.screen.height * 0.8,
    minHeight: UI_SIZES.screen.height * 0.7,
    paddingHorizontal: 0,
    paddingTop: UI_SIZES.screen.topInset + UI_SIZES.spacing.big,
  },
  containerSlide: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.tiny,
  },
  description: {
    color: theme.palette.grey.darkness,
    fontSize: TextSizeStyle.Normal.fontSize,
    marginTop: UI_SIZES.spacing.small,
    textAlign: 'center',
  },
  dot: {
    backgroundColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.newCard,
    height: UI_SIZES.spacing.small,
    marginHorizontal: UI_SIZES.spacing.medium,
    width: UI_SIZES.spacing.small,
  },
  navButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  navButtonPrimary: {
    color: theme.palette.grey.graphite,
  },
  navButtonText: {
    color: theme.palette.primary.regular,
    fontSize: getScaleWidth(14),
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: UI_SIZES.spacing.minor,
  },
  title: {
    marginVertical: UI_SIZES.spacing.small,
    textAlign: 'center',
  },
});
