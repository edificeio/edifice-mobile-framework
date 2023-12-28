import { ThunkDispatch } from 'redux-thunk';

// import { loginAction } from '~/framework/modules/auth/actions';
import { useConstructor } from '~/framework/hooks/constructor';
import { authInitAction, restoreAction } from '~/framework/modules/auth/actions';
import { appReadyAction } from '~/framework/navigation/redux';
import { StorageObject } from '~/framework/util/storage';

import { I18n } from './i18n';

const initFeatures = async () => {
  await StorageObject.init();
  await I18n.init();
};

// const MAX_STARTUP_TIME_MS = 15000;

/**
 * Logic code that is run for the app start
 */
export function useAppStartup(dispatch: ThunkDispatch<any, any, any>) {
  useConstructor(async () => {
    try {
      await initFeatures();
      const startupAccount = await (dispatch(authInitAction()) as unknown as ReturnType<ReturnType<typeof authInitAction>>); // TS-issue with dispatch
      if (startupAccount) {
        await (dispatch(restoreAction(startupAccount)) as unknown as ReturnType<ReturnType<typeof restoreAction>>); // TS-issue with dispatch
      }
    } catch (e) {
      console.warn('[Startup] Startup failed. Cause :', e);
    } finally {
      dispatch(appReadyAction());
    }
  });

  // React.useEffect(() => {
  //   initFeatures()
  //     .then(() => {
  //       loadStartupData();
  //       loadCurrentPlatform().then(platform => {
  //         if (platform) {
  //           let loginDone = false;
  //           dispatch(loginAction(platform, undefined))
  //             .then(redirect => {
  //               dispatch(actions.redirectAutoLogin(redirect));
  //             })
  //             .catch(() => {
  //               // Do nothing. Finally clause + default navigation state will handle the case.
  //             })
  //             .finally(() => {
  //               loginDone = true;
  //               setLoadedPlatform(platform);
  //               dispatch(appReadyAction());
  //             });
  //           setTimeout(() => {
  //             if (!loginDone) {
  //               dispatch(actions.sessionError(RuntimeAuthErrorCode.NETWORK_ERROR));
  //               setLoadedPlatform(platform);
  //               dispatch(appReadyAction());
  //             }
  //           }, MAX_STARTUP_TIME_MS);
  //         } else dispatch(appReadyAction());
  //       });
  //     })
  //     .catch(e => {
  //       console.warn(`[startup] startup error`, e);
  //       dispatch(appReadyAction());
  //     });
  //   // We WANT TO call this only once
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // React.useEffect(() => {
  //   Storage.init()
  //     .then(() =>
  //       I18n.init()
  //         .then(() =>
  //           loadCurrentPlatform().then(platform => {
  //             if (platform) {
  //               let loginDone = false;
  //               dispatch(loginAction(platform, undefined))
  //                 .then(redirect => {
  //                   dispatch(actions.redirectAutoLogin(redirect));
  //                 })
  //                 .catch(() => {
  //                   // Do nothing. Finally clause + default navigation state will handle the case.
  //                 })
  //                 .finally(() => {
  //                   loginDone = true;
  //                   setLoadedPlatform(platform);
  //                   dispatch(appReadyAction());
  //                 });
  //               setTimeout(() => {
  //                 if (!loginDone) {
  //                   dispatch(actions.sessionError(RuntimeAuthErrorCode.NETWORK_ERROR));
  //                   setLoadedPlatform(platform);
  //                   dispatch(appReadyAction());
  //                 }
  //               }, 15000);
  //             } else dispatch(appReadyAction());
  //           }),
  //         )
  //         .catch(e => {
  //           console.warn(`[startup] i18n init error`, e);
  //           dispatch(appReadyAction());
  //         }),
  //     )
  //     .catch(e => {
  //       console.warn(`[startup] storage init error`, e);
  //       dispatch(appReadyAction());
  //     });
  //   // We WANT TO call this only once
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // Update last-known platform if provided.
  // if (lastPlatform && lastPlatform !== loadedPlatform) {
  //   setLoadedPlatform(lastPlatform);
  //   return lastPlatform;
  // }
  // return loadedPlatform;
}
