import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import FlatList from '~/framework/components/list/flat-list';
import { PageView } from '~/framework/components/page';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/reducer';
import { addFavoriteAction, removeFavoriteAction } from '~/framework/modules/mediacentre/actions';
import ResourceCard from '~/framework/modules/mediacentre/components/resource-card';
import { Resource, Source } from '~/framework/modules/mediacentre/model';
import moduleConfig from '~/framework/modules/mediacentre/module-config';
import { MediacentreNavigationParams, mediacentreRouteNames } from '~/framework/modules/mediacentre/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

import styles from './styles';
import { MediacentreResourceListScreenDispatchProps, MediacentreResourceListScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<
  MediacentreNavigationParams,
  typeof mediacentreRouteNames.resourceList
>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: route.params.title,
  }),
});

const MediacentreResourceListScreen = (props: MediacentreResourceListScreenPrivateProps) => {
  const handleAddFavorite = async (resource: Resource) => {
    try {
      await props.tryAddFavorite(resource.id, resource);
      Toast.showSuccess(I18n.get('mediacentre-resourcelist-favorite-added'));
    } catch {
      Toast.showError(I18n.get('mediacentre-resourcelist-error-text'));
    }
  };

  const handleRemoveFavorite = async (resourceId: string, source: Source) => {
    try {
      await props.tryRemoveFavorite(resourceId, source);
      Toast.showSuccess(I18n.get('mediacentre-resourcelist-favorite-removed'));
    } catch {
      Toast.showError(I18n.get('mediacentre-resourcelist-error-text'));
    }
  };

  const renderResource = ({ item }: { item: Resource }) => (
    <ResourceCard
      variant="default"
      resource={item}
      onAddFavorite={() => handleAddFavorite(item)}
      onRemoveFavorite={() => handleRemoveFavorite(item.id, item.source)}
    />
  );

  const renderList = () => {
    return (
      <FlatList
        data={props.route.params.resources}
        renderItem={renderResource}
        contentContainerStyle={styles.listContentContainer}
      />
    );
  };

  return <PageView>{renderList()}</PageView>;
};

export default connect(
  (state: IGlobalState) => {
    const { search } = moduleConfig.getState(state);
    const session = getSession();

    return {
      isFetching: search.isFetching,
      session,
    };
  },
  dispatch =>
    bindActionCreators<MediacentreResourceListScreenDispatchProps>(
      {
        tryAddFavorite: tryAction(addFavoriteAction),
        tryRemoveFavorite: tryAction(removeFavoriteAction),
      },
      dispatch,
    ),
)(MediacentreResourceListScreen);
