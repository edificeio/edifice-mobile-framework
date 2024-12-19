import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  pictoContainer: {
    alignSelf: 'stretch',
    borderBottomLeftRadius: UI_SIZES.radius.card,
    borderTopLeftRadius: UI_SIZES.radius.card,
  },
  rowContainer: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.big,
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
});
