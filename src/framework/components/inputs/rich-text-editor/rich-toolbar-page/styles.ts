import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: UI_SIZES.screen.width,
  },
  header: {
    borderWidth: 1,
    borderColor: theme.palette.grey.pearl,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  headerTitle: {
    alignSelf: 'flex-start',
  },
  content: {
    padding: UI_SIZES.spacing.medium,
  },
});

export default styles;
