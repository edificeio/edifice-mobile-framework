import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  container: {
    padding: UI_SIZES.spacing.medium,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: UI_SIZES.spacing.small,
    borderBottomWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  subItems: {
    paddingLeft: UI_SIZES.spacing.major,
  },
  icon: {
    padding: UI_SIZES.spacing.minor,
    borderRadius: UI_SIZES.radius.medium,
  },
  nb: {
    marginHorizontal: UI_SIZES.spacing.small,
  },
});

export default styles;
