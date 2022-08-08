import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import GridList from '~/framework/components/GridList';
import { Small, SmallBold } from '~/framework/components/text';
import { IResource, Source } from '~/modules/mediacentre/reducer';

import { SmallCard } from './SmallCard';

const styles = StyleSheet.create({
  mainContainer: {
    marginBottom: 25, // MO-142 use UI_SIZES.spacing here
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10, // MO-142 use UI_SIZES.spacing here
  },
  titleText: {
    flexShrink: 1,
  },
  displayAllText: {
    color: theme.palette.primary.regular,
    textDecorationLine: 'underline',
  },
});

interface IResourcesGridProps {
  resources: IResource[];
  size: number;
  title: string;

  addFavorite: (id: string, resource: IResource) => any;
  onShowAll: (resources: IResource[]) => void;
  removeFavorite: (id: string, source: Source) => any;
}

export class ResourceGrid extends React.PureComponent<IResourcesGridProps> {
  onShowAll = () => {
    this.props.onShowAll(this.props.resources);
  };

  public render() {
    const { resources, size, title } = this.props;
    return (
      <View style={styles.mainContainer}>
        <View style={styles.headerContainer}>
          <SmallBold style={styles.titleText}>{title.toLocaleUpperCase()}</SmallBold>
          {resources.length > size ? (
            <TouchableOpacity onPress={this.onShowAll}>
              <Small style={styles.displayAllText}>{I18n.t('mediacentre.display-all')}</Small>
            </TouchableOpacity>
          ) : null}
        </View>
        <GridList
          data={resources.slice(0, size)}
          renderItem={({ item }) => <SmallCard {...this.props} resource={item} />}
          keyExtractor={item => item.uid || item.id}
          gap={10}
          gapOutside={10}
        />
      </View>
    );
  }
}
