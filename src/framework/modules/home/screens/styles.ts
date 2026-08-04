import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: theme.palette.grey.white.toString(),
  },
  navBarTitle: { alignItems: 'center' },
  page: {
    backgroundColor: theme.ui.background.page.toString(),
    flex: 1,
  },
  scene: {
    padding: UI_SIZES.spacing.medium,
  },
});
