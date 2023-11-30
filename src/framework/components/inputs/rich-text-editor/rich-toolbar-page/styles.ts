import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: UI_SIZES.screen.width,
  },
  header: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  content: {
    padding: UI_SIZES.spacing.medium,
  },
});

export default styles;
