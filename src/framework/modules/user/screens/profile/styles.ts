import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import appConf from '~/framework/util/appConf';

const SIZE_MOOD_PICTURE = getScaleWidth(48);
const WIDTH_MOOD_BOX = appConf.is1d ? getScaleWidth(125) : getScaleWidth(115);

export default StyleSheet.create({
  bloc: {
    padding: UI_SIZES.spacing.medium,
  },
  blocTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: UI_SIZES.spacing.small,
  },
  emptyFamily: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  emptyFamilyIcon: {
    marginRight: UI_SIZES.spacing.minor,
  },
  hobbie: {
    backgroundColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.mediumPlus,
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.minor,
    marginRight: UI_SIZES.spacing.minor,
    maxWidth: '100%',
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  hobbies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hobbieValue: {
    flexShrink: 1,
  },
  mood: {
    alignItems: 'center',
    backgroundColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.extraLarge,
    marginRight: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
    width: WIDTH_MOOD_BOX,
  },
  moodMotto: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  moodPicture: {
    height: SIZE_MOOD_PICTURE,
    marginBottom: UI_SIZES.spacing.minor,
    width: SIZE_MOOD_PICTURE,
  },
  motto: {
    flex: 1,
    textAlign: 'center',
  },
  page: {
    backgroundColor: theme.palette.grey.white,
  },
  textEmpty: {
    color: theme.palette.grey.graphite,
  },
  userFamily: {
    justifyContent: 'center',
    marginTop: UI_SIZES.spacing.small,
    position: 'relative',
  },
  userFamilyIcon: {
    position: 'absolute',
    right: 0,
  },
});
