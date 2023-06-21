import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FlatList from '~/framework/components/list/flat-list';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import Toast from '~/framework/components/toast';
import {
  addFavoriteAction,
  fetchExternalsAction,
  fetchFavoritesAction,
  fetchSignetsAction,
  fetchTextbooksAction,
  removeFavoriteAction,
  searchResourcesAction,
  searchResourcesAdvancedAction,
} from '~/framework/modules/mediacentre/actions';
import {
  AdvancedSearchModal,
  IField,
  ISearchModalHandle,
  ISources,
} from '~/framework/modules/mediacentre/components/AdvancedSearchModal';
import { FavoritesCarousel } from '~/framework/modules/mediacentre/components/FavoritesCarousel';
import { ResourceGrid } from '~/framework/modules/mediacentre/components/ResourceGrid';
import { SearchContent, SearchState } from '~/framework/modules/mediacentre/components/SearchContent';
import { ISearchBarHandle, IconButtonText, SearchBar } from '~/framework/modules/mediacentre/components/SearchItems';
import moduleConfig from '~/framework/modules/mediacentre/module-config';
import { MediacentreNavigationParams, mediacentreRouteNames } from '~/framework/modules/mediacentre/navigation';
import { IResource, IResourceList, ISignets, Source } from '~/framework/modules/mediacentre/reducer';
import { navBarOptions } from '~/framework/navigation/navBar';
import { fetchWithCache } from '~/infra/fetchWithCache';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  searchContainer: {
    marginHorizontal: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.small,
  },
  loadingIndicator: {
    marginTop: '45%',
  },
});

// TYPES ==========================================================================================

interface IMediacentreHomeScreenDataProps {
  externals: IResourceList;
  favorites: IResourceList;
  isFetchingSearch: boolean;
  isFetchingSections: boolean;
  navigation: { navigate };
  search: IResourceList;
  signets: ISignets;
  textbooks: IResourceList;
}

interface IMediacentreHomeScreenEventProps {
  addFavorite: (id: string, resource: IResource) => any;
  fetchExternals: (sources: string[]) => any;
  fetchFavorites: () => any;
  fetchSignets: () => any;
  fetchTextbooks: () => any;
  removeFavorite: (id: string, source: Source) => any;
  searchResources: (sources: string[], query: string) => any;
  searchResourcesAdvanced: (fields: IField[], sources: ISources) => any;
  dispatch: ThunkDispatch<any, any, any>;
}

export interface MediacentreHomeScreenNavigationParams {
  title: string;
}

type IMediacentreHomeScreenProps = IMediacentreHomeScreenDataProps &
  IMediacentreHomeScreenEventProps &
  NativeStackScreenProps<MediacentreNavigationParams, typeof mediacentreRouteNames.home>;

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

