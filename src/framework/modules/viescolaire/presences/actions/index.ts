/**
 * Presences actions
 */
import { Moment } from 'moment';
import { ThunkAction } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';
import { ISchoolYear, ITerm } from '~/framework/modules/viescolaire/common/model';
import { viescoService } from '~/framework/modules/viescolaire/common/service';
import {
  Call,
  ChildEvents,
  Course,
  Event,
  EventReason,
  PresencesUserChild,
  Statistics,
  compareEvents,
} from '~/framework/modules/viescolaire/presences/model';
import { actionTypes } from '~/framework/modules/viescolaire/presences/reducer';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

import { getPresencesWorkflowInformation } from '../rights';

export const presencesChildrenEventsActionsCreators = createAsyncActionCreators(actionTypes.childrenEvents);
export const fetchPresencesChildrenEventsAction =
  (structureId: string, studentIds: string[]): ThunkAction<Promise<{ [key: string]: ChildEvents }>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesChildrenEventsActionsCreators.request());
      const events = await presencesService.studentsEvents.get(session, structureId, studentIds);
      dispatch(presencesChildrenEventsActionsCreators.receipt(events));
      return events;
    } catch (e) {
      dispatch(presencesChildrenEventsActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesCallActionsCreators = createAsyncActionCreators(actionTypes.call);
export const fetchPresencesCallAction =
  (id: number): ThunkAction<Promise<Call>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesCallActionsCreators.request());
      const call = await presencesService.call.get(session, id);
      dispatch(presencesCallActionsCreators.receipt(call));
      return call;
    } catch (e) {
      dispatch(presencesCallActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesCoursesActionsCreators = createAsyncActionCreators(actionTypes.courses);
export const fetchPresencesCoursesAction =
  (
    teacherId: string,
    structureIds: string[],
    date: Moment,
    allowMultipleSlots?: boolean,
  ): ThunkAction<Promise<Course[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      let courses: Course[] = [];
      const session = assertSession();
      const state = getState();
      const dateStr = date.format('YYYY-MM-DD');
      dispatch(presencesCoursesActionsCreators.request());
      for (const structureId of structureIds) {
        courses = courses.concat(
          await presencesService.courses.get(session, teacherId, structureId, dateStr, dateStr, allowMultipleSlots),
        );
      }
      dispatch(presencesCoursesActionsCreators.receipt({ ...state.presences.courses.data, [dateStr]: courses }));
      return courses;
    } catch (e) {
      dispatch(presencesCoursesActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesEventReasonsActionsCreators = createAsyncActionCreators(actionTypes.eventReasons);
export const fetchPresencesEventReasonsAction =
  (structureId: string): ThunkAction<Promise<EventReason[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesEventReasonsActionsCreators.request());
      const eventReasons = await presencesService.eventReasons.get(session, structureId);
      dispatch(presencesEventReasonsActionsCreators.receipt(eventReasons));
      return eventReasons;
    } catch (e) {
      dispatch(presencesEventReasonsActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesHistoryActionsCreators = createAsyncActionCreators(actionTypes.history);
export const fetchPresencesHistoryAction =
  (studentId: string, structureId: string, startDate: Moment, endDate: Moment): ThunkAction<Promise<Event[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      const start = startDate.format('YYYY-MM-DD');
      const end = endDate.format('YYYY-MM-DD');
      dispatch(presencesHistoryActionsCreators.request());
      const absences = await presencesService.absences.get(
        session,
        studentId,
        structureId,
        start,
        endDate.add(1, 'month').format('YYYY-MM-DD'),
      );
      const events = await presencesService.history.getEvents(session, studentId, structureId, start, end);
      const history: Event[] = [
        ...absences,
        ...events.DEPARTURE.events,
        ...events.NO_REASON.events,
        ...events.LATENESS.events,
        ...events.REGULARIZED.events,
        ...events.UNREGULARIZED.events,
      ].sort(compareEvents);

      if (getPresencesWorkflowInformation(session).presences2d) {
        const { FORGOTTEN_NOTEBOOK } = await presencesService.history.getForgottenNotebookEvents(
          session,
          studentId,
          structureId,
          start,
          end,
        );
        const { INCIDENT, PUNISHMENT } = await presencesService.history.getIncidents(session, studentId, structureId, start, end);
        history.push(...FORGOTTEN_NOTEBOOK!.events, ...INCIDENT!.events, ...PUNISHMENT!.events);
      }
      history.sort(compareEvents);
      dispatch(presencesHistoryActionsCreators.receipt(history));
      return history;
    } catch (e) {
      dispatch(presencesHistoryActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesMultipleSlotActionsCreators = createAsyncActionCreators(actionTypes.multipleSlotsSetting);
export const fetchPresencesMultipleSlotSettingAction =
  (structureId: string): ThunkAction<Promise<boolean>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesMultipleSlotActionsCreators.request());
      const allowMultipleSlots = await presencesService.settings.getAllowMultipleSlots(session, structureId);
      dispatch(presencesMultipleSlotActionsCreators.receipt(allowMultipleSlots));
      return allowMultipleSlots;
    } catch (e) {
      dispatch(presencesMultipleSlotActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesRegisterPreferenceActionsCreators = createAsyncActionCreators(actionTypes.registerPreference);
export const fetchPresencesRegisterPreferenceAction =
  (): ThunkAction<Promise<string>, any, any, any> => async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesRegisterPreferenceActionsCreators.request());
      const registerPreference = await presencesService.preferences.getRegister(session);
      dispatch(presencesRegisterPreferenceActionsCreators.receipt(registerPreference));
      return registerPreference;
    } catch (e) {
      dispatch(presencesRegisterPreferenceActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesSchoolYearActionsCreators = createAsyncActionCreators(actionTypes.schoolYear);
export const fetchPresencesSchoolYearAction =
  (structureId: string): ThunkAction<Promise<ISchoolYear>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesSchoolYearActionsCreators.request());
      const schoolYear = await viescoService.schoolYear.get(session, structureId);
      dispatch(presencesSchoolYearActionsCreators.receipt(schoolYear));
      return schoolYear;
    } catch (e) {
      dispatch(presencesSchoolYearActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesStatisticsActionsCreators = createAsyncActionCreators(actionTypes.statistics);
export const fetchPresencesStatisticsAction =
  (studentId: string, structureId: string, startDate: Moment, endDate: Moment): ThunkAction<Promise<Statistics>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      const start = startDate.format('YYYY-MM-DD');
      const end = endDate.format('YYYY-MM-DD');
      dispatch(presencesStatisticsActionsCreators.request());
      const statistics = {
        ...(await presencesService.history.getEvents(session, studentId, structureId, start, end)),
        ...(getPresencesWorkflowInformation(session).presences2d
          ? {
              ...(await presencesService.history.getForgottenNotebookEvents(session, studentId, structureId, start, end)),
              ...(await presencesService.history.getIncidents(session, studentId, structureId, start, end)),
            }
          : {}),
      };
      dispatch(presencesStatisticsActionsCreators.receipt(statistics));
      return statistics;
    } catch (e) {
      dispatch(presencesStatisticsActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesTermsActionsCreators = createAsyncActionCreators(actionTypes.terms);
export const fetchPresencesTermsAction =
  (structureId: string, groupId: string): ThunkAction<Promise<ITerm[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesTermsActionsCreators.request());
      const terms = await viescoService.terms.get(session, structureId, groupId);
      dispatch(presencesTermsActionsCreators.receipt(terms));
      return terms;
    } catch (e) {
      dispatch(presencesTermsActionsCreators.error(e as Error));
      throw e;
    }
  };

export const presencesUserChildrenActionsCreators = createAsyncActionCreators(actionTypes.userChildren);
export const fetchPresencesUserChildrenAction =
  (relativeId: string): ThunkAction<Promise<PresencesUserChild[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(presencesUserChildrenActionsCreators.request());
      const userChildren = await presencesService.userChildren.get(session, relativeId);
      dispatch(presencesUserChildrenActionsCreators.receipt(userChildren));
      return userChildren;
    } catch (e) {
      dispatch(presencesUserChildrenActionsCreators.error(e as Error));
      throw e;
    }
  };
