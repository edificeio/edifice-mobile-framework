import { StyleSheet } from 'react-native';

import theme from '~/app/theme';

export default StyleSheet.create({
  defaultScreenStyle: {
    backgroundColor: theme.ui.background.card, // New screen in the UI have white background
    flex: 1,
  },
});
