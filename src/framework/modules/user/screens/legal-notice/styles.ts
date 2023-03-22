import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  itemIcon: { flex: 0, marginLeft: UI_SIZES.spacing.medium, transform: [{ rotate: '270deg' }] },
});
