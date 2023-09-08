import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  item: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  itemImage: {
    width: UI_SIZES.elements.avatar.lg,
    aspectRatio: UI_SIZES.aspectRatios.square,
    borderRadius: UI_SIZES.radius.medium,
  },
  itemNoImage: { justifyContent: 'center', alignItems: 'center' },
  itemTexts: { flex: 1, marginLeft: UI_SIZES.spacing.small },
  list: { flexGrow: 1 },
});
