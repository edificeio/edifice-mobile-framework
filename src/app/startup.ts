import * as React from 'react';
import { ThunkDispatch } from 'redux-thunk';

import { loginAction } from '~/framework/modules/auth/actions';
import { actions } from '~/framework/modules/auth/reducer';
import { loadCurrentPlatform } from '~/framework/modules/auth/service';
import { appReadyAction } from '~/framework/navigation/redux';
import { Platform } from '~/framework/util/appConf';

/**
 * Logic code that is run for the app start
 */
export function useAppStartup(dispatch: ThunkDispatch<any, any, any>, lastPlatform?: Platform) {
  const [loadedPlatform, setLoadedPlatform] = React.useState<Platform | undefined>(undefined);
  React.useEffect(() => {
    loadCurrentPlatform()
      .then(platform => {
        if (platform)
          dispatch(loginAction(platform, undefined))
            .then(redirect => {
              dispatch(actions.redirectAutoLogin(redirect));
            })
            .catch(() => {
              // Do nothing. Finally clause + default navigation state will handle the case.
            })
            .finally(() => {
              setLoadedPlatform(platform);
              dispatch(appReadyAction());
            });
        else dispatch(appReadyAction());
      })
      .catch(() => {
        dispatch(appReadyAction());
      });
    // We WANT TO call this only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update last-known platform if provided.
  if (lastPlatform && lastPlatform !== loadedPlatform) {
    setLoadedPlatform(lastPlatform);
    return lastPlatform;
  }
  return loadedPlatform;
}
