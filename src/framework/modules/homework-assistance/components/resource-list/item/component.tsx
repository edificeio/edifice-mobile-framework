import React from 'react';

import { View } from 'react-native';
import { TouchCardWithoutPadding } from '~/framework/components/card/base';
import { CaptionText, SmallActionText } from '~/framework/components/text';
import { openUrl } from '~/framework/util/linking';
import { Image } from '~/framework/util/media';

import styles from './styles';
import { ResourceListItemProps } from './types';

const ResourceListItem: React.FunctionComponent<ResourceListItemProps> = ({ resource }) => {
  const handlePress = () => openUrl(resource.url);

  return (
    <TouchCardWithoutPadding onPress={handlePress} style={styles.mainContainer}>
      <View style={styles.rowContainer}>
        <Image source={{ uri: resource.pictureUrl }} style={styles.imageContainer} resizeMode="contain" />
        <SmallActionText numberOfLines={3} style={styles.nameText}>
          {resource.name}
        </SmallActionText>
      </View>
      <CaptionText>{resource.description}</CaptionText>
    </TouchCardWithoutPadding>
  );
};

export default ResourceListItem;
