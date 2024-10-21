import { ThunkAction } from 'redux-thunk';

import { getFlattenedChildren } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/reducer';
import { actionTypes, getChildStorageKey, getStructureStorageKey } from '~/framework/modules/viescolaire/dashboard/reducer';
import { OldStorageFunctions } from '~/framework/util/storage';

export const selectChildAction = (childId: string, userId?: string) => async (dispatch, getState) => {
  await dispatch({ childId, type: actionTypes.selectChild, userId });
};

export const selectStructureAction = (structureId: string, userId?: string) => async (dispatch, getState) => {
  await dispatch({ structureId, type: actionTypes.selectStructure, userId });
};

export const loadStoredChildAction = (): ThunkAction<Promise<string | undefined>, any, any, any> => async (dispatch, getState) => {
  try {
    const session = assertSession();
    const selectedChildId = await OldStorageFunctions.getItemJson<string>(getChildStorageKey(session.user.id));
    const children = getFlattenedChildren(session.user.children);

    if (selectedChildId && children?.findIndex(child => child.id === selectedChildId) !== -1) {
      dispatch({ childId: selectedChildId, type: actionTypes.selectChild, userId: session.user.id });
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
      const selectedStructureId = await OldStorageFunctions.getItemJson<string>(getStructureStorageKey(session.user.id));

      if (selectedStructureId && session.user.structures?.findIndex(structure => structure.id === selectedStructureId) !== -1) {
        dispatch({ structureId: selectedStructureId, type: actionTypes.selectStructure, userId: session.user.id });
        return selectedStructureId;
      }
    } catch {
      throw new Error();
    }
  };
