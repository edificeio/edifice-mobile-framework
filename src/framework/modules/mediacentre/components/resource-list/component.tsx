import React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import FlatList from '~/framework/components/list/flat-list';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import ResourceCard from '~/framework/modules/mediacentre/components/resource-card';
import { Resource } from '~/framework/modules/mediacentre/model';

import styles from './styles';
import { ResourceListProps } from './types';

const ResourceList: React.FunctionComponent<ResourceListProps> = ({
  resources,
  sectionKey,
  iconName = 'ui-book',
  openResourceList,
  ...otherProps
}) => {
  const renderResource = ({ item }: { item: Resource }) => <ResourceCard resource={item} {...otherProps} />;

  const handlePressShowAll = () => openResourceList(resources);

  return (
    <View>
      <View style={styles.headerContainer}>
        <NamedSVG name={iconName} fill={theme.ui.text.regular} width={20} />
        <BodyText>{I18n.get(`mediacentre-home-section-${sectionKey}`)}</BodyText>
        <IconButton
          icon="ui-rafterRight"
          color={theme.palette.primary.regular}
          action={handlePressShowAll}
          style={styles.headerButton}
        />
      </View>
      <FlatList
        horizontal
        data={resources}
        renderItem={renderResource}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
      />
    </View>
  );
};

export default ResourceList;
