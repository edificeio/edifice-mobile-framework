import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.medium,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: UI_SIZES.spacing.big,
  },
  week: {
    flex: 1,
    textAlign: 'center',
    alignSelf: 'center',
    marginHorizontal: UI_SIZES.spacing.small,
  },
  weekContainer: {
    flexDirection: 'row',
  },
});
