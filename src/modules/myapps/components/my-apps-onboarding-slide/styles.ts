import { StyleSheet } from 'react-native';

import { getScaleHeight, getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export const styles = StyleSheet.create({
  animation: {
    height: '100%',
    width: '100%',
  },
  bottomContainerWrapper: {
    paddingVertical: getScaleHeight(5),
  },
  containerSlide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    marginTop: UI_SIZES.spacing.small,
    textAlign: 'center',
    ...TextSizeStyle.Normal,
  },
  illustrationWrapper: {
    alignItems: 'center',
    height: getScaleWidth(180),
    justifyContent: 'center',
    overflow: 'hidden',
    width: getScaleWidth(180),
  },
  title: {
    textAlign: 'center',
  },
  titleWrapper: {
    marginVertical: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tinyExtra,
  },
});
