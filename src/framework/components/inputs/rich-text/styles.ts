import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  page: {
    backgroundColor: theme.palette.grey.white,
  },
  container: {
    marginBottom: UI_SIZES.screen.bottomInset,
    flex: 1,
  },
  rich: {
    minHeight: '90%',
  },
  richBar: {
    borderColor: theme.palette.grey.cloudy,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  scroll: {
    flexGrow: 1,
    padding: UI_SIZES.spacing.medium,
    paddingBottom: 0,
  },
});

export default styles;
