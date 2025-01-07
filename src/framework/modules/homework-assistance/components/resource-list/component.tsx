import React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import FlatList from '~/framework/components/list/flat-list';
import { SmallBoldText } from '~/framework/components/text';
import { Resource } from '~/framework/modules/homework-assistance/model';

import ResourceListItem from './item';
import styles from './styles';
import { ResourceListProps } from './types';

const ResourceList: React.FunctionComponent<ResourceListProps> = ({ resources }) => {
  const renderResource = ({ item }: { item: Resource }) => <ResourceListItem resource={item} />;

  return (
    <View>
      <SmallBoldText style={styles.headingText}>{I18n.get('homeworkassistance-home-resourcelist-heading')}</SmallBoldText>
      <FlatList horizontal data={resources} renderItem={renderResource} contentContainerStyle={styles.listContentContainer} />
    </View>
  );
};

export default ResourceList;
