import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  inputTitle: {
    paddingBottom: UI_SIZES.spacing.small,
    borderBottomWidth: 1,
    borderColor: theme.palette.grey.cloudy,
  },
  container: {
    marginBottom: UI_SIZES.screen.bottomInset,
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    backgroundColor: 'white',
    color: 'black',
    caretColor: 'black',
    placeholderColor: 'gray',
    contentCSSText: 'font-size: 16px; min-height: 200px;',
  },
  rich: {
    minHeight: 300,
  },
  richBar: {
    borderColor: '#efefef',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  scroll: {
    backgroundColor: '#ffffff',
    flexGrow: 1,
    padding: UI_SIZES.spacing.medium,
  },
  tib: {
    textAlign: 'center',
    color: 'green',
  },
});

export default styles;
