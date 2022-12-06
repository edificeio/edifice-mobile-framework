import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import moduleConfig from '~/framework/modules/timelinev2/moduleConfig';
import { IUserSession, getUserSession } from '~/framework/util/session';
import { getItemJson, setItemJson } from '~/framework/util/storage';

const computeAsyncStorageKey = () => {
  const session = getUserSession();
  const userId = session.user.id;
  return `${moduleConfig.name}.xmasThemeSetting.${userId}`;
};

export const importXmasThemeAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => {
  try {
    const asyncStorageKey = computeAsyncStorageKey();
    const xmasSetting = (await getItemJson(asyncStorageKey)) as boolean | undefined;
    dispatch({ type: 'toggleXmasTheme', value: xmasSetting });
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
  } catch (e) {
    // If error, we dactivate snow theme for now
    dispatch({ type: 'toggleXmasTheme', value: false });
  }
};

const SNOW_DURATION = 30000;
let snowfallTimer: NodeJS.Timeout;

export const letItSnowAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => {
  try {
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
    dispatch({ type: 'setFlakes', value: false });
    if (snowfallTimer) {
      clearTimeout(snowfallTimer);
    }
  } catch (e) {
    // ToDo: Error handling
  }
};
