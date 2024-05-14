import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  footerButton: {
    alignSelf: 'flex-start',
  },
  footerReactions: {
    borderColor: theme.palette.grey.cloudy,
    borderWidth: UI_SIZES.border.thin,
    borderRadius: UI_SIZES.radius.medium,
    padding: UI_SIZES.spacing.minor,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    columnGap: UI_SIZES.spacing.minor,
    position: 'absolute',
    top: '-100%',
    backgroundColor: theme.palette.grey.white,
  },
});

export default styles;
