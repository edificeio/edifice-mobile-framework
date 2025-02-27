import { StyleSheet } from 'react-native';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const CONTAINER_ICON_SIZE = getScaleWidth(28);

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: UI_SIZES.spacing.minor,
    marginBottom: UI_SIZES.spacing.medium,
  },
  icon: {
    width: CONTAINER_ICON_SIZE,
    aspectRatio: 1,
    padding: UI_SIZES.spacing.tiny,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});
