import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

export default StyleSheet.create({
  animation: {
    width: UI_SIZES.screen.width - UI_SIZES.spacing.big * 2,
    height: 80,
    position: 'absolute',
    top: 0,
  },
  content: {
    backgroundColor: theme.palette.secondary.dark,
    paddingHorizontal: UI_SIZES.spacing.large,
  },
  pic: {
    width: getScaleWidth(120),
    height: getScaleWidth(120),
    alignSelf: 'center',
    marginTop: UI_SIZES.spacing.major,
  },
  title: {
    color: theme.palette.grey.white,
    marginVertical: UI_SIZES.spacing.large,
    alignSelf: 'stretch',
  },
  text: {
    color: theme.palette.grey.white,
    marginBottom: UI_SIZES.spacing.large,
  },
  button: {
    marginBottom: UI_SIZES.spacing.huge * 2,
  },
  svgEdi: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
    alignSelf: 'center',
  },
  svgRocket: {
    position: 'absolute',
    right: -UI_SIZES.spacing.large,
    top: 0,
  },
  svgMoon: {
    position: 'absolute',
    right: -UI_SIZES.spacing.large,
    top: getScaleWidth(340),
  },
  svgStar1: {
    position: 'absolute',
    left: -UI_SIZES.spacing.large,
    bottom: getScaleWidth(68),
  },
  svgStar2: {
    position: 'absolute',
    left: 0,
    bottom: getScaleWidth(24),
  },
  svgStar3: {
    position: 'absolute',
    right: -UI_SIZES.spacing.large,
    bottom: getScaleWidth(110),
  },
});
