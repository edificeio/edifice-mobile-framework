/**
 * Médiacentre Reducer
 */

import { IFavoritesState } from './state/favorites';
import { ISearchState } from './state/search';
import { ISignetsState } from './state/signets';
import { ITextbooksState } from './state/textbooks';

// State

export interface IMediacentre_State {
  favorites: IFavoritesState;
  search: ISearchState;
  signets: ISignetsState;
  textbooks: ITextbooksState;
}
