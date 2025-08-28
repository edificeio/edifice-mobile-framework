import { StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  addFilesResultsType: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: UI_SIZES.radius.card,
    justifyContent: 'center',
    marginRight: UI_SIZES.spacing.minor,
    width: getScaleWidth(36),
  },
});

export default styles;
