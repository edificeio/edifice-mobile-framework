import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  listContainer: {
    backgroundColor: theme.palette.grey.fog,
    flexGrow: 1,
  },
  navBarCountText: {
    color: theme.ui.text.inverse,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  uploadIndicatorContainer: {
    alignSelf: 'center',
    backgroundColor: theme.palette.grey.fog,
    borderRadius: UI_SIZES.radius.mediumPlus,
    height: 75,
    position: 'absolute',
    top: '40%',
    width: 75,
  },
});
