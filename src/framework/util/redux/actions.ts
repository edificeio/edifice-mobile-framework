import type { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { DoTrackArgLegacy, TrackEventOfModuleArgs, Trackers, trackingActionAddSuffix } from '~/framework/util/tracker';

export interface TryActionOptions<Args extends any[], ReturnType, TrackEventArgs = TrackEventOfModuleArgs> {
  track?: TrackEventArgs | ((returnedValue: Awaited<ReturnType> | Error, ...args: Args) => TrackEventArgs | undefined);
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
  opts?: TryActionOptions<Args, R>,
) {
  return ((...args: Args) =>
    async (dispatch: ThunkDispatch<IGlobalState, E, AnyAction>) => {
      try {
        const ret = await dispatch(action(...args));
        const trackOpt =
          opts?.track &&
          (typeof opts.track === 'function'
            ? opts.track(ret, ...args)
            : ([
                opts.track[0],
                opts.track[1],
                opts.track[2] && trackingActionAddSuffix(opts.track[2], true),
                opts.track[3],
              ] as TrackEventOfModuleArgs));
        if (trackOpt) Trackers.trackEventOfModule(...trackOpt);
        return ret;
      } catch (e) {
        const trackOpt =
          opts?.track &&
          (typeof opts.track === 'function'
            ? opts.track(e as Error, ...args)
            : ([
                opts.track[0],
                opts.track[1],
                opts.track[2] && trackingActionAddSuffix(opts.track[2], false),
                opts.track[3],
              ] as TrackEventOfModuleArgs));
        if (trackOpt) Trackers.trackEventOfModule(...trackOpt);
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
  opts?: TryActionOptions<Args, R>,
) {
  return performAction(
    action,
    e => {
      if (__DEV__) console.warn(action.name, e);
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
  opts?: TryActionOptions<Args, R>,
) {
  return performAction(
    action,
    e => {
      if (__DEV__) console.warn(action.name, e);
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
    trackInfo?: DoTrackArgLegacy | ((...args: Args) => DoTrackArgLegacy),
    throwback?: boolean,
  ) =>
  (...args: Args) =>
  async (dispatch: ThunkDispatch<IGlobalState, E, AnyAction>) => {
    const doTrack = typeof trackInfo === 'function' ? trackInfo(...args) : trackInfo;
    try {
      const ret = await dispatch(action(...args));
      if (doTrack) Trackers.trackEventOfModule(doTrack[0], doTrack[1], doTrack[2] + ' - Succès', doTrack[3]);
      return ret;
    } catch (e) {
      if (doTrack) Trackers.trackEventOfModule(doTrack[0], doTrack[1], doTrack[2] + ' - Échec', doTrack[3]);
      // ToDo : General error reporting here
      if (throwback) throw e;
    }
  };
