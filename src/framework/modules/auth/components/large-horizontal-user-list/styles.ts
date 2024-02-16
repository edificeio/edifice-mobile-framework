import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

import type { AccountSelectListContentContainerStyleProp } from './types';

export default StyleSheet.create({
  accountContentContainer: {
    columnGap: UI_SIZES.spacing.medium, // /!\ Keep real number value here as it is used in component to compute item width
    paddingHorizontal: UI_SIZES.spacing.big, // /!\ Keep real number value here as it is used in component to compute item width
  } as AccountSelectListContentContainerStyleProp,
  accountItem: {
    padding: UI_SIZES.spacing.minor,
    rowGap: UI_SIZES.spacing.small,
  },
  accountItemDetails: {
    flexGrow: 1,
    alignItems: 'stretch',
    gap: UI_SIZES.spacing.tiny,
    justifyContent: 'center',
  },
  accountItemDetailsText: {
    textAlign: 'center',
  },
});
