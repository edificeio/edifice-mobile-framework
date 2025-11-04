import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: UI_SIZES.spacing.small,
  },
  gridItem: {
    flexBasis: '48%',
  },
});
