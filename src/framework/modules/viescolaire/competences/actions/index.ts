/**
 * Competences actions
 */
import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';
import { IClassGroups, ITerm } from '~/framework/modules/viescolaire/common/model';
import { viescoService } from '~/framework/modules/viescolaire/common/service';
import {
  IAverage,
  ICompetence,
  IDevoir,
  IDomaine,
  ILevel,
  ISubject,
  IUserChild,
} from '~/framework/modules/viescolaire/competences/model';
import { actionTypes } from '~/framework/modules/viescolaire/competences/reducer';
import { competencesService } from '~/framework/modules/viescolaire/competences/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

/**
 * Fetch the averages.
 */
export const competencesAveragesActionsCreators = createAsyncActionCreators(actionTypes.averages);
export const fetchCompetencesAveragesAction =
  (structureId: string, studentId: string, termId?: string): ThunkAction<Promise<IAverage[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(competencesAveragesActionsCreators.request());
      const averages = await competencesService.averages.get(session, structureId, studentId, termId);
      dispatch(competencesAveragesActionsCreators.receipt(averages));
      return averages;
    } catch (e) {
      dispatch(competencesAveragesActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the class groups.
 */
export const competencesClassGroupsActionsCreators = createAsyncActionCreators(actionTypes.classGroups);
export const fetchCompetencesClassGroupsAction =
  (classes: string, studentId?: string): ThunkAction<Promise<IClassGroups[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(competencesClassGroupsActionsCreators.request());
      const classGroups = await viescoService.classGroups.get(session, classes, studentId);
      dispatch(competencesClassGroupsActionsCreators.receipt(classGroups));
      return classGroups;
    } catch (e) {
      dispatch(competencesClassGroupsActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the competences.
 */
export const competencesCompetencesActionsCreators = createAsyncActionCreators(actionTypes.competences);
export const fetchCompetencesAction =
  (studentId: string, classId: string): ThunkAction<Promise<ICompetence[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(competencesCompetencesActionsCreators.request());
      const competences = await competencesService.competences.get(session, studentId, classId);
      dispatch(competencesCompetencesActionsCreators.receipt(competences));
      return competences;
    } catch (e) {
      dispatch(competencesCompetencesActionsCreators.error(e as Error));
      throw e;
    }
  };

export const clearCompetencesAction = () => {
  return async (dispatch: Dispatch) => {
    dispatch(competencesCompetencesActionsCreators.clear());
  };
};

/**
 * Fetch the assessments.
 */
export const competencesDevoirsActionsCreators = createAsyncActionCreators(actionTypes.devoirs);
export const fetchCompetencesDevoirsAction =
  (structureId: string, studentId: string): ThunkAction<Promise<IDevoir[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(competencesDevoirsActionsCreators.request());
      const devoirs = await competencesService.devoirs.get(session, structureId, studentId);
      dispatch(competencesDevoirsActionsCreators.receipt(devoirs));
      return devoirs;
    } catch (e) {
      dispatch(competencesDevoirsActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the assessments.
 */
export const competencesDomainesActionsCreators = createAsyncActionCreators(actionTypes.domaines);
export const fetchCompetencesDomainesAction =
  (classId: string): ThunkAction<Promise<IDomaine[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(competencesDomainesActionsCreators.request());
      const domaines = await competencesService.domaines.get(session, classId);
      dispatch(competencesDomainesActionsCreators.receipt(domaines));
      return domaines;
    } catch (e) {
      dispatch(competencesDomainesActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the levels.
 */
export const competencesLevelsActionsCreators = createAsyncActionCreators(actionTypes.levels);
export const fetchCompetencesLevelsAction =
  (structureId: string): ThunkAction<Promise<ILevel[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(competencesLevelsActionsCreators.request());
      const levels = await competencesService.levels.get(session, structureId);
      dispatch(competencesLevelsActionsCreators.receipt(levels));
      return levels;
    } catch (e) {
      dispatch(competencesLevelsActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the subjects.
 */
export const competencesSubjectsActionsCreators = createAsyncActionCreators(actionTypes.subjects);
export const fetchCompetencesSubjectsAction =
  (structureId: string): ThunkAction<Promise<ISubject[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(competencesSubjectsActionsCreators.request());
      const subjects = await competencesService.subjects.get(session, structureId);
      dispatch(competencesSubjectsActionsCreators.receipt(subjects));
      return subjects;
    } catch (e) {
      dispatch(competencesSubjectsActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the school terms.
 */
export const competencesTermsActionsCreators = createAsyncActionCreators(actionTypes.terms);
export const fetchCompetencesTermsAction =
  (structureId: string, groupId: string): ThunkAction<Promise<ITerm[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(competencesTermsActionsCreators.request());
      const terms = await viescoService.terms.get(session, structureId, groupId);
      dispatch(competencesTermsActionsCreators.receipt(terms));
      return terms;
    } catch (e) {
      dispatch(competencesTermsActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the user children.
 */
export const competencesUserChildrenActionsCreators = createAsyncActionCreators(actionTypes.userChildren);
export const fetchCompetencesUserChildrenAction =
  (structureId: string, relativeId: string): ThunkAction<Promise<IUserChild[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(competencesUserChildrenActionsCreators.request());
      const userChildren = await competencesService.userChildren.get(session, structureId, relativeId);
      dispatch(competencesUserChildrenActionsCreators.receipt(userChildren));
      return userChildren;
    } catch (e) {
      dispatch(competencesUserChildrenActionsCreators.error(e as Error));
      throw e;
    }
  };
