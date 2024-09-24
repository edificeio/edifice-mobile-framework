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
import { Resource, Signets } from '~/framework/modules/mediacentre/model';
import { MediacentreNavigationParams, mediacentreRouteNames } from '~/framework/modules/mediacentre/navigation';

export interface MediacentreHomeScreenDispatchProps {
  handleAddFavorite: (...args: Parameters<typeof addFavoriteAction>) => Promise<void>;
  handleRemoveFavorite: (...args: Parameters<typeof removeFavoriteAction>) => Promise<void>;
  tryFetchExternals: (...args: Parameters<typeof fetchExternalsAction>) => Promise<Resource[] | undefined>;
  tryFetchFavorites: (...args: Parameters<typeof fetchFavoritesAction>) => Promise<Resource[]>;
  tryFetchSignets: (...args: Parameters<typeof fetchSignetsAction>) => Promise<Signets>;
  tryFetchTextbooks: (...args: Parameters<typeof fetchTextbooksAction>) => Promise<Resource[]>;
  trySearchResources: (...args: Parameters<typeof searchResourcesAction>) => Promise<Resource[]>;
}

export interface MediacentreHomeScreenNavParams {}

export interface MediacentreHomeScreenProps {}

export interface MediacentreHomeScreenStoreProps {
  externals: Resource[];
  favorites: Resource[];
  isFetchingSearch: boolean;
  isFetchingSections: boolean;
  search: Resource[];
  signets: Signets;
  textbooks: Resource[];
  session?: AuthActiveAccount;
}

export interface MediacentreHomeScreenPrivateProps
  extends NativeStackScreenProps<MediacentreNavigationParams, typeof mediacentreRouteNames.home>,
    MediacentreHomeScreenProps,
    MediacentreHomeScreenStoreProps,
    MediacentreHomeScreenDispatchProps {}
