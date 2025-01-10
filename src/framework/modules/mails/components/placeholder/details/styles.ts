import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  page: {
    padding: UI_SIZES.spacing.medium,
  },

  header: {
    marginTop: UI_SIZES.spacing.big,
    flexDirection: 'row',
    columnGap: UI_SIZES.spacing.small,
  },
  texts: {
    flex: 1,
  },
  headerFirstLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  media: {
    height: 240,
    width: '100%',
    marginVertical: UI_SIZES.spacing.big,
    borderRadius: UI_SIZES.radius.card,
  },
  buttons: {
    flexDirection: 'row',
    columnGap: UI_SIZES.spacing.small,
    justifyContent: 'flex-end',
  },

  h22: {
    height: 22,
    borderRadius: UI_SIZES.radius.card,
    marginBottom: 0,
  },
  h26: {
    height: 26,
    borderRadius: UI_SIZES.radius.card,
    marginBottom: 0,
  },
  h38: {
    height: 38,
    borderRadius: UI_SIZES.radius.huge,
    marginBottom: 0,
  },

  pearl: {
    backgroundColor: theme.palette.grey.pearl,
  },
  grey: {
    backgroundColor: theme.palette.grey.grey,
  },
  cloudy: {
    backgroundColor: theme.palette.grey.cloudy,
  },
});
