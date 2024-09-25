import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import {
  addFavoriteAction,
  fetchFavoritesAction,
  fetchResourcesAction,
  removeFavoriteAction,
  searchResourcesAction,
} from '~/framework/modules/mediacentre/actions';
import { ResourceSection } from '~/framework/modules/mediacentre/components/resource-list/types';
import { MediacentreResources, Resource } from '~/framework/modules/mediacentre/model';
import { MediacentreNavigationParams, mediacentreRouteNames } from '~/framework/modules/mediacentre/navigation';

export interface MediacentreHomeScreenDispatchProps {
  tryAddFavorite: (...args: Parameters<typeof addFavoriteAction>) => Promise<void>;
  tryFetchFavorites: (...args: Parameters<typeof fetchFavoritesAction>) => Promise<Resource[]>;
  tryFetchResources: (...args: Parameters<typeof fetchResourcesAction>) => Promise<MediacentreResources>;
  tryRemoveFavorite: (...args: Parameters<typeof removeFavoriteAction>) => Promise<void>;
  trySearchResources: (...args: Parameters<typeof searchResourcesAction>) => Promise<Resource[]>;
}

export interface MediacentreHomeScreenNavParams {}

export interface MediacentreHomeScreenProps {}

export interface MediacentreHomeScreenStoreProps {
  isFetchingSearch: boolean;
  search: Resource[];
  sections: ResourceSection[];
  session?: AuthActiveAccount;
}

export interface MediacentreHomeScreenPrivateProps
  extends NativeStackScreenProps<MediacentreNavigationParams, typeof mediacentreRouteNames.home>,
    MediacentreHomeScreenProps,
    MediacentreHomeScreenStoreProps,
    MediacentreHomeScreenDispatchProps {}
