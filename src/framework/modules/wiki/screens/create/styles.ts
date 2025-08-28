import { StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  avatarAndDetailsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: getScaleWidth(46),
    marginTop: UI_SIZES.spacing.minor,
  },
  containerAVirer: {
    flex: 1,
    flexDirection: 'column',
  },
  nameAndDateContainer: {
    flexDirection: 'column',
    marginLeft: UI_SIZES.spacing.small,
  },
});
