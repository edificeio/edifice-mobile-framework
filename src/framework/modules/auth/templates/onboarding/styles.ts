import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const pictureSize = getScaleWidth(207);

export default StyleSheet.create({
  buttons: {
    flex: 1,
    justifyContent: 'center',
  },
  discoverButton: {
    marginTop: UI_SIZES.spacing.medium,
  },
  mainContainer: {
    flex: 5,
  },
  page: {
    paddingBottom: UI_SIZES.screen.bottomInset + UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.screen.topInset + UI_SIZES.spacing.big,
  },
  swiper: {
    backgroundColor: theme.ui.background.page,
    borderColor: theme.palette.primary.regular,
    borderRadius: 8,
    borderWidth: 1.5,
    height: 16,
    width: 16,
  },
  swiperActive: {
    backgroundColor: theme.palette.primary.regular,
    borderWidth: 0,
  },
  swiperItem: {
    alignItems: 'center',
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  swiperItemImage: {
    height: pictureSize,
    marginVertical: UI_SIZES.spacing.large,
    width: pictureSize,
  },
  swiperItemText: {
    paddingHorizontal: UI_SIZES.spacing.large,
    textAlign: 'center',
  },
  title: {
    alignSelf: 'center',
    color: theme.palette.primary.regular,
  },
});
