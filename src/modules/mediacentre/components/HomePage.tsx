import I18n from 'i18n-js';
import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

import { IconButtonText, SearchBar } from './SearchItems';
import { SmallCard } from './SmallCard';
import { SearchContent } from './SearchContent';
import { FavoritesCarousel } from './FavoritesCarousel';
import { AdvancedSearchParams, AdvancedSearchModal, defaultParams } from './AdvancedSearchModal';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { Text, TextBold } from '~/framework/components/text';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';
import { ISignets } from '~/modules/mediacentre/state/signets';

const styles = StyleSheet.create({
  categoryHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  displayText: {
    color: '#F53B56',
    textDecorationLine: 'underline',
  },
  gridCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 5,
  },
})

export enum SearchState {
  NONE = 0,
  SIMPLE = 1,
  ADVANCED = 2
}

interface ResourcesGridProps {
  resources: Resource[];
  title: string;

  addFavorite: (id: string, resource: Resource) => any;
  removeFavorite: (id: string, source: Source) => any;
}

interface HomePageProps {
  favorites: Resource[];
  garResources: Resource[];
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
  const [searchedResources, setSearchedResources] = useState<Resource[]>([]);
  const [searchState, setSearchState] = useState<SearchState>(SearchState.NONE);
  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<AdvancedSearchParams>(defaultParams);
  const sections = [
    { title: 'mediacentre.textbooks', resources: props.textbooks },
    { title: 'mediacentre.gar-resources', resources: props.garResources },
    { title: 'mediacentre.my-signets', resources: props.signets.sharedSignets },
    { title: 'mediacentre.orientation-signets', resources: props.signets.orientationSignets }
  ].filter(section => section.resources.length > 0);

  useEffect(() => {
    setSearchedResources(props.search);
  }, [props.search]);

  function onSearch(query: string) {
    props.searchResources(query);
    setSearchState(SearchState.SIMPLE);
  }

  function onCancelSearch() {
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

  const ResourcesGrid: React.FunctionComponent<ResourcesGridProps> = (props: ResourcesGridProps) => {
    const showResources = () => {
      setSearchedResources(props.resources);
      setSearchState(SearchState.SIMPLE);
    };
    return (
      <View>
        <View style={styles.categoryHeaderContainer}>
          <TextBold style={{ flexShrink: 1 }}>{props.title.toLocaleUpperCase()}</TextBold>
          <TouchableOpacity onPress={showResources}>
            <Text style={styles.displayText}>{I18n.t('mediacentre.display-all')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gridCardsContainer}>
          {props.resources.slice(0, 4).map(item => <SmallCard {...props} resource={item} key={item.id} />)}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SearchBar onSubmitEditing={onSearch} />
      <View style={{ marginLeft: 20, paddingVertical: 10 }}>
        <IconButtonText icon='search' text={I18n.t('mediacentre.advanced-search')} onPress={showSearchModal} />
      </View>
      {searchState !== SearchState.NONE ? (
        <SearchContent resources={searchedResources} searchState={searchState} params={searchParams}
        onCancelSearch={onCancelSearch} addFavorite={props.addFavorite} removeFavorite={props.removeFavorite} />
      ) : (
        <FlatList
          data={sections}
          renderItem={({ item }) => <ResourcesGrid {...props} title={I18n.t(item.title)} resources={item.resources} />}
          keyExtractor={item => item.title}
          ListHeaderComponent={props.favorites.length > 0 ?
            <FavoritesCarousel {...props} resources={props.favorites} onDisplayAll={showFavorites} />
          : null}
          ListEmptyComponent={<EmptyScreen svgImage='empty-mediacentre' title={I18n.t('mediacentre.empty-screen')} />}
        />
      )}
      <AdvancedSearchModal isVisible={searchModalVisible} onSearch={onAdvancedSearch} closeModal={hideSearchModal} />
    </View>
  );
}
