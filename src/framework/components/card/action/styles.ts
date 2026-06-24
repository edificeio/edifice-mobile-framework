import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.elements.border.thin,
    gap: UI_SIZES.spacing.medium,
    overflow: 'hidden',
    paddingVertical: UI_SIZES.spacing.big,
    width: getScaleWidth(327),
  },
  description: {
    color: theme.palette.grey.graphite,
    textAlign: 'center',
  },
  illustration: {
    height: getScaleWidth(80),
    width: getScaleWidth(150),
  },
  textContainer: {
    alignItems: 'center',
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  title: {
    textAlign: 'center',
  },
});
