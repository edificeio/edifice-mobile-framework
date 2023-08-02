import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  //GLOBAL
  h24: {
    height: 24,
  },
  h20: {
    height: 20,
  },
  h18: {
    height: 18,
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
  topContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UI_SIZES.spacing.medium,
  },
  avatar: {
    marginRight: UI_SIZES.spacing.minor,
    borderRadius: UI_SIZES.radius.huge,
  },
  textMiddle: {
    marginBottom: UI_SIZES.spacing.small,
    marginTop: UI_SIZES.spacing.minor,
  },
  bloc: {
    padding: UI_SIZES.spacing.medium,
  },
  lineIconText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: UI_SIZES.spacing.minor,
  },
  table: {
    width: '100%',
    height: 150,
    backgroundColor: theme.palette.grey.pearl,
  },
});
