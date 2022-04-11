import { IExternalsState } from './state/externals';
import { IFavoritesState } from './state/favorites';
import { ISearchState } from './state/search';
import { ISignetsState } from './state/signets';
import { ITextbooksState } from './state/textbooks';

export interface IMediacentre_State {
  externals: IExternalsState;
  favorites: IFavoritesState;
  search: ISearchState;
  signets: ISignetsState;
  textbooks: ITextbooksState;
}
