import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  page: {
    backgroundColor: theme.palette.grey.white,
  },
  bloc: {
    padding: UI_SIZES.spacing.medium,
  },
  blocTitle: {
    marginBottom: UI_SIZES.spacing.small,
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
    width: UI_SIZES.dimensions.width.largePlus,
    height: UI_SIZES.dimensions.height.largePlus,
    marginBottom: UI_SIZES.spacing.minor,
  },
  motto: {
    flex: 1,
    textAlign: 'center',
  },
  hobbie: {
    backgroundColor: theme.palette.primary.pale,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing._LEGACY_tiny,
    borderRadius: UI_SIZES.radius.mediumPlus,
    marginRight: UI_SIZES.spacing.minor,
    marginBottom: UI_SIZES.spacing.minor,
  },
  hobbies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