const MediacentreHomeScreen = (props: IMediacentreHomeScreenProps) => {
  const [shouldFetch, setShouldFetch] = useState<boolean>(true);
  const [isFetchingSources, setFetchingSources] = useState<boolean>(true);
  const [sources, setSources] = useState<string[]>([]);
  const searchBarRef = useRef<ISearchBarHandle>(null);
  const searchModalRef = useRef<ISearchModalHandle>(null);
  const [searchedResources, setSearchedResources] = useState<IResource[]>([]);
  const [searchState, setSearchState] = useState<SearchState>(SearchState.NONE);
  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);
  const [searchFields, setSearchFields] = useState<IField[]>([]);
  const sections = [
    { title: 'externalresources', resources: props.externals },
    { title: 'textbooks', resources: props.textbooks },
    { title: 'signets', resources: props.signets.shared },
    { title: 'orientationsignets', resources: props.signets.orientation },
  ].filter(section => section.resources.length > 0);

  // LOADER =======================================================================================

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
    props.fetchExternals(newSources);
  }, [props]);

  useEffect(() => {
    if (shouldFetch) {
      setShouldFetch(false);
      fetchSources();
      props.fetchFavorites();
      props.fetchTextbooks();
      props.fetchSignets();
    }
  }, [shouldFetch, fetchSources, props]);

  useEffect(() => {
    setSearchedResources(props.search);
  }, [props.search]);

  // EVENTS =======================================================================================

  const onSearch = (query: string) => {
    props.searchResources(sources, query);
    setSearchState(SearchState.SIMPLE);
  };

  const onCancelSearch = () => {
    searchBarRef.current?.clear();
    searchModalRef.current?.resetParams();
    setSearchedResources([]);
    setSearchState(SearchState.NONE);
  };

  const showSearchModal = () => {
    setSearchModalVisible(true);
    searchBarRef.current?.blur();
  };

  const hideSearchModal = () => {
    setSearchModalVisible(false);
  };

  const onAdvancedSearch = (fields: IField[], checkedSources: ISources) => {
    props.searchResourcesAdvanced(fields, checkedSources);
    setSearchModalVisible(false);
    setSearchState(SearchState.ADVANCED);
    setSearchFields(fields);
  };

  const showResources = (resources: IResource[]) => {
    setSearchedResources(resources);
    setSearchState(SearchState.SIMPLE);
  };

  const addFavorite = async (resourceId: string, resource: IResource) => {
    try {
      await props.addFavorite(resourceId, resource);
      Toast.showSuccess(I18n.get('mediacentre-home-favorite-added'));
      props.fetchFavorites();
    } catch {
      Toast.showError(I18n.get('common-error-text'));
    }
  };

  const removeFavorite = async (resourceId: string, resource: Source) => {
    try {
      await props.removeFavorite(resourceId, resource);
      Toast.showSuccess(I18n.get('mediacentre-home-favorite-removed'));
      props.fetchFavorites();
    } catch {
      Toast.showError(I18n.get('common-error-text'));
    }
  };

  // EMPTY SCREEN =================================================================================

  const renderEmptyState = () => {
    if (isFetchingSources) {
      return <LoadingIndicator />;
    }
    return <EmptyScreen svgImage="empty-mediacentre" title={I18n.get('mediacentre-home-emptyscreen-default')} />;
  };

  // RENDER =======================================================================================

  return (
    <PageView>
      {!sources.length ? (
        renderEmptyState()
      ) : (
        <View style={styles.mainContainer}>
          <View style={styles.searchContainer}>
            <SearchBar onSubmitEditing={onSearch} ref={searchBarRef} />
            <IconButtonText icon="search" text={I18n.get('mediacentre-home-advancedsearch')} onPress={showSearchModal} />
          </View>
          {searchState !== SearchState.NONE ? (
            <SearchContent
              {...props}
              resources={searchedResources}
              searchState={searchState}
              fields={searchFields}
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
          <AdvancedSearchModal
            isVisible={searchModalVisible}
            onSearch={onAdvancedSearch}
            closeModal={hideSearchModal}
            availableSources={sources}
            ref={searchModalRef}
          />
        </View>
      )}
    </PageView>
  );
};

// MAPPING ========================================================================================

const setFavorites = (resources: IResource[], favorites: string[]) => {
  for (const resource of resources) {
    resource.favorite = favorites.includes(String(resource.id));
  }
};

const mapStateToProps = (gs: IGlobalState) => {
  const state = moduleConfig.getState(gs);
  const externals = state.externals;
  const favorites = state.favorites;
  const search = state.search;
  const signets = state.signets;
  const textbooks = state.textbooks;

  const favIds = favorites.data.map(favorite => String(favorite.id));
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
  };
};

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>,
  getState: () => IGlobalState,
) => IMediacentreHomeScreenEventProps = (dispatch, getState) => ({
  addFavorite: async (resourceId: string, resource: IResource) => {
    return dispatch(addFavoriteAction(resourceId, resource));
  },
  fetchFavorites: async () => {
    return dispatch(fetchFavoritesAction());
  },
  fetchExternals: async (sources: string[]) => {
    return dispatch(fetchExternalsAction(sources));
  },
  fetchSignets: async () => {
    return dispatch(fetchSignetsAction());
  },
  fetchTextbooks: async () => {
    return dispatch(fetchTextbooksAction());
  },
  removeFavorite: async (resourceId: string, source: Source) => {
    return dispatch(removeFavoriteAction(resourceId, source));
  },
  searchResources: async (sources: string[], query: string) => {
    return dispatch(searchResourcesAction(sources, query));
  },
  searchResourcesAdvanced: async (fields: IField[], sources: ISources) => {
    return dispatch(searchResourcesAdvancedAction(fields, sources));
  },
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(MediacentreHomeScreen);
