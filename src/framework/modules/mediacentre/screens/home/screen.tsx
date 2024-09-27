import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyScreen } from '~/framework/components/empty-screens';
import FlatList from '~/framework/components/list/flat-list';
import { PageView } from '~/framework/components/page';
import SearchBar from '~/framework/components/search-bar';
import Toast from '~/framework/components/toast';
import { ContentLoader } from '~/framework/hooks/loader';
import { getSession } from '~/framework/modules/auth/reducer';
import {
  addFavoriteAction,
  fetchFavoritesAction,
  fetchResourcesAction,
  removeFavoriteAction,
  searchResourcesAction,
} from '~/framework/modules/mediacentre/actions';
import ResourceList from '~/framework/modules/mediacentre/components/resource-list';
import { Resource, SectionType } from '~/framework/modules/mediacentre/model';
import moduleConfig from '~/framework/modules/mediacentre/module-config';
import { MediacentreNavigationParams, mediacentreRouteNames } from '~/framework/modules/mediacentre/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

import styles from './styles';
import { MediacentreHomeScreenDispatchProps, MediacentreHomeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<MediacentreNavigationParams, typeof mediacentreRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('mediacentre-home-title'),
  }),
});

const MediacentreHomeScreen = (props: MediacentreHomeScreenPrivateProps) => {
  const [query, setQuery] = useState('');

  const loadResources = async () => {
    try {
      await props.tryFetchFavorites();
      await props.tryFetchResources();
    } catch {
      throw new Error();
    }
  };

  const openResourceList = (resources: Resource[], title: string) =>
    props.navigation.push(mediacentreRouteNames.resourceList, {
      resources,
      title,
    });

  const handleSearch = () => {
    if (query) {
      props.trySearchResources(query);
      props.navigation.push(mediacentreRouteNames.resourceList, {
        query,
        resources: [],
      });
    }
  };

  const isResourceFavorite = (uid: string): boolean => props.favoriteUids.includes(uid);

  const handleAddFavorite = async (resource: Resource) => {
    try {
      await props.tryAddFavorite(resource);
      Toast.showSuccess(I18n.get('mediacentre-home-favorite-added'));
    } catch {
      Toast.showError(I18n.get('mediacentre-home-error-text'));
    }
  };

  const handleRemoveFavorite = async (resource: Resource) => {
    try {
      await props.tryRemoveFavorite(resource);
      Toast.showSuccess(I18n.get('mediacentre-home-favorite-removed'));
    } catch {
      Toast.showError(I18n.get('mediacentre-home-error-text'));
    }
  };

  const renderEmpty = () => {
    return <EmptyScreen svgImage="empty-mediacentre" title={I18n.get('mediacentre-home-emptyscreen-default')} />;
  };

  const renderResources = () => {
    return (
      <PageView>
        <FlatList
          data={props.sections}
          keyExtractor={item => item.sectionKey}
          renderItem={({ item }) => (
            <ResourceList
              {...item}
              isResourceFavorite={isResourceFavorite}
              onAddFavorite={handleAddFavorite}
              onRemoveFavorite={handleRemoveFavorite}
              openResourceList={openResourceList}
            />
          )}
          ListEmptyComponent={renderEmpty()}
          ListHeaderComponent={
            <SearchBar
              placeholder={I18n.get('mediacentre-home-searchbar-placeholder')}
              query={query}
              onChangeQuery={setQuery}
              onSearch={handleSearch}
              containerStyle={styles.searchBarContainer}
            />
          }
        />
      </PageView>
    );
  };

  return <ContentLoader loadContent={loadResources} renderContent={renderResources} />;
};

export default connect(
  (state: IGlobalState) => {
    const { favorites, resources } = moduleConfig.getState(state);
    const session = getSession();

    return {
      favoriteUids: favorites.data.map(r => r.uid),
      sections: [
        { type: SectionType.FAVORITES, resources: favorites.data, iconName: 'ui-star-filled' },
        { type: SectionType.TEXTBOOKS, resources: resources.data.textbooks, iconName: 'ui-book' },
        ...(!resources.data.textbooks.length
          ? [{ type: SectionType.EXTERNAL_RESOURCES, resources: resources.data.externals, iconName: 'ui-book' }]
          : []),
        { type: SectionType.SIGNETS, resources: resources.data.signets, iconName: 'ui-bookmark' },
      ].filter(section => section.resources.length),
      session,
    };
  },
  dispatch =>
    bindActionCreators<MediacentreHomeScreenDispatchProps>(
      {
        tryAddFavorite: tryAction(addFavoriteAction),
        tryFetchFavorites: tryAction(fetchFavoritesAction),
        tryFetchResources: tryAction(fetchResourcesAction),
        tryRemoveFavorite: tryAction(removeFavoriteAction),
        trySearchResources: tryAction(searchResourcesAction),
      },
      dispatch,
    ),
)(MediacentreHomeScreen);
