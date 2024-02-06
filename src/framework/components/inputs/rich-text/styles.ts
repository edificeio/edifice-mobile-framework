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
  content: {
    color: theme.palette.grey.black,
    placeholderColor: theme.palette.grey.stone,
    contentCSSText: 'font-size: 16px; line-height: 24px; min-height: 200px; margin-top: 12px',
  },
  rich: {
    minHeight: 300,
  },
  richBar: {
    borderColor: theme.palette.grey.cloudy,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  scroll: {
    flexGrow: 1,
    padding: UI_SIZES.spacing.medium,
  },
});

export default styles;
