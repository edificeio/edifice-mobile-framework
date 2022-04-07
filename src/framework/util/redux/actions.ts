import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import { DoTrackArg, Trackers } from '~/framework/util/tracker';

export const tryAction =
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
