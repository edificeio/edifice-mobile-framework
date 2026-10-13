import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

import type { AccountSelectListContentContainerStyleProp } from './types';

export default StyleSheet.create({
  accountContentContainer: {
    columnGap: UI_SIZES.spacing.medium, // /!\ Keep real number value here as it is used in component to compute item width
    paddingHorizontal: UI_SIZES.spacing.big, // /!\ Keep real number value here as it is used in component to compute item width
  } as AccountSelectListContentContainerStyleProp,
  accountItem: {
    alignItems: 'center',
    padding: UI_SIZES.spacing.minor,
    rowGap: UI_SIZES.spacing.small,
  },
  accountItemDetails: {
    alignItems: 'stretch',
    flexGrow: 1,
    gap: UI_SIZES.spacing.tiny,
    justifyContent: 'center',
  },
  accountItemDetailsText: {
    textAlign: 'center',
  },
});
