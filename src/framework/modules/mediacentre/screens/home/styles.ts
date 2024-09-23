import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  searchContainer: {
    marginHorizontal: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.small,
  },
  loadingIndicator: {
    marginTop: '45%',
  },
});
