import { StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const ICON_SIZE = getScaleWidth(80);

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.huge,
  },
  icon: {
    height: ICON_SIZE,
    marginTop: UI_SIZES.spacing.big,
    width: ICON_SIZE,
  },
  infos: {
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  text: {
    textAlign: 'center',
  },
});
