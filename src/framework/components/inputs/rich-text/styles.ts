import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  container: {
    marginBottom: UI_SIZES.screen.bottomInset,
    flex: 1,
  },
  page: {
    backgroundColor: theme.palette.grey.white,
  },
  rich: {
    minHeight: '90%',
  },
  scroll: {
    flexGrow: 1,
    padding: UI_SIZES.spacing.medium,
    paddingBottom: 0,
  },
});

export default styles;
