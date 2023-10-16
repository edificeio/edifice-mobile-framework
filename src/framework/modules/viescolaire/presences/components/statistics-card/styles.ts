import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pictoContainer: {
    alignSelf: 'stretch',
    borderTopLeftRadius: UI_SIZES.radius.card,
    borderBottomLeftRadius: UI_SIZES.radius.card,
  },
  rowContainer: {
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.big,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
});
