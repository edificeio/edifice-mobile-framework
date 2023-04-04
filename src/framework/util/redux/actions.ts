import { AnyAction, Dispatch } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import { DoTrackArg, Trackers } from '~/framework/util/tracker';

interface TryActionOptions<Args extends any[]> {
  track?: DoTrackArg | ((...args: Args) => DoTrackArg);
}

/** must declare correct type for bindActionCreators since built-in types are unusable.
 * Use it with dispatch prop type as a single type paramter:
 * bindActionCreators<IActivationPageEventProps>({...})
 */
declare module 'redux' {
  function bindActionCreators<
    P extends { [prop in keyof any]: any },
    M extends {
      [key in keyof P]: (...args: Parameters<P[key]>) => ThunkAction<ReturnType<P[key]>, IGlobalState, any, AnyAction>;
    } = { [key in keyof P]: (...args: Parameters<P[key]>) => ThunkAction<ReturnType<P[key]>, IGlobalState, any, AnyAction> },
  >(actionCreators: M, dispatch: Dispatch): { [key in keyof P]: (...args: Parameters<P[key]>) => ReturnType<P[key]> };
}

/**
 * Returns a thunk that launch another thunk with some options.
 * Options include tracking and error management.
 * @param action
 * @param onCatch
 * @param opts
 * @returns
 */
function performAction<Args extends any[], R, E>(
  action: (...args: Args) => ThunkAction<R, IGlobalState, E, AnyAction>,
  onCatch: (e: unknown) => void,
  opts?: TryActionOptions<Args>,
) {
  return ((...args: Args) =>
    async (dispatch: ThunkDispatch<IGlobalState, E, AnyAction>) => {
      try {
        const ret = await dispatch(action(...args));
        if (opts?.track) Trackers.trackEventOfModule(opts.track[0], opts.track[1], opts.track[2] + ' - Succès', opts.track[3]);
        return ret;
      } catch (e) {
        if (opts?.track) Trackers.trackEventOfModule(opts.track[0], opts.track[1], opts.track[2] + ' - Échec', opts.track[3]);
        onCatch(e);
      }
    }) as unknown as (...args: Args) => ThunkAction<R, IGlobalState, E, AnyAction>;
}

/**
 * Return a thunk-action with tracking options as a promise.
 * If an exception is thrown, it will be logged into the console but you must catch it yourself in a try/catch block, or with `tryAction(...).catch(...)`.
 * @param action the redux thunk action to call
 * @param opts options to add to the action call (tracking, etc)
 * @returns the action result in a Promise
 * @throws Throws back any exception that is thrown by the action.
 */
export function tryAction<Args extends any[], R, E>(
  action: (...args: Args) => ThunkAction<R, IGlobalState, E, AnyAction>,
  opts?: TryActionOptions<Args>,
) {
  return performAction(
    action,
    e => {
      console.warn(action.name, e);
      throw e;
    },
    opts,
  );
}

/**
 * Return a thunk-action with tracking options as a promise.
 * If an exception is thrown, it will be eaten and logged into the console.
 * If you need to handle error manually, use `tryAction().catch()` instead.
 * @param action the redux thunk action to call
 * @param opts options to add to the action call (tracking, etc)
 * @returns the action result in a Promise
 */
export function handleAction<Args extends any[], R, E>(
  action: (...args: Args) => ThunkAction<R, IGlobalState, E, AnyAction>,
  opts?: TryActionOptions<Args>,
) {
  return performAction(
    action,
    e => {
      console.warn(action.name, e);
    },
    opts,
  );
}

/**
 *
 * @param action
 * @param trackInfo
 * @param throwback
 * @returns
 * @deprecated
 */
export const tryActionLegacy =
  <Args extends any[], R, E>(
    action: (...args: Args) => ThunkAction<R, IGlobalState, E, AnyAction>,
    trackInfo?: DoTrackArg | ((...args: Args) => DoTrackArg),
    throwback?: boolean,
  ) =>
  (...args: Args) =>
  async (dispatch: ThunkDispatch<IGlobalState, E, AnyAction>) => {
    const doTrack = typeof trackInfo === 'function' ? trackInfo(...args) : trackInfo;
    try {
      const ret = await dispatch(action(...args));
      doTrack && Trackers.trackEventOfModule(doTrack[0], doTrack[1], doTrack[2] + ' - Succès', doTrack[3]);
      return ret;
    } catch (e) {
      doTrack && Trackers.trackEventOfModule(doTrack[0], doTrack[1], doTrack[2] + ' - Échec', doTrack[3]);
      // ToDo : General error reporting here
      if (throwback) throw e;
    }
  };
