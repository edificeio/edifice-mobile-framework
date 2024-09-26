import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { addFavoriteAction, removeFavoriteAction } from '~/framework/modules/mediacentre/actions';
import { Resource } from '~/framework/modules/mediacentre/model';
import { MediacentreNavigationParams, mediacentreRouteNames } from '~/framework/modules/mediacentre/navigation';

export interface MediacentreResourceListScreenDispatchProps {
  tryAddFavorite: (...args: Parameters<typeof addFavoriteAction>) => Promise<void>;
  tryRemoveFavorite: (...args: Parameters<typeof removeFavoriteAction>) => Promise<void>;
}

export interface MediacentreResourceListScreenNavParams {
  resources: Resource[];
  title: string;
}

export interface MediacentreResourceListScreenProps {}

export interface MediacentreResourceListScreenStoreProps {
  isFetching: boolean;
  favoriteUids: string[];
  session?: AuthActiveAccount;
}

export interface MediacentreResourceListScreenPrivateProps
  extends NativeStackScreenProps<MediacentreNavigationParams, typeof mediacentreRouteNames.resourceList>,
    MediacentreResourceListScreenProps,
    MediacentreResourceListScreenStoreProps,
    MediacentreResourceListScreenDispatchProps {}
