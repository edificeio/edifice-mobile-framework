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
    alignSelf: 'center',
    flex: 1,
    marginHorizontal: UI_SIZES.spacing.small,
    textAlign: 'center',
  },
  weekContainer: {
    flexDirection: 'row',
  },
});
