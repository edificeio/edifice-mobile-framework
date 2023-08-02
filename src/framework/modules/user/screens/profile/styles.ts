import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

const SIZE_MOOD_PICTURE = getScaleWidth(64);

export default StyleSheet.create({
  page: {
    backgroundColor: theme.palette.grey.white,
  },
  bloc: {
    padding: UI_SIZES.spacing.medium,
  },
  blocTitle: {
    marginBottom: UI_SIZES.spacing.small,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textEmpty: {
    color: theme.palette.grey.graphite,
  },
  userFamily: {
    position: 'relative',
    marginTop: UI_SIZES.spacing.small,
    alignItems: 'center',
  },
  userFamilyIcon: {
    position: 'absolute',
    right: 0,
  },
  emptyFamily: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyFamilyIcon: {
    marginRight: UI_SIZES.spacing.minor,
  },
  moodMotto: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mood: {
    marginRight: UI_SIZES.spacing.medium,
    alignItems: 'center',
  },
  moodPicture: {
    width: SIZE_MOOD_PICTURE,
    height: SIZE_MOOD_PICTURE,
    marginBottom: UI_SIZES.spacing.minor,
  },
  motto: {
    flex: 1,
    textAlign: 'center',
  },
  hobbie: {
    flexDirection: 'row',
    backgroundColor: theme.palette.primary.pale,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing._LEGACY_tiny,
    borderRadius: UI_SIZES.radius.mediumPlus,
    marginRight: UI_SIZES.spacing.minor,
    marginBottom: UI_SIZES.spacing.minor,
    maxWidth: '100%',
  },
  hobbieValue: {
    flexShrink: 1,
  },
  hobbies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
