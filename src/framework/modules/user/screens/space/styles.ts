import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  animation: {
    height: 80,
    position: 'absolute',
    top: 0,
    width: UI_SIZES.screen.width - UI_SIZES.spacing.big * 2,
  },
  button: {
    marginBottom: UI_SIZES.spacing.huge * 2,
  },
  content: {
    backgroundColor: theme.palette.secondary.dark,
    paddingHorizontal: UI_SIZES.spacing.large,
  },
  pic: {
    alignSelf: 'center',
    height: getScaleWidth(120),
    marginTop: UI_SIZES.spacing.major,
    width: getScaleWidth(120),
  },
  svgEdi: {
    alignSelf: 'center',
    bottom: 0,
    position: 'absolute',
    zIndex: -1,
  },
  svgMoon: {
    position: 'absolute',
    right: -UI_SIZES.spacing.large,
    top: getScaleWidth(340),
  },
  svgRocket: {
    position: 'absolute',
    right: -UI_SIZES.spacing.large,
    top: 0,
  },
  svgStar1: {
    bottom: getScaleWidth(68),
    left: -UI_SIZES.spacing.large,
    position: 'absolute',
  },
  svgStar2: {
    bottom: getScaleWidth(24),
    left: 0,
    position: 'absolute',
  },
  svgStar3: {
    bottom: getScaleWidth(110),
    position: 'absolute',
    right: -UI_SIZES.spacing.large,
  },
  text: {
    color: theme.palette.grey.white,
    marginBottom: UI_SIZES.spacing.large,
  },
  title: {
    alignSelf: 'stretch',
    color: theme.palette.grey.white,
    marginVertical: UI_SIZES.spacing.large,
  },
});
