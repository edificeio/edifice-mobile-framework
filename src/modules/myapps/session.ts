/**
 * What « Mes applis » loads when a session starts (hooks of `ConfigForSession`, see `src/app/module/types.ts`):
 * - the apps, before the session exists (`sessionSetup`): the tabs and the list need them as soon as the app shows. Blocking, as in
 *   the old module: if they can't be loaded, the sign-in fails;
 * - the preferences (favorites), once it has started (`onSessionStart`): only « Mes applis » needs them. A failure is only shown by
 *   the screen (`error` status), which can load them again (`refreshMyApps`).
 */
import type { ConfigForSession } from '~/app/module/types';
import type { Translate } from '~/modules/myapps/model';
import { myAppsService } from '~/modules/myapps/service';
import { MyAppsAction, myAppsActions } from '~/modules/myapps/store';

export const createMyAppsSessionHooks = ({
  dispatch,
  translate,
}: {
  /** Dispatches to the store of the app (it doesn't exist yet when the module is declared). */
  dispatch: (action: MyAppsAction) => void;
  /** Translates the labels of the apps (`I18n.get`). */
  translate: Translate;
}): Required<Pick<ConfigForSession, 'onSessionStart' | 'sessionSetup'>> => ({
  onSessionStart: async (session, { signal }) => {
    try {
      const preferences = await myAppsService.preferences.get(session, { signal });
      if (!signal.aborted) dispatch(myAppsActions.preferencesLoaded(preferences));
    } catch (e) {
      if (signal.aborted) return;
      console.warn('[MyApps] Failed to load the preferences', e);
      dispatch(myAppsActions.preferencesFailed());
    }
  },

  // Writes nothing before the session exists: the `commit` does
  sessionSetup: async (session, { signal }) => {
    const apps = await myAppsService.apps(session, { signal, translate });
    return { commit: () => dispatch(myAppsActions.appsLoaded(apps)) };
  },
});
