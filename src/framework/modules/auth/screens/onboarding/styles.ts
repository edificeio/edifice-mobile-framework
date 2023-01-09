import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const svgSize = UI_SIZES.screen.width * 0.8;

export default StyleSheet.create({
  buttons: {
    flex: 1,
    justifyContent: 'center',
  },
  discoverButton: {
    marginTop: UI_SIZES.spacing.medium,
  },
  mainContainer: {
    flex: 4,
  },
  page: {
    flex: 1,
    backgroundColor: theme.ui.background.page,
    paddingVertical: UI_SIZES.spacing.big,
  },
  swiper: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.ui.background.page,
    borderColor: theme.palette.primary.regular,
    borderWidth: 1.5,
  },
  swiperActive: {
    backgroundColor: theme.palette.primary.regular,
    borderWidth: 0,
  },
  swiperItem: {
    justifyContent: 'space-around',
    alignItems: 'center',
    alignSelf: 'center',
    height: '85%',
    width: '80%',
  },
  swiperItemImage: {
    width: svgSize,
    height: svgSize,
    maxHeight: '60%',
    maxWidth: '80%',
    marginTop: UI_SIZES.spacing.tiny,
    marginBottom: UI_SIZES.spacing.large,
  },
  swiperItemText: {
    textAlign: 'center',
  },
  title: {
    color: theme.palette.primary.regular,
    alignSelf: 'center',
    height: 80,
    lineHeight: undefined,
  },
});
