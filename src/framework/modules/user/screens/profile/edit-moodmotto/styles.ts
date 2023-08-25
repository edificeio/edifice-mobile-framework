import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

const MOOD_PICTURE_SIZE = getScaleWidth(64);

export default StyleSheet.create({
  page: {
    backgroundColor: theme.palette.grey.white,
    padding: UI_SIZES.spacing.medium,
  },
  moods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: UI_SIZES.spacing.small,
    rowGap: UI_SIZES.spacing.small,
    marginBottom: UI_SIZES.spacing.big,
  },
  mood: {
    borderRadius: UI_SIZES.radius.input,
    alignItems: 'center',
    paddingVertical: UI_SIZES.spacing.minor,
  },
  moodActive: {
    backgroundColor: theme.palette.primary.pale,
  },
  moodPicture: {
    height: MOOD_PICTURE_SIZE,
    width: MOOD_PICTURE_SIZE,
  },
});
