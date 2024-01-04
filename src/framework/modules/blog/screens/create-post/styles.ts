import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  inputTitle: {
    paddingBottom: UI_SIZES.spacing.small,
    borderBottomWidth: 1,
    borderColor: theme.palette.grey.cloudy,
  },
  container: {
    marginBottom: UI_SIZES.screen.bottomInset,
    flex: 1,
    backgroundColor: theme.palette.grey.white,
  },
  content: {
    backgroundColor: theme.palette.grey.white,
    color: theme.palette.grey.black,
    caretColor: theme.palette.grey.black,
    placeholderColor: theme.palette.grey.fog,
    contentCSSText: 'font-size: 16px; min-height: 200px;',
  },
  rich: {
    minHeight: 300,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  richBar: {
    borderColor: '#efefef',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  scroll: {
    backgroundColor: theme.palette.grey.white,
    flexGrow: 1,
    padding: UI_SIZES.spacing.medium,
  },
});
