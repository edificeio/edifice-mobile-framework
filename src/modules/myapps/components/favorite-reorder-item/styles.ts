import { StyleSheet, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES, UI_VALUES } from '~/framework/components/constants';

export const APP_ICON_SIZE = UI_SIZES.elements.icon.small;

// The active border is thicker: the resting item pads the difference, so that an item keeps its size when grabbed.
const BORDER_WIDTH_DELTA = UI_SIZES.border.small - UI_SIZES.border.thin;

const ITEM_STYLE: ViewStyle = {
  alignItems: 'center',
  borderRadius: UI_SIZES.radius.medium,
  flexDirection: 'row',
  gap: UI_SIZES.spacing.small,
  marginBottom: UI_SIZES.spacing.small,
  paddingLeft: UI_SIZES.spacing.small,
};

const ACTIVE_ITEM_STYLE: ViewStyle = {
  ...ITEM_STYLE,
  backgroundColor: theme.palette.primary.pale,
  borderColor: theme.palette.primary.regular,
  borderWidth: UI_SIZES.border.small,
};

// Figma effect "Hover": black 18 %, y offset 4, blur 10 (an iOS shadow radius is half a Figma blur).
// The design system has no shadow token yet.
const ACTIVE_ITEM_SHADOW: ViewStyle = {
  elevation: 10,
  shadowColor: theme.palette.grey.darkness,
  shadowOffset: { height: 4, width: 0 },
  shadowOpacity: 0.18,
  shadowRadius: 5,
};

export const styles = StyleSheet.create({
  appIcon: {
    height: APP_ICON_SIZE,
    width: APP_ICON_SIZE,
  },
  handle: {
    ...UI_STYLES.clickZone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.small,
    height: UI_SIZES.elements.icon.default,
    justifyContent: 'center',
    width: UI_SIZES.elements.icon.default,
  },
  item: {
    ...ITEM_STYLE,
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.cloudy,
    borderWidth: UI_SIZES.border.thin,
    paddingLeft: UI_SIZES.spacing.small + BORDER_WIDTH_DELTA,
    paddingRight: BORDER_WIDTH_DELTA,
    paddingVertical: BORDER_WIDTH_DELTA,
  },
  itemActive: {
    ...ACTIVE_ITEM_STYLE,
    ...ACTIVE_ITEM_SHADOW,
  },
  itemPlaceholder: {
    ...ACTIVE_ITEM_STYLE,
    opacity: UI_VALUES.opacity.modal,
  },
  name: {
    flex: 1,
  },
});

export const getItemStyle = (isActive: boolean, isPlaceholder: boolean) => {
  if (isPlaceholder) return styles.itemPlaceholder;
  return isActive ? styles.itemActive : styles.item;
};
