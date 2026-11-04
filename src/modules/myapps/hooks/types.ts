/**
 * Types of the public API of « Mes applis » (hooks).
 */
import type { ThunkDispatch } from 'redux-thunk';

import type { IShades } from '~/app/theme';
import type { MyAppsAction, MyAppsRootState } from '~/modules/myapps/store';

export type MyAppsDispatch = ThunkDispatch<MyAppsRootState, unknown, MyAppsAction>;

/** How to show an app (see `useEntAppDisplay`). */
export interface EntAppDisplay {
  /** The shades of the color of the app, or the primary ones. */
  colors: IShades;
  /** Name of the icon of the app (an `Svg`), or a default one. */
  icon: string;
  label: string;
}
