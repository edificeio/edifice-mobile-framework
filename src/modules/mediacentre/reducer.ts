import { IFavoritesState } from './state/favorites';
import { IGarResourcesState } from './state/garResources';
import { ISearchState } from './state/search';
import { ISignetsState } from './state/signets';
import { ITextbooksState } from './state/textbooks';

export interface IMediacentre_State {
  favorites: IFavoritesState;
  garResources: IGarResourcesState;
  search: ISearchState;
  signets: ISignetsState;
  textbooks: ITextbooksState;
}
