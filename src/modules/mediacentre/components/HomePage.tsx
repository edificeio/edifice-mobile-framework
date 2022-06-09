import I18n from 'i18n-js';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { EmptyScreen } from '~/framework/components/emptyScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { ISignets } from '~/modules/mediacentre/state/signets';
import { IResource, Source } from '~/modules/mediacentre/utils/Resource';

import { AdvancedSearchModal, IField, ISearchModalHandle, ISources } from './AdvancedSearchModal';
import { FavoritesCarousel } from './FavoritesCarousel';
import { ResourceGrid } from './ResourceGrid';
import { SearchContent } from './SearchContent';
import { ISearchBarHandle, IconButtonText, SearchBar } from './SearchItems';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  loadingIndicator: {
    marginTop: '45%',
  },
});

export enum SearchState {
  NONE = 0,
  SIMPLE = 1,
  ADVANCED = 2,
}

interface IHomePageProps {
  externals: IResource[];
  favorites: IResource[];
  isFetchingSearch: boolean;
  isFetchingSections: boolean;
  navigation: any;
  search: IResource[];
  signets: ISignets;
  sources: string[];
  textbooks: IResource[];

  addFavorite: (id: string, resource: IResource) => any;
  removeFavorite: (id: string, source: Source) => any;
  searchResources: (sources: string[], query: string) => any;
  searchResourcesAdvanced: (fields: IField[], sources: ISources) => any;
}

export const HomePage: React.FunctionComponent<IHomePageProps> = (props: IHomePageProps) => {
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

  useEffect(() => {
    setSearchedResources(props.search);
  }, [props.search]);

  function onSearch(query: string) {
    props.searchResources(props.sources, query);
    setSearchState(SearchState.SIMPLE);
  }

  function onCancelSearch() {
    if (searchBarRef.current) {
      searchBarRef.current.clear();
    }
    if (searchModalRef.current) {
      searchModalRef.current.resetParams();
    }
    setSearchedResources([]);
    setSearchState(SearchState.NONE);
  }

  function showFavorites() {
    setSearchedResources(props.favorites);
    setSearchState(SearchState.SIMPLE);
  }

  function showSearchModal() {
    setSearchModalVisible(true);
    if (searchBarRef.current) {
      searchBarRef.current.blur();
    }
  }

  function hideSearchModal() {
    setSearchModalVisible(false);
  }

  function onAdvancedSearch(fields: IField[], sources: ISources) {
    props.searchResourcesAdvanced(fields, sources);
    setSearchModalVisible(false);
    setSearchState(SearchState.ADVANCED);
    setSearchFields(fields);
  }

  function showResources(resources: IResource[]) {
    setSearchedResources(resources);
    setSearchState(SearchState.SIMPLE);
  }

  return (
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
        />
      ) : (
        <FlatList
          data={sections}
          renderItem={({ item }) => (
            <ResourceGrid
              {...props}
              title={I18n.t(item.title)}
              resources={item.resources}
              onShowAll={showResources}
              size={sections.length > 1 ? 4 : 8}
            />
          )}
          keyExtractor={item => item.title}
          ListHeaderComponent={
            props.favorites.length > 0 ? (
              <FavoritesCarousel {...props} resources={props.favorites} onDisplayAll={showFavorites} />
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
        availableSources={props.sources}
        ref={searchModalRef}
      />
    </View>
  );
};
