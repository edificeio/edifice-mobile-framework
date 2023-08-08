import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  main: {
    alignItems: 'center',
    backgroundColor: theme.ui.background.card,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
  },
  boxAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxAvatarEdit: {
    paddingBottom: UI_SIZES.spacing.small,
  },
  buttonsActionAvatar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  viewNoAvatar: {
    height: 30,
    width: 30,
  },
  loaderAvatar: {
    position: 'absolute',
    paddingTop: UI_SIZES.spacing.minor,
    paddingLeft: UI_SIZES.spacing.tiny,
  },
  name: {
    marginBottom: UI_SIZES.spacing.tiny,
  },
  boxTexts: {
    flexShrink: 1,
    marginLeft: UI_SIZES.spacing.big,
  },
  sendMessage: {
    marginTop: UI_SIZES.spacing.minor,
  },
});
