import moment from 'moment';
import { EmitterSubscription, Vibration } from 'react-native';
import RNShake from 'react-native-shake';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import { getUserSession } from '~/framework/util/session';
import { getItemJson, setItemJson } from '~/framework/util/storage';

const computeAsyncStorageKey = () => {
  const session = getUserSession();
  const userId = session.user.id;
  return `xmasThemeSetting.${userId}`;
};

const SNOW_DURATION = 20000;
let snowfallTimer: NodeJS.Timeout;

function nextOccurrence(from: moment.Moment, month: number, date: number) {
  const input = moment(from);
  const output = input.clone().startOf('month').month(month).date(date);
  return output > input ? output : output.add(1, 'years');
}
const today = moment();
const todayMinus = today.clone().subtract(11, 'months').add(15, 'days'); // Xmas activated from Dec 1st to Jan 15th !
const limit = nextOccurrence(todayMinus, 0, 15); // 0, 15 = Jan 15th
export const isXmasDateLimitCrossed = today.isAfter(limit);

export const getIsXmasActive = (state: IGlobalState) => state.user.xmas.xmasTheme !== false && !isXmasDateLimitCrossed;

export const letItSnowAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => {
  try {
    if (!getIsXmasActive(getState())) return;
    dispatch({ type: 'setFlakes', value: true });
    if (snowfallTimer) {
      clearTimeout(snowfallTimer);
    }
    snowfallTimer = setTimeout(() => dispatch({ type: 'setFlakes', value: false }), SNOW_DURATION);
  } catch (e) {
    // ToDo: Error handling
  }
};

export const stopItSnowAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => {
  try {
    if (!getIsXmasActive(getState())) return;
    dispatch({ type: 'setFlakes', value: false });
    if (snowfallTimer) {
      clearTimeout(snowfallTimer);
    }
  } catch (e) {
    // ToDo: Error handling
  }
};

let shakeListener: EmitterSubscription | undefined;

const updateShakeListenerAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => {
  try {
    if (shakeListener === undefined && getIsXmasActive(getState())) {
      shakeListener = RNShake.addListener(() => {
        Vibration.vibrate();
        dispatch(letItSnowAction());
      });
    } else if (shakeListener !== undefined && !getIsXmasActive(getState())) {
      shakeListener.remove();
      shakeListener = undefined;
    }
  } catch (e) {
    // Nothing
  }
};

export const importXmasThemeAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => {
  try {
    const asyncStorageKey = computeAsyncStorageKey();
    const xmasSetting = (await getItemJson(asyncStorageKey)) as boolean | undefined;
    dispatch({ type: 'toggleXmasTheme', value: xmasSetting });
    dispatch(updateShakeListenerAction());
    return xmasSetting ?? true; // default value
  } catch (e) {
    // If error, we reset to the inital behaviour => snow theme on
    dispatch({ type: 'toggleXmasTheme', value: true });
    return true;
  }
};

export const setXmasThemeAction = (xmasTheme: boolean) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const asyncStorageKey = computeAsyncStorageKey();
    dispatch({ type: 'toggleXmasTheme', value: xmasTheme });
    await setItemJson(asyncStorageKey, xmasTheme);
    dispatch(updateShakeListenerAction());
    if (xmasTheme === true) {
      dispatch(letItSnowAction());
    }
  } catch (e) {
    // If error, we dactivate snow theme for now
    dispatch({ type: 'toggleXmasTheme', value: false });
  }
};