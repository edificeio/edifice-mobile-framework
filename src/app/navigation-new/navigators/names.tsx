/**
 * Navigation route names
 *
 * The names of the routes that the navigators compute (tab screens) and the constants that define them.
 * This file must stay free of any runtime import (types only): `hooks/` uses it, and `hooks/` is re-exported by the navigation index,
 * which must not load the navigators (see the comment of `../index.tsx`).
 */
import type { AnyTabModule, useCoreModuleScreens } from '~/app/module';

/** Name of the tab screen of a module, as built by `getTabScreenName`. */
export type TabScreenName<Name extends string> = `$tab/${Name}`;

/**
 * Name of the tab screen of a module. Use it to navigate to the tab itself.
 */
export const getTabScreenName = <Name extends AnyTabModule['name']>(name: Name): TabScreenName<Name> => `$tab/${name}`;

/** First screen of the root stack while signed out: it must be the first of the guest screens. */
export const GUEST_START_SCREEN: keyof ReturnType<typeof useCoreModuleScreens> = 'auth/$load-account';

export const TABS_SCREEN_NAME = '$tabs';
