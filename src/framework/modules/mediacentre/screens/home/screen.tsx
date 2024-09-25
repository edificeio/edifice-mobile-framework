import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyScreen } from '~/framework/components/empty-screens';
import FlatList from '~/framework/components/list/flat-list';
import { PageView } from '~/framework/components/page';
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
import { SearchContent, SearchState } from '~/framework/modules/mediacentre/components/SearchContent';
import { ISearchBarHandle, SearchBar } from '~/framework/modules/mediacentre/components/SearchItems';
import ResourceList from '~/framework/modules/mediacentre/components/resource-list';
import { Resource, Source } from '~/framework/modules/mediacentre/model';
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
  const searchBarRef = useRef<ISearchBarHandle>(null);
  const [searchedResources, setSearchedResources] = useState<Resource[]>([]);
  const [searchState, setSearchState] = useState<SearchState>(SearchState.NONE);

  const loadResources = async () => {
    try {
      await props.tryFetchResources();
    } catch {
      throw new Error();
    }
  };

  useEffect(() => {
    setSearchedResources(props.search);
  }, [props.search]);

  const onSearch = (query: string) => {
    props.trySearchResources(query);
    setSearchState(SearchState.SIMPLE);
  };

  const onCancelSearch = () => {
    searchBarRef.current?.clear();
    setSearchedResources([]);
    setSearchState(SearchState.NONE);
  };

  const showResources = (resources: Resource[]) => {
    setSearchedResources(resources);
    setSearchState(SearchState.SIMPLE);
  };

  const handleAddFavorite = async (resourceId: string, resource: Resource) => {
    try {
      await props.tryAddFavorite(resourceId, resource);
      Toast.showSuccess(I18n.get('mediacentre-home-favorite-added'));
      props.tryFetchFavorites();
    } catch {
      Toast.showError(I18n.get('mediacentre-home-error-text'));
    }
  };

  const handleRemoveFavorite = async (resourceId: string, resource: Source) => {
    try {
      await props.tryRemoveFavorite(resourceId, resource);
      Toast.showSuccess(I18n.get('mediacentre-home-favorite-removed'));
      props.tryFetchFavorites();
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
        <View style={styles.searchContainer}>
          <SearchBar onSubmitEditing={onSearch} ref={searchBarRef} />
        </View>
        {searchState !== SearchState.NONE ? (
          <SearchContent
            {...props}
            resources={searchedResources}
            searchState={searchState}
            isFetching={props.isFetchingSearch}
            onCancelSearch={onCancelSearch}
            addFavorite={handleAddFavorite}
            removeFavorite={handleRemoveFavorite}
          />
        ) : (
          <FlatList
            data={props.sections}
            keyExtractor={item => item.sectionKey}
            renderItem={({ item }) => (
              <ResourceList
                {...item}
                onAddFavorite={handleAddFavorite}
                onRemoveFavorite={handleRemoveFavorite}
                openResourceList={showResources}
              />
            )}
            ListEmptyComponent={renderEmpty()}
          />
        )}
      </PageView>
    );
  };

  return <ContentLoader loadContent={loadResources} renderContent={renderResources} />;
};

const setFavorites = (resources: Resource[], favorites: string[]) => {
  for (const resource of resources) {
    resource.favorite = favorites.includes(String(resource.uid));
  }
};

export default connect(
  (state: IGlobalState) => {
    const { resources, search } = moduleConfig.getState(state);
    const session = getSession();
    const favIds = resources.data.favorites.map(favorite => String(favorite.uid));

    setFavorites(resources.data.externals, favIds);
    setFavorites(search.data, favIds);
    setFavorites(resources.data.signets, favIds);
    setFavorites(resources.data.textbooks, favIds);

    return {
      isFetchingSearch: search.isFetching,
      search: search.data,
      sections: [
        { sectionKey: 'favorites', resources: resources.data.favorites, iconName: 'ui-star-filled' },
        { sectionKey: 'textbooks', resources: resources.data.textbooks, iconName: 'ui-book' },
        ...(!resources.data.textbooks.length
          ? [{ sectionKey: 'externalresources', resources: resources.data.externals, iconName: 'ui-book' }]
          : []),
        { sectionKey: 'signets', resources: resources.data.signets, iconName: 'ui-bookmark' },
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
