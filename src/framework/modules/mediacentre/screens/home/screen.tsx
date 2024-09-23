import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyScreen } from '~/framework/components/empty-screens';
import FlatList from '~/framework/components/list/flat-list';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/reducer';
import {
  addFavoriteAction,
  fetchExternalsAction,
  fetchFavoritesAction,
  fetchSignetsAction,
  fetchTextbooksAction,
  removeFavoriteAction,
  searchResourcesAction,
} from '~/framework/modules/mediacentre/actions';
import { FavoritesCarousel } from '~/framework/modules/mediacentre/components/FavoritesCarousel';
import { ResourceGrid } from '~/framework/modules/mediacentre/components/ResourceGrid';
import { SearchContent, SearchState } from '~/framework/modules/mediacentre/components/SearchContent';
import { ISearchBarHandle, SearchBar } from '~/framework/modules/mediacentre/components/SearchItems';
import moduleConfig from '~/framework/modules/mediacentre/module-config';
import { MediacentreNavigationParams, mediacentreRouteNames } from '~/framework/modules/mediacentre/navigation';
import { IResource, Source } from '~/framework/modules/mediacentre/reducer';
import { navBarOptions } from '~/framework/navigation/navBar';
import { handleAction, tryAction } from '~/framework/util/redux/actions';
import { fetchWithCache } from '~/infra/fetchWithCache';

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
  const [shouldFetch, setShouldFetch] = useState<boolean>(true);
  const [isFetchingSources, setFetchingSources] = useState<boolean>(true);
  const [sources, setSources] = useState<string[]>([]);
  const searchBarRef = useRef<ISearchBarHandle>(null);
  const [searchedResources, setSearchedResources] = useState<IResource[]>([]);
  const [searchState, setSearchState] = useState<SearchState>(SearchState.NONE);
  const sections = [
    { title: 'externalresources', resources: props.externals },
    { title: 'textbooks', resources: props.textbooks },
    { title: 'signets', resources: props.signets.shared },
    { title: 'orientationsignets', resources: props.signets.orientation },
  ].filter(section => section.resources.length > 0);

  const fetchSources = useCallback(async () => {
    const response = await fetchWithCache(`/mediacentre`, {
      method: 'get',
    });
    let html = response?.toString();
    if (!html) {
      return [];
    }
    html = html.replace(/\s/g, '');
    const startIndex = html.indexOf('sources=[');
    const endIndex = html.indexOf('];');
    if (!startIndex || !endIndex || startIndex + 9 > endIndex - 2) {
      setFetchingSources(false);
      return [];
    }
    html = html.substring(startIndex + 9, endIndex - 2).replaceAll('"', '');
    const newSources = html.split(',');
    setFetchingSources(false);
    setSources(newSources);
    props.tryFetchExternals(newSources);
  }, [props]);

  useEffect(() => {
    if (shouldFetch) {
      setShouldFetch(false);
      fetchSources();
      props.tryFetchFavorites();
      props.tryFetchTextbooks();
      props.tryFetchSignets();
    }
  }, [shouldFetch, fetchSources, props]);

  useEffect(() => {
    setSearchedResources(props.search);
  }, [props.search]);

  const onSearch = (query: string) => {
    props.trySearchResources(sources, query);
    setSearchState(SearchState.SIMPLE);
  };

  const onCancelSearch = () => {
    searchBarRef.current?.clear();
    setSearchedResources([]);
    setSearchState(SearchState.NONE);
  };

  const showResources = (resources: IResource[]) => {
    setSearchedResources(resources);
    setSearchState(SearchState.SIMPLE);
  };

  const addFavorite = async (resourceId: string, resource: IResource) => {
    try {
      await props.handleAddFavorite(resourceId, resource);
      Toast.showSuccess(I18n.get('mediacentre-home-favorite-added'));
      props.tryFetchFavorites();
    } catch {
      Toast.showError(I18n.get('mediacentre-home-error-text'));
    }
  };

  const removeFavorite = async (resourceId: string, resource: Source) => {
    try {
      await props.handleRemoveFavorite(resourceId, resource);
      Toast.showSuccess(I18n.get('mediacentre-home-favorite-removed'));
      props.tryFetchFavorites();
    } catch {
      Toast.showError(I18n.get('mediacentre-home-error-text'));
    }
  };

  const renderEmptyState = () => {
    if (isFetchingSources) {
      return <LoadingIndicator />;
    }
    return <EmptyScreen svgImage="empty-mediacentre" title={I18n.get('mediacentre-home-emptyscreen-default')} />;
  };

  return (
    <PageView>
      {!sources.length ? (
        renderEmptyState()
      ) : (
        <View style={styles.mainContainer}>
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
              addFavorite={addFavorite}
              removeFavorite={removeFavorite}
            />
          ) : (
            <FlatList
              data={sections}
              renderItem={({ item }) => (
                <ResourceGrid
                  {...props}
                  title={I18n.get(`mediacentre-home-section-${item.title}`)}
                  resources={item.resources}
                  size={sections.length > 1 ? 4 : 8}
                  onShowAll={showResources}
                  addFavorite={addFavorite}
                  removeFavorite={removeFavorite}
                />
              )}
              keyExtractor={item => item.title}
              ListHeaderComponent={
                props.favorites.length > 0 ? (
                  <FavoritesCarousel
                    {...props}
                    resources={props.favorites}
                    addFavorite={addFavorite}
                    removeFavorite={removeFavorite}
                  />
                ) : null
              }
              ListEmptyComponent={
                props.isFetchingSections ? (
                  <LoadingIndicator customStyle={styles.loadingIndicator} />
                ) : (
                  <EmptyScreen svgImage="empty-mediacentre" title={I18n.get('mediacentre-home-emptyscreen-default')} />
                )
              }
            />
          )}
        </View>
      )}
    </PageView>
  );
};

const setFavorites = (resources: IResource[], favorites: string[]) => {
  for (const resource of resources) {
    resource.favorite = favorites.includes(String(resource.uid));
  }
};

export default connect(
  (state: IGlobalState) => {
    const { externals, favorites, search, signets, textbooks } = moduleConfig.getState(state);
    const session = getSession();
    const favIds = favorites.data.map(favorite => String(favorite.uid));

    setFavorites(externals.data, favIds);
    setFavorites(search.data, favIds);
    setFavorites(signets.data.orientation, favIds);
    setFavorites(signets.data.shared, favIds);
    setFavorites(textbooks.data, favIds);

    return {
      externals: externals.data,
      favorites: favorites.data,
      isFetchingSearch: search.isFetching,
      isFetchingSections:
        externals.isFetching || favorites.isFetching || search.isFetching || signets.isFetching || textbooks.isFetching,
      search: search.data,
      signets: signets.data,
      textbooks: textbooks.data,
      session,
    };
  },
  dispatch =>
    bindActionCreators<MediacentreHomeScreenDispatchProps>(
      {
        handleAddFavorite: handleAction(addFavoriteAction),
        handleRemoveFavorite: handleAction(removeFavoriteAction),
        tryFetchExternals: tryAction(fetchExternalsAction),
        tryFetchFavorites: tryAction(fetchFavoritesAction),
        tryFetchSignets: tryAction(fetchSignetsAction),
        tryFetchTextbooks: tryAction(fetchTextbooksAction),
        trySearchResources: tryAction(searchResourcesAction),
      },
      dispatch,
    ),
)(MediacentreHomeScreen);
