import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  h14: {
    height: 14,
  },

  content: {
    width: '100%',
    height: 750,
    backgroundColor: theme.palette.grey.fog,
  },
  
  h16: {
    height: 14,
  },
  //GLOBAL
  h18: {
    height: 18,
  },

  mainContent: {
    backgroundColor: theme.palette.grey.white,
    padding: UI_SIZES.spacing.medium,
  },

  mb0: {
    marginBottom: 0,
  },

  owner: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: UI_SIZES.spacing.medium,
  },

  ownerAvatar: {
    marginRight: UI_SIZES.spacing.minor,
  },
  //ELEMENTS
  page: {
    position: 'relative',
  },
  roundMedia: {
    borderRadius: UI_SIZES.radius.huge,
  },
  thumbnailThread: {
    marginRight: UI_SIZES.spacing.minor,
  },
  topContent: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
  },
});
