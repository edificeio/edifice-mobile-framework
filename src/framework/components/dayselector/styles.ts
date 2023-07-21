import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.medium,
    borderColor: theme.palette.grey.stone,
    borderWidth: UI_SIZES.border.thin,
    borderRadius: UI_SIZES.radius.selector,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: UI_SIZES.spacing.big,
  },
  weekContainer: {
    alignItems: 'center',
    marginLeft: UI_SIZES.spacing.large,
    marginRight: UI_SIZES.spacing.large,
  },
  weekSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
