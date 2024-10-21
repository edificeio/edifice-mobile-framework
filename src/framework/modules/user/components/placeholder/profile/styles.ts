import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  avatar: {
    borderRadius: UI_SIZES.radius.huge,
    marginRight: UI_SIZES.spacing.minor,
  },

  bloc: {
    padding: UI_SIZES.spacing.medium,
  },

  h18: {
    height: 18,
  },

  h20: {
    height: 20,
  },
  //GLOBAL
  h24: {
    height: 24,
  },

  icon: {
    marginRight: UI_SIZES.spacing.minor,
  },

  lineIconText: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  mb0: {
    marginBottom: 0,
  },

  mb12: {
    marginBottom: UI_SIZES.spacing.small,
  },
  //ELEMENTS
  page: {
    position: 'relative',
  },
  table: {
    backgroundColor: theme.palette.grey.pearl,
    height: 150,
    width: '100%',
  },
  textMiddle: {
    marginBottom: UI_SIZES.spacing.small,
    marginTop: UI_SIZES.spacing.minor,
  },
  topContent: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: UI_SIZES.spacing.medium,
  },
});
