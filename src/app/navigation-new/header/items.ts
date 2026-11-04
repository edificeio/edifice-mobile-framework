/**
 * Helpers that build the items of the header, for `headerLeftActions` / `headerRightActions`: they only add the `type` of the item.
 */
import type { HeaderButton, HeaderCustom, HeaderMenu, HeaderMenuAction, HeaderMenuSubmenu, HeaderSpacing } from './types';

/** A button, that does something when pressed. */
export const headerAction = (config: Omit<HeaderButton, 'type'>): HeaderButton => ({ ...config, type: 'button' });

/** A button that opens a menu (its entries: `menuAction`, `menuSubmenu`). */
export const headerMenu = (config: Omit<HeaderMenu, 'type'>): HeaderMenu => ({ ...config, type: 'menu' });

/** A space between two items (`UI_SIZES.spacing.minor`). */
export const headerSpacing = (): HeaderSpacing => ({ type: 'spacing' });

/** Any element, or a function of the props of the header that renders one (for an action that reads hooks). */
export const headerCustom = (element: HeaderCustom['element'], options: Pick<HeaderCustom, 'ios'> = {}): HeaderCustom => ({
  ...options,
  element,
  type: 'custom',
});

/** An entry of a menu, that does something when pressed. */
export const menuAction = (config: Omit<HeaderMenuAction, 'type'>): HeaderMenuAction => ({ ...config, type: 'action' });

/** An entry of a menu that contains other entries. */
export const menuSubmenu = (config: Omit<HeaderMenuSubmenu, 'type'>): HeaderMenuSubmenu => ({ ...config, type: 'submenu' });
