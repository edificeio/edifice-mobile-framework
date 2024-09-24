import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import GridList from '~/framework/components/GridList';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { Resource, Source } from '~/framework/modules/mediacentre/model';

import { SmallCard } from './SmallCard';

const styles = StyleSheet.create({
  mainContainer: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: UI_SIZES.spacing.small,
  },
  titleText: {
    flexShrink: 1,
  },
  displayAllText: {
    color: theme.palette.primary.regular,
    textDecorationLine: 'underline',
  },
});

interface IResourceGridProps {
  resources: Resource[];
  size: number;
  title: string;
  addFavorite: (id: string, resource: Resource) => any;
  onShowAll: (resources: Resource[]) => void;
  removeFavorite: (id: string, source: Source) => any;
}

export class ResourceGrid extends React.PureComponent<IResourceGridProps> {
  onShowAll = () => {
    this.props.onShowAll(this.props.resources);
  };

  public render() {
    const { resources, size, title } = this.props;
    return (
      <View style={styles.mainContainer}>
        <View style={styles.headerContainer}>
          <SmallBoldText style={styles.titleText}>{title.toLocaleUpperCase()}</SmallBoldText>
          {resources.length > size ? (
            <TouchableOpacity onPress={this.onShowAll}>
              <SmallText style={styles.displayAllText}>{I18n.get('mediacentre-home-showall')}</SmallText>
            </TouchableOpacity>
          ) : null}
        </View>
        <GridList
          data={resources.slice(0, size)}
          renderItem={({ item }) => <SmallCard {...this.props} resource={item} />}
          keyExtractor={item => item.uid || item.id}
          gap={UI_SIZES.spacing.small}
          gapOutside={UI_SIZES.spacing.small}
        />
      </View>
    );
  }
}
