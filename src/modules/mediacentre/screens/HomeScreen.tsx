import I18n from 'i18n-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { EmptyScreen } from '~/framework/components/emptyScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { fetchWithCache } from '~/infra/fetchWithCache';
import { fetchExternalsAction } from '~/modules/mediacentre/actions/externals';
import { addFavoriteAction, fetchFavoritesAction, removeFavoriteAction } from '~/modules/mediacentre/actions/favorites';
import { searchResourcesAction, searchResourcesAdvancedAction } from '~/modules/mediacentre/actions/search';
import { fetchSignetsAction } from '~/modules/mediacentre/actions/signets';
import { fetchTextbooksAction } from '~/modules/mediacentre/actions/textbooks';
import { AdvancedSearchModal, IField, ISearchModalHandle, ISources } from '~/modules/mediacentre/components/AdvancedSearchModal';
import { FavoritesCarousel } from '~/modules/mediacentre/components/FavoritesCarousel';
import { ResourceGrid } from '~/modules/mediacentre/components/ResourceGrid';
import { SearchContent, SearchState } from '~/modules/mediacentre/components/SearchContent';
import { ISearchBarHandle, IconButtonText, SearchBar } from '~/modules/mediacentre/components/SearchItems';
import { IExternals, getExternalsState } from '~/modules/mediacentre/state/externals';
import { IFavorites, getFavoritesState } from '~/modules/mediacentre/state/favorites';
import { ISearch, getSearchState } from '~/modules/mediacentre/state/search';
import { ISignets, getSignetsState } from '~/modules/mediacentre/state/signets';
import { ITextbooks, getTextbooksState } from '~/modules/mediacentre/state/textbooks';
import { IResource, Source } from '~/modules/mediacentre/utils/Resource';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  searchContainer: {
    marginHorizontal: 20, // MO-142 use UI_SIZES.spacing here
    marginTop: 10, // MO-142 use UI_SIZES.spacing here
  },
  loadingIndicator: {
    marginTop: '45%',
  },
});

type IHomeScreenProps = {
  externals: IExternals;
  favorites: IFavorites;
  isFetchingSearch: boolean;
  isFetchingSections: boolean;
  navigation: { navigate };
  search: ISearch;
  signets: ISignets;
  textbooks: ITextbooks;

  postAddFavorite: (id: string, resource: IResource) => any;
  fetchExternals: (sources: string[]) => any;
  fetchFavorites: () => any;
  fetchSignets: () => any;
  fetchTextbooks: () => any;
  postRemoveFavorite: (id: string, source: Source) => any;
  searchResources: (sources: string[], query: string) => any;
  searchResourcesAdvanced: (fields: IField[], sources: ISources) => any;
} & NavigationInjectedProps;

export const HomeScreen: React.FunctionComponent<IHomeScreenProps> = (props: IHomeScreenProps) => {
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
    { title: 'mediacentre.external-resources', resources: props.externals },
    { title: 'mediacentre.my-textbooks', resources: props.textbooks },
    { title: 'mediacentre.my-signets', resources: props.signets.sharedSignets },
    { title: 'mediacentre.orientation-signets', resources: props.signets.orientationSignets },
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

  const onSearch = (query: string) => {
    props.searchResources(sources, query);
    setSearchState(SearchState.SIMPLE);
  };

  const onCancelSearch = () => {
    if (searchBarRef.current) {
      searchBarRef.current.clear();
    }
    if (searchModalRef.current) {
      searchModalRef.current.resetParams();
    }
    setSearchedResources([]);
    setSearchState(SearchState.NONE);
  };

  const showSearchModal = () => {
    setSearchModalVisible(true);
    if (searchBarRef.current) {
      searchBarRef.current.blur();
    }
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
      await props.postAddFavorite(resourceId, resource);
      Toast.showSuccess(I18n.t('mediacentre.favorite-added'), {
        position: Toast.position.BOTTOM,
        mask: false,
      });
      props.fetchFavorites();
    } catch (err) {
      Toast.show(I18n.t('common.error.text'));
    }
  };

  const removeFavorite = async (resourceId: string, resource: Source) => {
    try {
      await props.postRemoveFavorite(resourceId, resource);
      Toast.showSuccess(I18n.t('mediacentre.favorite-removed'), {
        position: Toast.position.BOTTOM,
        mask: false,
      });
      props.fetchFavorites();
    } catch (err) {
      Toast.show(I18n.t('common.error.text'));
    }
  };

  const renderEmptyState = () => {
    if (isFetchingSources) {
      return <LoadingIndicator />;
    }
    return <EmptyScreen svgImage="empty-mediacentre" title={I18n.t('mediacentre.empty-screen')} />;
  };

  return (
    <PageView navigation={props.navigation} navBarWithBack={{ title: I18n.t('mediacentre.tabName') }}>
      {!sources.length ? (
        renderEmptyState()
      ) : (
        <View style={styles.mainContainer}>
          <View style={styles.searchContainer}>
            <SearchBar onSubmitEditing={onSearch} ref={searchBarRef} />
            <IconButtonText icon="search" text={I18n.t('mediacentre.advanced-search')} onPress={showSearchModal} />
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
                  title={I18n.t(item.title)}
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
                  <EmptyScreen svgImage="empty-mediacentre" title={I18n.t('mediacentre.empty-screen')} />
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

const setFavorites = (resources: IResource[], favorites: string[]) => {
  for (const resource of resources) {
    resource.favorite = favorites.includes(String(resource.id));
  }
};

const mapStateToProps: (state: any) => any = state => {
  const externals = getExternalsState(state);
  const favorites = getFavoritesState(state);
  const search = getSearchState(state);
  const signets = getSignetsState(state);
  const textbooks = getTextbooksState(state);

  const favIds = favorites.data.map(favorite => String(favorite.id));
  setFavorites(externals.data, favIds);
  setFavorites(search.data, favIds);
  setFavorites(signets.data.orientationSignets, favIds);
  setFavorites(signets.data.sharedSignets, favIds);
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

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      postAddFavorite: addFavoriteAction,
      fetchFavorites: fetchFavoritesAction,
      fetchExternals: fetchExternalsAction,
      fetchSignets: fetchSignetsAction,
      fetchTextbooks: fetchTextbooksAction,
      postRemoveFavorite: removeFavoriteAction,
      searchResources: searchResourcesAction,
      searchResourcesAdvanced: searchResourcesAdvancedAction,
    },
    dispatch,
  );
};

export default withViewTracking('mediacentre')(connect(mapStateToProps, mapDispatchToProps)(HomeScreen));
