import { ThunkAction } from 'redux-thunk';

import { getFlattenedChildren } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/reducer';
import { actionTypes, getChildStorageKey, getStructureStorageKey } from '~/framework/modules/viescolaire/dashboard/reducer';
import { getItemJson } from '~/framework/util/storage';

export const selectChildAction = (childId: string, userId?: string) => async (dispatch, getState) => {
  await dispatch({ type: actionTypes.selectChild, childId, userId });
};

export const selectStructureAction = (structureId: string, userId?: string) => async (dispatch, getState) => {
  await dispatch({ type: actionTypes.selectStructure, structureId, userId });
};

export const loadStoredChildAction = (): ThunkAction<Promise<string | undefined>, any, any, any> => async (dispatch, getState) => {
  try {
    const session = assertSession();
    const selectedChildId = await getItemJson<string>(getChildStorageKey(session.user.id));
    const children = getFlattenedChildren(session.user.children);

    if (selectedChildId && children?.findIndex(child => child.id === selectedChildId) !== -1) {
      dispatch({ type: actionTypes.selectChild, childId: selectedChildId, userId: session.user.id });
      return selectedChildId;
    }
  } catch {
    throw new Error();
  }
};

export const loadStoredStructureAction =
  (): ThunkAction<Promise<string | undefined>, any, any, any> => async (dispatch, getState) => {
    try {
      const session = assertSession();
      const selectedStructureId = await getItemJson<string>(getStructureStorageKey(session.user.id));

      if (selectedStructureId && session.user.structures?.findIndex(structure => structure.id === selectedStructureId) !== -1) {
        dispatch({ type: actionTypes.selectStructure, structureId: selectedStructureId, userId: session.user.id });
        return selectedStructureId;
      }
    } catch {
      throw new Error();
    }
  };
