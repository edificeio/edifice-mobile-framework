import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  main: {
    alignItems: 'center',
    backgroundColor: theme.ui.background.card,
    flex: 0,
    flexDirection: 'row',
    flexGrow: 0,
    justifyContent: 'flex-start',
    padding: UI_SIZES.spacing.medium,
    width: '100%',
    borderBottomWidth: 1,
    borderColor: theme.palette.grey.cloudy,
  },
  boxAvatar: {
    padding: UI_SIZES.spacing.small,
    alignItems: 'center',
    justifyContent: 'center',
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
  boxTexts: {
    flexGrow: 0,
    flexShrink: 1,
    marginRight: 'auto',
    paddingLeft: UI_SIZES.spacing.medium,
  },
  textType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roundColorType: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: UI_SIZES.spacing.tiny,
  },
});
