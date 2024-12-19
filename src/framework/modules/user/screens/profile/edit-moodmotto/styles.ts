import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const MOOD_PICTURE_SIZE = getScaleWidth(64);

export default StyleSheet.create({
  annotationMotto: {
    textAlign: 'right',
  },
  mood: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.input,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  moodActive: {
    backgroundColor: theme.palette.primary.pale,
  },
  moodPicture: {
    height: MOOD_PICTURE_SIZE,
    width: MOOD_PICTURE_SIZE,
  },
  moods: {
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: UI_SIZES.spacing.big,
    rowGap: UI_SIZES.spacing.small,
  },
  mottoInput: {
    marginBottom: UI_SIZES.spacing.large,
  },
  page: {
    backgroundColor: theme.palette.grey.white,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  scrollview: {
    paddingTop: UI_SIZES.spacing.medium,
  },
});
