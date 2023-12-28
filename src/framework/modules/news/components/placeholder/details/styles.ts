import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  //GLOBAL
  h18: {
    height: 18,
  },
  h16: {
    height: 14,
  },
  h14: {
    height: 14,
  },
  mb0: {
    marginBottom: 0,
  },
  roundMedia: {
    borderRadius: UI_SIZES.radius.huge,
  },
  //ELEMENTS
  page: {
    position: 'relative',
  },
  topContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  thumbnailThread: {
    marginRight: UI_SIZES.spacing.minor,
  },
  mainContent: {
    padding: UI_SIZES.spacing.medium,
    backgroundColor: theme.palette.grey.white,
  },
  owner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: UI_SIZES.spacing.medium,
  },
  ownerAvatar: {
    marginRight: UI_SIZES.spacing.minor,
  },
  content: {
    width: '100%',
    height: 750,
    backgroundColor: theme.palette.grey.fog,
  },
});
