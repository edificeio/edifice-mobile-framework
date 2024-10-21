import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  animation: {
    height: 80,
    left: UI_SIZES.spacing.large,
    position: 'absolute',
    top: 0,
    width: UI_SIZES.screen.width - UI_SIZES.spacing.big * 2,
  },
  button: {
    marginBottom: UI_SIZES.spacing.huge * 2,
  },
  content: {
    backgroundColor: '#1C1C73',
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
    right: 0,
    top: getScaleWidth(340),
  },
  svgRocket: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  svgStar1: {
    bottom: getScaleWidth(68),
    left: 0,
    position: 'absolute',
  },
  svgStar2: {
    bottom: getScaleWidth(24),
    left: UI_SIZES.spacing.large,
    position: 'absolute',
  },
  svgStar3: {
    bottom: getScaleWidth(110),
    position: 'absolute',
    right: 0,
  },
  text: {
    color: theme.palette.grey.white,
    marginBottom: UI_SIZES.spacing.large,
    paddingHorizontal: UI_SIZES.spacing.large,
  },
  title: {
    alignSelf: 'stretch',
    color: theme.palette.grey.white,
    marginVertical: UI_SIZES.spacing.large,
    paddingHorizontal: UI_SIZES.spacing.large,
  },
});
