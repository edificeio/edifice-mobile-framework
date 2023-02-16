/**
 * Competences actions
 */
import { ThunkAction } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';
import { IClassGroups, ITerm } from '~/framework/modules/viescolaire/common/model';
import { viescoService } from '~/framework/modules/viescolaire/common/service';
import { IDevoirsMatieres, ILevel, IMoyenne, IUserChild } from '~/framework/modules/viescolaire/competences/model';
import { actionTypes } from '~/framework/modules/viescolaire/competences/reducer';
import { competencesService } from '~/framework/modules/viescolaire/competences/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

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
 * Fetch the homeworks.
 */
export const competencesDevoirsActionsCreators = createAsyncActionCreators(actionTypes.devoirsMatieres);
export const fetchCompetencesDevoirsAction =
  (structureId: string, eleve: string, periods?: string, matiere?: string): ThunkAction<Promise<IDevoirsMatieres>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      dispatch(competencesDevoirsActionsCreators.clear());
      const session = assertSession();
      dispatch(competencesDevoirsActionsCreators.request());
      const devoirs = await competencesService.devoirs.get(session, structureId, eleve, periods, matiere);
      dispatch(competencesDevoirsActionsCreators.receipt(devoirs));
      return devoirs;
    } catch (e) {
      dispatch(competencesDevoirsActionsCreators.error(e as Error));
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
      dispatch(competencesLevelsActionsCreators.clear());
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
 * Fetch the grades.
 */
export const competencesMoyennesActionsCreators = createAsyncActionCreators(actionTypes.moyennes);
export const fetchCompetencesMoyennesAction =
  (structureId: string, studentId: string, periodId?: string): ThunkAction<Promise<IMoyenne[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      dispatch(competencesMoyennesActionsCreators.clear());
      const session = assertSession();
      dispatch(competencesMoyennesActionsCreators.request());
      const moyennes = await competencesService.moyennes.get(session, structureId, studentId, periodId);
      dispatch(competencesMoyennesActionsCreators.receipt(moyennes));
      return moyennes;
    } catch (e) {
      dispatch(competencesMoyennesActionsCreators.error(e as Error));
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
  (relativeId: string): ThunkAction<Promise<IUserChild[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(competencesUserChildrenActionsCreators.request());
      const userChildren = await competencesService.userChildren.get(session, relativeId);
      dispatch(competencesUserChildrenActionsCreators.receipt(userChildren));
      return userChildren;
    } catch (e) {
      dispatch(competencesUserChildrenActionsCreators.error(e as Error));
      throw e;
    }
  };
