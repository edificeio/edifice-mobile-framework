import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  container: {
    height: 400,
    borderWidth: 1,
    borderColor: 'red',
    marginBottom: UI_SIZES.screen.bottomInset,
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    backgroundColor: 'white',
    color: 'black',
    caretColor: 'red',
    placeholderColor: 'gray',
    contentCSSText: 'font-size: 16px; min-height: 200px;',
  },
  flatStyle: {
    paddingHorizontal: 12,
  },
  rich: {
    minHeight: 300,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e3e3e3',
  },
  richBar: {
    borderColor: '#efefef',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  scroll: {
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
});

export default styles;
