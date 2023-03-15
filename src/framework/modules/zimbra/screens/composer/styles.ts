import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  navbarActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navbarSendAction: {
    marginHorizontal: UI_SIZES.spacing.medium,
  },
});
