import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  item: { alignItems: 'center', flex: 1, flexDirection: 'row' },
  itemImage: {
    aspectRatio: UI_SIZES.aspectRatios.square,
    borderRadius: UI_SIZES.radius.medium,
    width: UI_SIZES.elements.avatar.lg,
  },
  itemNoImage: { alignItems: 'center', justifyContent: 'center' },
  itemTexts: { flex: 1, marginLeft: UI_SIZES.spacing.small },
  list: { flexGrow: 1 },
});
