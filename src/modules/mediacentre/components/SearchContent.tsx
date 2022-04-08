import I18n from 'i18n-js';
import * as React from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';

import { EmptyScreen } from '~/framework/components/emptyScreen';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';
import { Icon } from '~/ui';
import { DialogButtonOk } from '~/ui/ConfirmDialog';
import { Text, TextBold } from '~/ui/Typography';

import { AdvancedSearchParams, Field } from './AdvancedSearchModal';
import { BigCard } from './BigCard';
import { SearchState } from './HomePage';
import { SearchFilter } from './SearchFilter';

const styles = StyleSheet.create({
  fieldContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
  parametersContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  upperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourcesContainer: {
    flexDirection: 'row',
  },
  sourceImage: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#F53B56',
  },
  fieldsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  mainContainer: {
    flex: 1,
  },
  filterContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
});

interface AdvancedSearchFieldProps {
  field: Field;
}

interface SearchParamsProps {
  params: AdvancedSearchParams;
  searchState: SearchState;

  onCancelSearch: () => void;
}

interface SearchContentProps {
  params: AdvancedSearchParams;
  resources?: any[];
  searchState: SearchState;

  addFavorite: (id: string, resource: Resource) => any;
  onCancelSearch: () => void;
  removeFavorite: (id: string, source: Source) => any;
}

const AdvancedSearchField: React.FunctionComponent<AdvancedSearchFieldProps> = (props: AdvancedSearchFieldProps) =>
  props.field.value !== '' ? (
    <View style={styles.fieldContainer}>
      <TextBold>{I18n.t(`mediacentre.advancedSearch.${props.field.name}`)}</TextBold>
      <Text> {props.field.value}</Text>
    </View>
  ) : null;

const SearchParams: React.FunctionComponent<SearchParamsProps> = (props: SearchParamsProps) => (
  <View style={styles.parametersContainer}>
    <View style={styles.upperContainer}>
      <View style={styles.sourcesContainer}>
        {props.searchState === SearchState.SIMPLE || props.params.sources.GAR ? (
          <Image source={require('ASSETS/images/logo-gar.png')} style={styles.sourceImage} />
        ) : null}
        {props.searchState === SearchState.SIMPLE || props.params.sources.Moodle ? (
          <Image source={require('ASSETS/images/logo-moodle.png')} style={styles.sourceImage} />
        ) : null}
        {props.searchState === SearchState.SIMPLE || props.params.sources.Signets ? (
          <Icon name="bookmark_outline" size={24} />
        ) : null}
      </View>
      <DialogButtonOk style={styles.cancelButton} label={I18n.t('mediacentre.cancel-search')} onPress={props.onCancelSearch} />
    </View>
    {props.searchState === SearchState.ADVANCED ? (
      <View style={styles.fieldsContainer}>
        <AdvancedSearchField field={props.params.title} />
        <AdvancedSearchField field={props.params.authors} />
        <AdvancedSearchField field={props.params.editors} />
        <AdvancedSearchField field={props.params.disciplines} />
        <AdvancedSearchField field={props.params.levels} />
      </View>
    ) : null}
  </View>
);

export const SearchContent: React.FunctionComponent<SearchContentProps> = (props: SearchContentProps) => (
  <View style={styles.mainContainer}>
    <SearchParams {...props} />
    <FlatList
      data={props.resources}
      renderItem={({ item }) => {
        return <BigCard {...props} resource={item} />;
      }}
      keyExtractor={item => item.id}
      ListHeaderComponent={<SearchFilter buttons={[]} containerStyle={styles.filterContainer} />}
      ListEmptyComponent={<EmptyScreen svgImage="empty-mediacentre" title={I18n.t('mediacentre.empty-search')} />}
    />
  </View>
);
