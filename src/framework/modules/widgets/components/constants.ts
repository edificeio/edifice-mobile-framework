import { getScaleWidth } from '~/framework/components/constants';

// Sizes of the selector itself, not icons or spacings. Where one matches a `UI_SIZES` value, it is
// a coincidence, and following it would tie this row to a scale it does not belong to.
export const WIDGET_USER_SELECTOR_HEIGHT = getScaleWidth(38);
export const WIDGET_USER_SELECTOR_AVATAR_SIZE = getScaleWidth(24);
export const WIDGET_USER_SELECTOR_ITEM_MAX_WIDTH = getScaleWidth(120);
export const WIDGET_USER_SELECTOR_MAX_SHOWN = 2;
export const WIDGET_USER_SELECTOR_PLACEHOLDER_NAME_WIDTH = getScaleWidth(48);
export const WIDGET_USER_SELECTOR_PLACEHOLDER_INITIAL_WIDTH = getScaleWidth(16);
export const WIDGET_USER_SELECTOR_ACTION_WIDTH = getScaleWidth(40);
export const WIDGET_USER_SELECTOR_ACTION_SIZE = getScaleWidth(32);
