/**
 * Sub-module Competences Reducer
 */

import { ILevelsListState } from './state/competencesLevels';
import { IDevoirsMatieresState } from './state/devoirs';
import { IMoyenneListState } from './state/moyennes';
import { ICompetencesUserChildrenState } from './state/userChildren';

// State

export interface ICompetences_State {
  levels: ILevelsListState;
  devoirsMatieres: IDevoirsMatieresState;
  moyennesList: IMoyenneListState;
  userChildren: ICompetencesUserChildrenState;
}
