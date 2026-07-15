import { StyleSheet } from 'react-native';

import { getScaleHeight, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorCardPadding: {
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  text: {
    lineHeight: undefined,
    textAlign: 'center',
  },
  textWrapper: {
    alignItems: 'center',
    height: getScaleHeight(20) * 1.5,
    justifyContent: 'center',
    marginTop: UI_SIZES.spacing.tiny,
  },
});
