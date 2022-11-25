import { ThunkDispatch } from 'redux-thunk';

import moduleConfig from '~/framework/modules/timelinev2/moduleConfig';
import { getUserSession } from '~/framework/util/session';

export const setXmasThemeAction = (xmasTheme: boolean) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession();
    const userId = session.user.id;
    const asyncStorageKey = `${moduleConfig.name}.xmasThemeSetting.${userId}`;
    dispatch({ type: 'toggleXmasTheme', xmasTheme });
    // await setItemJson(asyncStorageKey, xmasTheme);
  } catch (e) {
    // ToDo: Error handling
  }
};
