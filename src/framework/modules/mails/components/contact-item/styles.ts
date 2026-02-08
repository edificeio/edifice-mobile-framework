import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  avatar: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: theme.palette.primary.light,
    borderRadius: UI_SIZES.radius.big,
    height: getScaleWidth(24),
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.palette.primary.regular,
    fontSize: getScaleWidth(10),
  },
  container: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.big,
    borderWidth: UI_SIZES.border.thin,
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    paddingLeft: UI_SIZES.spacing.tiny,
    paddingRight: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  containerNumber: {
    alignSelf: 'flex-end',
    marginBottom: UI_SIZES.spacing.tiny,
    paddingLeft: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.tinyExtra,
  },
  idText: {
    color: theme.palette.grey.graphite,
    flexShrink: 1,
    fontSize: getScaleWidth(10),
  },
  text: {
    flexShrink: 1,
  },
  textContainer: {
    flex: 1,
    flexShrink: 1,
  },
});
