import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const MOOD_PICTURE_SIZE = getScaleWidth(60);

export default StyleSheet.create({
  contentNotif: {
    marginTop: UI_SIZES.spacing.small,
  },
  flex1: {
    flex: 1,
  },
  moodPicture: {
    height: MOOD_PICTURE_SIZE,
    marginLeft: UI_SIZES.spacing.small,
    width: MOOD_PICTURE_SIZE,
  },
  motto: {
    textAlign: 'center',
  },
  notif: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.newCard,
    elevation: 3,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  notifMood: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
