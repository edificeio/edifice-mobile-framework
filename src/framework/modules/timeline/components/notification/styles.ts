import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

const MOOD_PICTURE_SIZE = getScaleWidth(60);

export default StyleSheet.create({
  notif: {
    paddingVertical: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.medium,
    borderRadius: UI_SIZES.radius.newCard,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
    backgroundColor: theme.palette.grey.white,
  },
  notifMood: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodPicture: {
    height: MOOD_PICTURE_SIZE,
    width: MOOD_PICTURE_SIZE,
    marginLeft: UI_SIZES.spacing.small,
  },
  motto: {
    textAlign: 'center',
    marginTop: UI_SIZES.spacing.small,
  },
  flex1: {
    flex: 1,
  },
});
