import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  listContainer: {
    backgroundColor: theme.palette.grey.fog,
    flexGrow: 1,
  },
  uploadIndicatorContainer: {
    alignSelf: 'center',
    position: 'absolute',
    width: 75,
    height: 75,
    top: '40%',
    backgroundColor: theme.palette.grey.fog,
    borderRadius: UI_SIZES.radius.mediumPlus,
  },
});
