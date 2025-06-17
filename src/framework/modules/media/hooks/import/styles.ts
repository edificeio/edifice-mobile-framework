import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  button: {
    alignSelf: undefined,
    gap: UI_SIZES.spacing.minor,
    paddingLeft: 0,
    paddingRight: 0,
  },
  container: {
    alignItems: 'flex-start',
    paddingBottom: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.minor,
  },
  nonModalBottomSheet: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  promptTitle: {
    alignSelf: 'stretch',
    flex: 1,
    marginBottom: UI_SIZES.spacing.medium,
    textAlign: 'center',
  },
  separator: {
    alignSelf: 'stretch',
    backgroundColor: theme.palette.grey.cloudy,
    flex: 1,
    height: UI_SIZES.border.thin,
    marginHorizontal: UI_SIZES.spacing.minor,
    marginVertical: UI_SIZES.spacing.small,
  },
});
