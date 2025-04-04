import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  headerButton: {
    marginLeft: 'auto',
  },
  headerContainer: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.tiny,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.small,
  },
  listContentContainer: {
    columnGap: UI_SIZES.spacing.small,
    padding: UI_SIZES.spacing.small,
  },
  listFooterContainer: {
    alignSelf: 'center',
  },
});
