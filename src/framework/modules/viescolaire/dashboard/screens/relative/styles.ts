import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  gridAllModules: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridModulesLine: {
    width: '100%',
  },
  scrollViewContentContainer: {
    padding: UI_SIZES.spacing.medium,
    rowGap: UI_SIZES.spacing.medium,
  },
  subtitle: {
    color: theme.palette.grey.stone,
  },
});
