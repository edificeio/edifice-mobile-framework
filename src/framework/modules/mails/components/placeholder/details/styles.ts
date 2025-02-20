import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  buttons: {
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  cloudy: {
    backgroundColor: theme.palette.grey.cloudy,
  },
  grey: {
    backgroundColor: theme.palette.grey.grey,
  },
  h22: {
    borderRadius: UI_SIZES.radius.card,
    height: 22,
    marginBottom: 0,
  },
  h26: {
    borderRadius: UI_SIZES.radius.card,
    height: 26,
    marginBottom: 0,
  },
  h38: {
    borderRadius: UI_SIZES.radius.huge,
    height: 38,
    marginBottom: 0,
  },

  header: {
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    marginTop: UI_SIZES.spacing.big,
  },
  headerFirstLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  media: {
    borderRadius: UI_SIZES.radius.card,
    height: 240,
    marginVertical: UI_SIZES.spacing.big,
    width: '100%',
  },

  page: {
    padding: UI_SIZES.spacing.medium,
  },
  pearl: {
    backgroundColor: theme.palette.grey.pearl,
  },
  texts: {
    flex: 1,
  },
});
