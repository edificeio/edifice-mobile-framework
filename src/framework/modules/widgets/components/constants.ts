import { getScaleWidth } from '~/framework/components/constants';

// These are not icons, spacing, or radii: they define an avatar, a round container,
// and skeleton widths. Matching `UI_SIZES` values are coincidental; reusing them
// would create an unnecessary dependency on that scale.
export const WIDGET_USER_SELECTOR_HEIGHT = getScaleWidth(38);
export const WIDGET_USER_SELECTOR_AVATAR_SIZE = getScaleWidth(24);
export const WIDGET_USER_SELECTOR_ITEM_MAX_WIDTH = getScaleWidth(120);
export const WIDGET_USER_SELECTOR_MAX_SHOWN = 2;
export const WIDGET_USER_SELECTOR_PLACEHOLDER_NAME_WIDTH = getScaleWidth(48);
export const WIDGET_USER_SELECTOR_PLACEHOLDER_INITIAL_WIDTH = getScaleWidth(16);
export const WIDGET_USER_SELECTOR_ACTION_WIDTH = getScaleWidth(40);
export const WIDGET_USER_SELECTOR_ACTION_SIZE = getScaleWidth(32);
