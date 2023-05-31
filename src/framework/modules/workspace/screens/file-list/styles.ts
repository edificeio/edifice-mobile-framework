import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  listContainer: {
    backgroundColor: theme.palette.grey.fog,
    flexGrow: 1,
  },
  navBarCountText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: theme.ui.text.inverse,
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
