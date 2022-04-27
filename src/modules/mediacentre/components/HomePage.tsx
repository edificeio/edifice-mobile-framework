import I18n from 'i18n-js';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import GridList from '~/framework/components/GridList';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { Text, TextBold } from '~/framework/components/text';
import { ISignets } from '~/modules/mediacentre/state/signets';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';

import { AdvancedSearchModal, AdvancedSearchParams, defaultParams } from './AdvancedSearchModal';
import { FavoritesCarousel } from './FavoritesCarousel';
import { SearchContent } from './SearchContent';
import { IconButtonText, SearchBar } from './SearchItems';
import { SmallCard } from './SmallCard';

const styles = StyleSheet.create({
  gridMainContainer: {
    marginBottom: 25,
  },
  gridHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  gridTitleText: {
    flexShrink: 1,
  },
  gridDisplayAllText: {
    color: theme.color.secondary.regular,
    textDecorationLine: 'underline',
  },
  mainContainer: {
    flex: 1,
  },
  advancedSearchButtonContainer: {
    marginLeft: 20,
    paddingVertical: 10,
  },
});

export enum SearchState {
  NONE = 0,
  SIMPLE = 1,
  ADVANCED = 2,
}

interface ResourcesGridProps {
  resources: Resource[];
  title: string;

  addFavorite: (id: string, resource: Resource) => any;
  removeFavorite: (id: string, source: Source) => any;
}

interface HomePageProps {
  externals: Resource[];
  favorites: Resource[];
  navigation: any;
  search: Resource[];
  signets: ISignets;
  textbooks: Resource[];

  addFavorite: (id: string, resource: Resource) => any;
  removeFavorite: (id: string, source: Source) => any;
  searchResources: (query: string) => any;
  searchResourcesAdvanced: (params: AdvancedSearchParams) => any;
}

export const HomePage: React.FunctionComponent<HomePageProps> = (props: HomePageProps) => {
  const searchBarRef = useRef<TextInput>(null);
  const searchModalRef = useRef(null);
  const [searchedResources, setSearchedResources] = useState<Resource[]>([]);
  const [searchState, setSearchState] = useState<SearchState>(SearchState.NONE);
  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<AdvancedSearchParams>(defaultParams);
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
    props.searchResources(query);
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
  }

  function hideSearchModal() {
    setSearchModalVisible(false);
  }

  function onAdvancedSearch(params: AdvancedSearchParams) {
    props.searchResourcesAdvanced(params);
    setSearchModalVisible(false);
    setSearchState(SearchState.ADVANCED);
    setSearchParams(params);
  }

  const ResourcesGrid: React.FunctionComponent<ResourcesGridProps> = (gridProps: ResourcesGridProps) => {
    const showResources = () => {
      setSearchedResources(gridProps.resources);
      setSearchState(SearchState.SIMPLE);
    };
    return (
      <View style={styles.gridMainContainer}>
        <View style={styles.gridHeaderContainer}>
          <TextBold style={styles.gridTitleText}>{gridProps.title.toLocaleUpperCase()}</TextBold>
          <TouchableOpacity onPress={showResources}>
            <Text style={styles.gridDisplayAllText}>{I18n.t('mediacentre.display-all')}</Text>
          </TouchableOpacity>
        </View>
        <GridList
          data={gridProps.resources.slice(0, 4)}
          renderItem={({ item }) => <SmallCard {...gridProps} resource={item} />}
          keyExtractor={item => item.uid || item.id}
          gap={10}
          gapOutside={10}
        />
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <SearchBar onSubmitEditing={onSearch} inputRef={searchBarRef} />
      <View style={styles.advancedSearchButtonContainer}>
        <IconButtonText icon="search" text={I18n.t('mediacentre.advanced-search')} onPress={showSearchModal} />
      </View>
      {searchState !== SearchState.NONE ? (
        <SearchContent
          resources={searchedResources}
          searchState={searchState}
          params={searchParams}
          onCancelSearch={onCancelSearch}
          addFavorite={props.addFavorite}
          removeFavorite={props.removeFavorite}
        />
      ) : (
        <FlatList
          data={sections}
          renderItem={({ item }) => <ResourcesGrid {...props} title={I18n.t(item.title)} resources={item.resources} />}
          keyExtractor={item => item.title}
          ListHeaderComponent={
            props.favorites.length > 0 ? (
              <FavoritesCarousel {...props} resources={props.favorites} onDisplayAll={showFavorites} />
            ) : null
          }
          ListEmptyComponent={<EmptyScreen svgImage="empty-mediacentre" title={I18n.t('mediacentre.empty-screen')} />}
        />
      )}
      <AdvancedSearchModal
        isVisible={searchModalVisible}
        onSearch={onAdvancedSearch}
        closeModal={hideSearchModal}
        ref={searchModalRef}
      />
    </View>
  );
};
