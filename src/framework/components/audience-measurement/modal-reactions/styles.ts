import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleHeight } from '~/framework/components/constants';

const styles = StyleSheet.create({
  container: {
    padding: UI_SIZES.spacing.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.small,
    borderBottomWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
    paddingVertical: UI_SIZES.spacing.small,
  },
  separator: {
    width: UI_SIZES.border.thin,
    height: getScaleHeight(14),
    backgroundColor: theme.palette.grey.cloudy,
  },
  headerItem: {
    flexDirection: 'row',
    columnGap: UI_SIZES.spacing.minor,
  },
  headerItemSelected: {},
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
  },
});

export default styles;
