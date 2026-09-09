import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';
import {
  WIDGET_USER_SELECTOR_ACTION_SIZE,
  WIDGET_USER_SELECTOR_ACTION_WIDTH,
  WIDGET_USER_SELECTOR_HEIGHT,
  WIDGET_USER_SELECTOR_ITEM_MAX_WIDTH,
  WIDGET_USER_SELECTOR_PLACEHOLDER_INITIAL_WIDTH,
  WIDGET_USER_SELECTOR_PLACEHOLDER_NAME_WIDTH,
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
  placeholderInitial: {
    width: WIDGET_USER_SELECTOR_PLACEHOLDER_INITIAL_WIDTH,
  },
  placeholderName: {
    height: TextSizeStyle.Small.fontSize,
    marginHorizontal: UI_SIZES.spacing.minor,
    width: WIDGET_USER_SELECTOR_PLACEHOLDER_NAME_WIDTH,
  },
  placeholderTab: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    paddingTop: 2,
  },

  row: {
    alignItems: 'stretch',
    flexDirection: 'row',
    height: WIDGET_USER_SELECTOR_HEIGHT,
    zIndex: 1,
  },
});
