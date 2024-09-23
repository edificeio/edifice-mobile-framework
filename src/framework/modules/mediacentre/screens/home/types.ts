import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import {
  addFavoriteAction,
  fetchExternalsAction,
  fetchFavoritesAction,
  fetchSignetsAction,
  fetchTextbooksAction,
  removeFavoriteAction,
  searchResourcesAction,
} from '~/framework/modules/mediacentre/actions';
import { MediacentreNavigationParams, mediacentreRouteNames } from '~/framework/modules/mediacentre/navigation';
import { IResourceList, ISignets } from '~/framework/modules/mediacentre/reducer';

export interface MediacentreHomeScreenDispatchProps {
  handleAddFavorite: (...args: Parameters<typeof addFavoriteAction>) => Promise<void>;
  handleRemoveFavorite: (...args: Parameters<typeof removeFavoriteAction>) => Promise<void>;
  tryFetchExternals: (...args: Parameters<typeof fetchExternalsAction>) => Promise<IResourceList | undefined>;
  tryFetchFavorites: (...args: Parameters<typeof fetchFavoritesAction>) => Promise<IResourceList>;
  tryFetchSignets: (...args: Parameters<typeof fetchSignetsAction>) => Promise<ISignets>;
  tryFetchTextbooks: (...args: Parameters<typeof fetchTextbooksAction>) => Promise<IResourceList>;
  trySearchResources: (...args: Parameters<typeof searchResourcesAction>) => Promise<IResourceList>;
}

export interface MediacentreHomeScreenNavParams {}

export interface MediacentreHomeScreenProps {}

export interface MediacentreHomeScreenStoreProps {
  externals: IResourceList;
  favorites: IResourceList;
  isFetchingSearch: boolean;
  isFetchingSections: boolean;
  search: IResourceList;
  signets: ISignets;
  textbooks: IResourceList;
  session?: AuthActiveAccount;
}

export interface MediacentreHomeScreenPrivateProps
  extends NativeStackScreenProps<MediacentreNavigationParams, typeof mediacentreRouteNames.home>,
    MediacentreHomeScreenProps,
    MediacentreHomeScreenStoreProps,
    MediacentreHomeScreenDispatchProps {}
