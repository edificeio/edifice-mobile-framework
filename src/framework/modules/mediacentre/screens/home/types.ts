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
import { ResourceSection } from '~/framework/modules/mediacentre/components/resource-list/types';
import { Resource } from '~/framework/modules/mediacentre/model';
import { MediacentreNavigationParams, mediacentreRouteNames } from '~/framework/modules/mediacentre/navigation';

export interface MediacentreHomeScreenDispatchProps {
  tryAddFavorite: (...args: Parameters<typeof addFavoriteAction>) => Promise<void>;
  tryFetchExternals: (...args: Parameters<typeof fetchExternalsAction>) => Promise<Resource[] | undefined>;
  tryFetchFavorites: (...args: Parameters<typeof fetchFavoritesAction>) => Promise<Resource[]>;
  tryFetchSignets: (...args: Parameters<typeof fetchSignetsAction>) => Promise<Resource[]>;
  tryFetchTextbooks: (...args: Parameters<typeof fetchTextbooksAction>) => Promise<Resource[]>;
  tryRemoveFavorite: (...args: Parameters<typeof removeFavoriteAction>) => Promise<void>;
  trySearchResources: (...args: Parameters<typeof searchResourcesAction>) => Promise<Resource[]>;
}

export interface MediacentreHomeScreenNavParams {}

export interface MediacentreHomeScreenProps {}

export interface MediacentreHomeScreenStoreProps {
  isFetchingSearch: boolean;
  isFetchingSections: boolean;
  search: Resource[];
  sections: ResourceSection[];
  session?: AuthActiveAccount;
}

export interface MediacentreHomeScreenPrivateProps
  extends NativeStackScreenProps<MediacentreNavigationParams, typeof mediacentreRouteNames.home>,
    MediacentreHomeScreenProps,
    MediacentreHomeScreenStoreProps,
    MediacentreHomeScreenDispatchProps {}
