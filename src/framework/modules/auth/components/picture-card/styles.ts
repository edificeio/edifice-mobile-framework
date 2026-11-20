import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

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
    justifyContent: 'center',
    marginTop: UI_SIZES.spacing.tiny,
  },
});
