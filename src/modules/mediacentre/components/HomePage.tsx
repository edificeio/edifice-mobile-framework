import I18n from 'i18n-js';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

import { IconButtonText, SearchBar } from './SearchItems';
import { SmallCard } from './SmallCard';
import { SearchContent } from './SearchContent';
import { FavoritesCarousel } from './FavoritesCarousel';
import { AdvancedSearchParams, AdvancedSearchModal, defaultParams } from './AdvancedSearchModal';
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

  function showResources(resources: Resource[]) {
    setSearchedResources(resources);
    setSearchState(SearchState.SIMPLE);
  }

  function onAdvancedSearch(params: AdvancedSearchParams) {
    props.searchResourcesAdvanced(params);
    setSearchModalVisible(false);
    setSearchState(SearchState.ADVANCED);
    setSearchParams(params);
  }

  const ResourcesGrid: React.FunctionComponent<ResourcesGridProps> = (props: ResourcesGridProps) => (
    props.resources && props.resources.length ? (
      <View>
        <View style={styles.categoryHeaderContainer}>
          <TextBold style={{ flexShrink: 1 }}>{props.title.toLocaleUpperCase()}</TextBold>
          <TouchableOpacity onPress={() => showResources(props.resources)}>
            <Text style={styles.displayText}>{I18n.t('mediacentre.display-all')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gridCardsContainer}>
          {props.resources.slice(0, 4).map(item => <SmallCard {...props} resource={item} key={item.id} />)}
        </View>
      </View>
    ) : null
  );

  return (
    <View style={{ flex: 1 }}>
      <SearchBar onSubmitEditing={onSearch} />
      <View style={{ marginLeft: 20, paddingVertical: 10 }}>
        <IconButtonText icon="search" text={I18n.t('mediacentre.advanced-search')} onPress={() => setSearchModalVisible(true)} />
      </View>
      {searchState !== SearchState.NONE ? (
        <SearchContent resources={searchedResources} searchState={searchState} params={searchParams}
        onCancelSearch={onCancelSearch} addFavorite={props.addFavorite} removeFavorite={props.removeFavorite} />
      ) : (
        <ScrollView>
          {props.favorites.length > 0 &&
            <FavoritesCarousel {...props} resources={props.favorites} onDisplayAll={() => showResources(props.favorites)} />
          }
          <ResourcesGrid {...props} title={I18n.t('mediacentre.textbooks')} resources={props.textbooks} />
          <ResourcesGrid {...props} title={I18n.t('mediacentre.gar-ressources')} resources={[]} />
          <ResourcesGrid {...props} title={I18n.t('mediacentre.my-signets')} resources={props.signets.sharedSignets} />
          <ResourcesGrid {...props} title={I18n.t('mediacentre.orientation-signets')} resources={props.signets.orientationSignets} />
        </ScrollView>
      )}
      <AdvancedSearchModal isVisible={searchModalVisible} onSearch={onAdvancedSearch} closeModal={() => setSearchModalVisible(false)} />
    </View>
  );
}
