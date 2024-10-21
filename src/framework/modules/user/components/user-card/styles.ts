import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  boxAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxAvatarEdit: {
    paddingBottom: UI_SIZES.spacing.small,
  },
  boxTexts: {
    flexShrink: 1,
    marginLeft: UI_SIZES.spacing.big,
  },
  buttonsActionAvatar: {
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  loaderAvatar: {
    paddingLeft: UI_SIZES.spacing.tiny,
    paddingTop: UI_SIZES.spacing.minor,
    position: 'absolute',
  },
  main: {
    alignItems: 'center',
    backgroundColor: theme.ui.background.card,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
  },
  name: {
    marginBottom: UI_SIZES.spacing.tiny,
  },
  sendMessage: {
    marginTop: UI_SIZES.spacing.minor,
  },
  viewNoAvatar: {
    height: 30,
    width: 30,
  },
});
