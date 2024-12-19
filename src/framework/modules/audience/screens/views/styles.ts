import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  container: {
    padding: UI_SIZES.spacing.medium,
  },
  icon: {
    borderRadius: UI_SIZES.radius.medium,
    padding: UI_SIZES.spacing.minor,
  },
  item: {
    alignItems: 'center',
    borderBottomWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
    flexDirection: 'row',
    paddingVertical: UI_SIZES.spacing.small,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  nb: {
    marginHorizontal: UI_SIZES.spacing.small,
  },
  subItems: {
    paddingLeft: UI_SIZES.spacing.major,
  },
});

export default styles;
