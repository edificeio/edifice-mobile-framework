/**
 * Diary actions
 */
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import { IUser } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/reducer';
import { viescoService } from '~/framework/modules/viescolaire/common/service';
import { IDiarySession, IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import { actionTypes } from '~/framework/modules/viescolaire/diary/reducer';
import { diaryService } from '~/framework/modules/viescolaire/diary/service';
import { ISlot } from '~/framework/modules/viescolaire/edt/model';
import { edtService } from '~/framework/modules/viescolaire/edt/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

/**
 * Fetch the homeworks from a structure.
 */
export const diaryHomeworksActionsCreators = createAsyncActionCreators(actionTypes.homeworks);
export const fetchDiaryHomeworksAction =
  (structureId: string, startDate: string, endDate: string): ThunkAction<Promise<IHomeworkMap>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(diaryHomeworksActionsCreators.request());
      const homeworkMap = await diaryService.homeworks.get(session, structureId, startDate, endDate);
      dispatch(diaryHomeworksActionsCreators.receipt(homeworkMap));
      return homeworkMap;
    } catch (e) {
      dispatch(diaryHomeworksActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the homeworks from a child.
 */
export const fetchDiaryHomeworksFromChildAction =
  (childId: string, structureId: string, startDate: string, endDate: string): ThunkAction<Promise<IHomeworkMap>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(diaryHomeworksActionsCreators.request());
      const homeworkMap = await diaryService.homeworks.getFromChild(session, childId, structureId, startDate, endDate);
      dispatch(diaryHomeworksActionsCreators.receipt(homeworkMap));
      return homeworkMap;
    } catch (e) {
      dispatch(diaryHomeworksActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Update the progress of a specific homework.
 */
export const diaryUpdateHomeworkActionsCreators = createAsyncActionCreators(actionTypes.updateHomework);
export const updateDiaryHomeworkProgressAction =
  (homeworkId: number, isDone: boolean) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      const session = assertSession();
      dispatch(diaryUpdateHomeworkActionsCreators.request());
      const result = await diaryService.homework.updateProgress(session, homeworkId, isDone);
      dispatch(diaryUpdateHomeworkActionsCreators.receipt(result));
    } catch (e) {
      dispatch(diaryUpdateHomeworkActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the sessions from a structure.
 */
export const diarySessionsActionsCreators = createAsyncActionCreators(actionTypes.sessions);
export const fetchDiarySessionsAction =
  (structureId: string, startDate: string, endDate: string): ThunkAction<Promise<IDiarySession[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(diarySessionsActionsCreators.request());
      const sessions = await diaryService.sessions.get(session, structureId, startDate, endDate);
      dispatch(diarySessionsActionsCreators.receipt(sessions));
      return sessions;
    } catch (e) {
      dispatch(diarySessionsActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the sessions from a child.
 */
export const fetchDiarySessionsFromChildAction =
  (childId: string, startDate: string, endDate: string): ThunkAction<Promise<IDiarySession[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(diarySessionsActionsCreators.request());
      const sessions = await diaryService.sessions.getFromChild(session, childId, startDate, endDate);
      dispatch(diarySessionsActionsCreators.receipt(sessions));
      return sessions;
    } catch (e) {
      dispatch(diarySessionsActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the time slots.
 */
export const diarySlotsActionsCreators = createAsyncActionCreators(actionTypes.timeSlots);
export const fetchDiarySlotsAction =
  (structureId: string): ThunkAction<Promise<ISlot[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(diarySlotsActionsCreators.request());
      const slots = await edtService.slots.get(session, structureId);
      dispatch(diarySlotsActionsCreators.receipt(slots));
      return slots;
    } catch (e) {
      dispatch(diarySlotsActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the teachers.
 */
export const diaryTeachersActionsCreators = createAsyncActionCreators(actionTypes.teachers);
export const fetchDiaryTeachersAction =
  (structureId: string): ThunkAction<Promise<IUser[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(diaryTeachersActionsCreators.request());
      const teachers = await viescoService.teachers.get(session, structureId);
      dispatch(diaryTeachersActionsCreators.receipt(teachers));
      return teachers;
    } catch (e) {
      dispatch(diaryTeachersActionsCreators.error(e as Error));
      throw e;
    }
  };
