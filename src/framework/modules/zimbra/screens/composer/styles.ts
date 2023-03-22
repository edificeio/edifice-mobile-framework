import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  navBarActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBarSendAction: {
    marginHorizontal: UI_SIZES.spacing.medium,
  },
});
