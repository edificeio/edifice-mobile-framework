import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextFontStyle } from '~/framework/components/text';
import {
  WIDGET_USER_SELECTOR_ACTION_SIZE,
  WIDGET_USER_SELECTOR_ACTION_WIDTH,
  WIDGET_USER_SELECTOR_HEIGHT,
  WIDGET_USER_SELECTOR_ITEM_MAX_WIDTH,
} from '~/framework/modules/widgets/components/constants';

export default StyleSheet.create({
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    width: WIDGET_USER_SELECTOR_ACTION_WIDTH,
  },
  actionCircle: {
    alignItems: 'center',
    height: WIDGET_USER_SELECTOR_ACTION_SIZE,
    justifyContent: 'center',
    padding: UI_SIZES.spacing.minor,
    width: WIDGET_USER_SELECTOR_ACTION_SIZE,
  },
  actionCirclePressed: {
    backgroundColor: theme.palette.primary.pale,
    borderRadius: '50%',
  },

  item: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    maxWidth: WIDGET_USER_SELECTOR_ITEM_MAX_WIDTH,
    paddingHorizontal: UI_SIZES.spacing.small,
  },

  itemAvatarSelected: {
    borderRadius: '50%',
    borderWidth: UI_SIZES.border.small,
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  },
  itemText: {
    ...TextFontStyle.Bold,
  },
  menu: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.mediumPlus,
    elevation: 10,
    minWidth: WIDGET_USER_SELECTOR_ITEM_MAX_WIDTH,
    paddingVertical: UI_SIZES.spacing.tiny,
    position: 'absolute',
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  menuItem: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  row: {
    alignItems: 'stretch',
    flexDirection: 'row',
    height: WIDGET_USER_SELECTOR_HEIGHT,
    zIndex: 1,
  },
});
