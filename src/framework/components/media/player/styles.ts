import { StyleSheet } from 'react-native';

import theme from '~/app/theme';

export default StyleSheet.create({
  page: {
    backgroundColor: theme.palette.grey.darkness,
  },
  backButtonWebview: {
    position: 'absolute',
    bottom: 30,
    left: 30,
  },
});
