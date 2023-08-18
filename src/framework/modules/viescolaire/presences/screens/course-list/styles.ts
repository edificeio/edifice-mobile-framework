import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { pageGutterSize } from '~/framework/components/page';

export default StyleSheet.create({
  listContentContainer: {
    padding: pageGutterSize,
    rowGap: pageGutterSize,
  },
  pageContainerStyle: {
    backgroundColor: theme.palette.grey.white,
  },
});
