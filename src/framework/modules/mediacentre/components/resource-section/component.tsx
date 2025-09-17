import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { ResourceSectionProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import FlatList from '~/framework/components/list/flat-list';
import { Svg } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import ResourceCard from '~/framework/modules/mediacentre/components/resource-card';
import { Resource, SectionType } from '~/framework/modules/mediacentre/model';

const ResourceSection: React.FunctionComponent<ResourceSectionProps> = ({
  disableShowAll = false,
  iconName,
  isResourceFavorite,
  onAddFavorite,
  onRemoveFavorite,
  openResourceList,
  resources,
  type,
}) => {
  const headingColor = disableShowAll ? theme.ui.text.regular : theme.palette.primary.regular;

  const renderResource = ({ item }: { item: Resource }) => (
    <ResourceCard
      variant={type === SectionType.PINS ? 'pin' : 'preview'}
      resource={item}
      isFavorite={isResourceFavorite(item.uid)}
      onAddFavorite={() => onAddFavorite(item)}
      onRemoveFavorite={() => onRemoveFavorite(item)}
    />
  );

  const handlePressShowAll = () => openResourceList(resources, type);

  return (
    <View>
      <TouchableOpacity onPress={handlePressShowAll} disabled={disableShowAll} style={styles.headerContainer}>
        {iconName ? <Svg name={iconName} fill={headingColor} width={20} /> : null}
        <BodyText style={{ color: headingColor }}>{I18n.get(`mediacentre-home-section-${type}`)}</BodyText>
        {!disableShowAll ? <Svg name="ui-rafterRight" fill={headingColor} width={20} height={20} /> : null}
      </TouchableOpacity>
      <FlatList
        horizontal
        data={resources.slice(0, 8)}
        renderItem={renderResource}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
        ListFooterComponent={
          resources.length >= 8 && !disableShowAll ? (
            <TertiaryButton
              text={I18n.get('mediacentre-home-resourcesection-action')}
              iconRight="ui-rafterRight"
              action={handlePressShowAll}
            />
          ) : null
        }
        ListFooterComponentStyle={styles.listFooterContainer}
      />
    </View>
  );
};

export default ResourceSection;
