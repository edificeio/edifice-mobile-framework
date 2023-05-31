import { StyleSheet } from 'react-native';

import theme from '~/app/theme';

export default StyleSheet.create({
  containerItem: {
    flex: 1,
    justifyContent: 'space-between',
  },
  profilePage: {
    flex: 1,
    backgroundColor: theme.ui.background.card,
  },
  textItem: {
    flex: 1,
    color: theme.ui.text.light,
    textAlignVertical: 'center',
  },
  textOnEdit: {
    lineHeight: undefined,
    textAlignVertical: 'center',
  },
});
