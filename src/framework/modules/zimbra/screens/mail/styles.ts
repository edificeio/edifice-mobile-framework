import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { pageGutterSize } from '~/framework/components/page';

export default StyleSheet.create({
  bodyContainer: {
    marginTop: UI_SIZES.spacing.small,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: pageGutterSize,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: UI_SIZES.spacing.small,
  },
});
